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
        $this->cleanup();
    
        $user_id = uniqid();
    
        if (!Cache::has('waiting_users')) {
            Cache::put('waiting_users', [], now()->addDays(1));
        }
    
        // Save this user's status
        Cache::put('user_' . $user_id, 'online', now()->addSeconds(30)); // Expires after 30 seconds if no heartbeat
    
        // Add to online users list
        $online_users = Cache::get('online_users_list', []);
        $online_users[] = $user_id;
        Cache::put('online_users_list', $online_users, now()->addSeconds(30));  // refresh 30s expiry
    
        $waiting_users = Cache::get('waiting_users', []);
    
        if (!empty($waiting_users)) {
            $waiting_user = array_shift($waiting_users);
            Cache::put('waiting_users', $waiting_users, now()->addMinutes(5));
    
            $this->pairUsers($user_id, $waiting_user);
    
            return response()->json([
                'message' => 'Paired!',
                'your_id' => $user_id,
                'partner_id' => $waiting_user,
            ]);
        } else {
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
        $this->cleanup();
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
    $this->cleanup();

    $user_id = $request->input('user_id');
    
    // Remove from waiting users if found
    $waiting_users = Cache::get('waiting_users', []);
    if (($key = array_search($user_id, $waiting_users)) !== false) {
        unset($waiting_users[$key]);
        $waiting_users = array_values($waiting_users);
        Cache::put('waiting_users', $waiting_users, now()->addMinutes(5));
    }
    
    
    // Find the partner
    $partner_id = Cache::get('partner_' . $user_id);
    
    if ($partner_id) {
        // Notify the partner that the user disconnected
        broadcast(new RandomChat("{$user_id}-Disconnected", $user_id, $partner_id));
        
        // Remove the partner mappings from cache
        Cache::forget('partner_' . $user_id);
        Cache::forget('partner_' . $partner_id);
        
      
        broadcast(new RandomChat("{$partner_id}-Disconnected", $partner_id, $user_id)); // notify partner
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
        $this->cleanup();

        $user_id = $request->input('user_id');
    
        // First, disconnect from the current partner if exists
        $partner_id = Cache::get('partner_' . $user_id);
        if ($partner_id) {
            // Notify the partner
            broadcast(new RandomChat("{$user_id}-Disconnected", $user_id, $partner_id));
    
            // Remove partner mappings
            Cache::forget('partner_' . $user_id);
            Cache::forget('partner_' . $partner_id);
    
            // Notify the user
            broadcast(new RandomChat("{$partner_id}-Disconnected", $partner_id, $user_id));
        }
    
        // Now try to find a new partner
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
        $this->cleanup();
    
        $online_users_list = Cache::get('online_users_list', []);
        $alive_users = [];
    
        foreach ($online_users_list as $user_id) {
            if (Cache::has('user_' . $user_id)) {
                $alive_users[] = $user_id;
            }
        }
    
        // Save updated alive list
        Cache::put('online_users_list', $alive_users, now()->addSeconds(30));
    
        $waiting_users = Cache::get('waiting_users', []);
        $waiting = count($waiting_users);
    
        return response()->json([
            'online_users' => count($alive_users),
            'waiting_users' => $waiting,
        ]);
    }
    
    
    public function heartbeat(Request $request)
    {
        $user_id = $request->input('user_id');
        if ($user_id) {
            Cache::put('user_' . $user_id, 'online', now()->addSeconds(30));
    
            $online_users = Cache::get('online_users_list', []);
            if (!in_array($user_id, $online_users)) {
                $online_users[] = $user_id;
            }
    
            // Always refresh the full online_users_list expiration
            Cache::put('online_users_list', $online_users, now()->addSeconds(30));
    
            // Check Partner's heartbeat 
            $partner_id = Cache::get('partner_' . $user_id);
            if ($partner_id && !Cache::has('user_' . $partner_id)) {
                // Partner is dead, clean up
                $this->forceDisconnect($partner_id);
                $this->forceDisconnect($user_id); // Also clean up own mapping to partner
            }
    
            return response()->json(['status' => 'Heartbeat received']);
        }
        return response()->json(['status' => 'Missing user_id'], 400);
    }
    
    
    

    /**
     * Helper function to broadcast connection event between two users.
     */
    private function pairUsers($user1, $user2)
    {
        $this->cleanup();

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
            } else {
                // User is dead, fully clean up
                $this->forceDisconnect($user_id);
            }
        }

        // Save only alive users back to waiting list
        Cache::put('waiting_users', $alive_waiting, now()->addMinutes(5));
    }

    /**
     * Fully remove user from the system if heartbeat is missing
     */
    private function forceDisconnect($user_id)
    {

        // Remove partner if exists
        $partner_id = Cache::get('partner_' . $user_id);

        if ($partner_id) {
            if (Cache::has('user_' . $partner_id)) {
                // Notify partner only if they are alive
                broadcast(new RandomChat("{$user_id}-Disconnected", $user_id, $partner_id));
                broadcast(new RandomChat("{$partner_id}-Disconnected", $partner_id, $user_id));
            }
            Cache::forget('partner_' . $partner_id);
        }

        Cache::forget('partner_' . $user_id);
        $online_users = Cache::get('online_users_list', []);
        $online_users = array_filter($online_users, fn($id) => $id !== $user_id);
        Cache::put('online_users_list', array_values($online_users), now()->addSeconds(30));
    }

    

    public function triggerTestBroadcast()
    {
        broadcast(new TestBroadcastEvent('This is a test broadcast message!'));

        return response()->json(['status' => 'Test broadcast sent']);
    }

}
