<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\RandomChat;
use Illuminate\Support\Facades\Cache;

class ChatController extends Controller
{
    /**
     * Handle user connection request.
     * Try to find another waiting user, or wait if none found.
     */
    public function connect(Request $request)
    {
        $user_id = uniqid();
    
        if (!Cache::has('online_users')) {
            Cache::put('online_users', 0, now()->addDays(1));
        }
        if (!Cache::has('waiting_users')) {
            Cache::put('waiting_users', [], now()->addDays(1));
        }
    
        Cache::increment('online_users');
    
        $waiting_users = Cache::get('waiting_users', []);
    
        if (!empty($waiting_users)) {
            // Take the first waiting user
            $waiting_user = array_shift($waiting_users);
    
            // Save updated waiting list back
            Cache::put('waiting_users', $waiting_users, now()->addMinutes(5));
    
            $this->pairUsers($user_id, $waiting_user);
    
            return response()->json([
                'message' => 'Paired!',
                'your_id' => $user_id,
                'partner_id' => $waiting_user,
            ]);
        } else {
            // No one waiting, add this user to the waiting list
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
            $waiting_users = array_values($waiting_users); // Reindex array
            Cache::put('waiting_users', $waiting_users, now()->addMinutes(5));
        }

        // Decrement online users
        Cache::decrement('online_users');

        // Broadcast a disconnection event
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
        $online = Cache::get('online_users', 0);
        $waiting_users = Cache::get('waiting_users', []);
        $waiting = count($waiting_users);
    
        return response()->json([
            'online_users' => $online,
            'waiting_users' => $waiting,
        ]);
    }
    


    /**
     * Helper function to broadcast connection event between two users.
     */
    private function pairUsers($user1, $user2)
    {
        // Notify both users that they are now connected
        broadcast(new RandomChat('Connected!', $user1, $user2));
        broadcast(new RandomChat('Connected!', $user2, $user1));
    }
}
