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
        $user_id = uniqid(); // Generate a unique ID for the new user

        // Try to find a user already waiting in cache
        $waiting_user = Cache::pull('waiting_user');

        if ($waiting_user && $waiting_user !== $user_id) {
            // If found, immediately pair this user with the waiting user
            $this->pairUsers($user_id, $waiting_user);

            return response()->json([
                'message' => 'Paired!',
                'your_id' => $user_id,
                'partner_id' => $waiting_user,
            ]);
        } else {
            // No waiting user found, put this user into waiting list
            Cache::put('waiting_user', $user_id, now()->addMinutes(5)); // Wait for 5 mins

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

        // If user was waiting, remove them from the queue
        if (Cache::get('waiting_user') === $user_id) {
            Cache::forget('waiting_user');
        }

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

        // Try to find another waiting user
        $waiting_user = Cache::pull('waiting_user');

        if ($waiting_user && $waiting_user !== $user_id) {
            // Pair with the new waiting user
            $this->pairUsers($user_id, $waiting_user);

            return response()->json([
                'message' => 'Re-Paired!',
                'your_id' => $user_id,
                'partner_id' => $waiting_user,
            ]);
        } else {
            // No user available, put yourself back into waiting
            Cache::put('waiting_user', $user_id, now()->addMinutes(5));

            return response()->json([
                'message' => 'Waiting again for a chatter...',
                'your_id' => $user_id,
            ]);
        }
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
