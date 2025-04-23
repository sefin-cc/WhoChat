<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\RandomChat;
use Illuminate\Support\Facades\Cache;
use App\Events\TestBroadcastEvent;

class ChatController extends Controller
{
    /**
     * Handle user connection request.
     * Try to find another waiting user, or wait if none found.
     */
    public function connect()
    {
        $user_id = uniqid();
    
        // Check if the 'online_users' and 'waiting_users' exist in cache
        if (!Cache::has('online_users')) {
            Cache::put('online_users', 0, now()->addDays(1));
        }
    
        if (!Cache::has('waiting_users')) {
            Cache::put('waiting_users', [], now()->addDays(1));
        }
    
        // Check if the user already exists
        if (!Cache::has('user_' . $user_id)) {
            // If the user does not exist, increment the online users count
            Cache::increment('online_users');
        }
    
        // Save this user's status
        Cache::put('user_' . $user_id, 'online', now()->addSeconds(30)); // Expires after 30 seconds if no heartbeat
    
        $waiting_users = Cache::get('waiting_users', []);
    
        if (!empty($waiting_users)) {
            // If there's a waiting user, pair them up
            $waiting_user = array_shift($waiting_users);
            Cache::put('waiting_users', $waiting_users, now()->addMinutes(5));
    
            // Pair the users
            $this->pairUsers($user_id, $waiting_user);
    
            return response()->json([
                'message' => 'Paired!',
                'your_id' => $user_id,
                'partner_id' => $waiting_user,
            ]);
        } else {
            // If no waiting user, add the current user to the waiting list
            $waiting_users[] = $user_id;
            Cache::put('waiting_users', $waiting_users, now()->addMinutes(5));
    
            return response()->json([
                'message' => 'Waiting for a partner...',
                'your_id' => $user_id,
            ]);
        }
    }
    
    

    /**
     * Handle sending a message from one user to another.
     */
    public function sendMessage(Request $request)
    {
        $message = $request->input('message');
        $from = $request->input('from');
        $to = $request->input('to');

        // Broadcast the message to the receiving user
        broadcast(new RandomChat($message, $from, $to));

        return response()->json(['status' => 'Message sent']);
    }

    /**
     * Handle user disconnection.
     * Removes user from waiting queue if necessary and broadcasts disconnection.
     */
  public function disconnect(Request $request)
{
    $user_id = $request->input('user_id');
    
    // Remove from waiting users if found
    $waiting_users = Cache::get('waiting_users', []);
    if (($key = array_search($user_id, $waiting_users)) !== false) {
        unset($waiting_users[$key]);
        $waiting_users = array_values($waiting_users);
        Cache::put('waiting_users', $waiting_users, now()->addMinutes(5));
    }
    
    // Decrement online users
    Cache::decrement('online_users');
    
    // Find the partner
    $partner_id = Cache::get('partner_' . $user_id);
    
    if ($partner_id) {
        // Notify the partner that the user disconnected
        broadcast(new RandomChat("{$user_id}-Disconnected", $user_id, $partner_id));
        
        // Remove the partner mappings from cache
        Cache::forget('partner_' . $user_id);
        Cache::forget('partner_' . $partner_id);
        
        // Send a message to both users
        broadcast(new RandomChat("{$partner_id}-Disconnected", $partner_id, $user_id)); // notify partner
       // broadcast(new RandomChat("{$partner_id}-Disconnected", $user_id, $partner_id)); // notify user
    }

    // Broadcast the user's own disconnection
    broadcast(new RandomChat('Disconnected', $user_id, null));

    return response()->json(['status' => 'Disconnected']);
}


    /**
     * Handle user reconnection to find a new partner.
     * Try to pair with someone new or wait if no one is available.
     */
    public function reconnect(Request $request)
    {
        $user_id = $request->input('user_id');
    
        if (!Cache::has('waiting_users')) {
            Cache::put('waiting_users', [], now()->addDays(1));
        }
    
        $waiting_users = Cache::get('waiting_users', []);
    
        if (!empty($waiting_users)) {
            $waiting_user = array_shift($waiting_users);
    
            Cache::put('waiting_users', $waiting_users, now()->addMinutes(5));
    
            $this->pairUsers($user_id, $waiting_user);
    
            return response()->json([
                'message' => 'Re-Paired!',
                'your_id' => $user_id,
                'partner_id' => $waiting_user,
            ]);
        } else {
            $waiting_users[] = $user_id;
            Cache::put('waiting_users', $waiting_users, now()->addMinutes(5));
    
            return response()->json([
                'message' => 'Waiting again for a chatter...',
                'your_id' => $user_id,
            ]);
        }
    }
    
    
    public function status()
    {
        // First, clean up expired users from the waiting list
        $this->cleanup();
    
        // Get the number of online users and the number of waiting users
        $online = Cache::get('online_users', 0);
        $waiting_users = Cache::get('waiting_users', []);
        $waiting = count($waiting_users);
    
        // Return the status as JSON
        return response()->json([
            'online_users' => $online,
            'waiting_users' => $waiting,
        ]);
    }
    
    
    public function heartbeat(Request $request)
    {
        $user_id = $request->input('user_id');
        if ($user_id) {
            Cache::put('user_' . $user_id, 'online', now()->addSeconds(30));
            return response()->json(['status' => 'Heartbeat received']);
        }
        return response()->json(['status' => 'Missing user_id'], 400);
    }
    

    /**
     * Helper function to broadcast connection event between two users.
     */
    private function pairUsers($user1, $user2)
    {
        Cache::put('partner_' . $user1, $user2, now()->addMinutes(30));
        Cache::put('partner_' . $user2, $user1, now()->addMinutes(30));

        // Fire UserPaired Event for BOTH users
        broadcast(new \App\Events\UserPaired($user1, $user2));
        broadcast(new \App\Events\UserPaired($user2, $user1));
    }

    private function cleanup()
    {
        $waiting_users = Cache::get('waiting_users', []);
        $alive_waiting = [];

        foreach ($waiting_users as $user_id) {
            if (Cache::has('user_' . $user_id)) {
                $alive_waiting[] = $user_id;
            }
        }

        Cache::put('waiting_users', $alive_waiting, now()->addMinutes(5));
    }

    public function triggerTestBroadcast()
    {
        broadcast(new TestBroadcastEvent('This is a test broadcast message!'));

        return response()->json(['status' => 'Test broadcast sent']);
    }

}
