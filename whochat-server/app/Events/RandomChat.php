<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class RandomChat implements ShouldBroadcastNow
{
    use SerializesModels;

    public $message;
    public $from;
    public $to;

    public function __construct($message, $from, $to)
    {
        $this->message = $message;
        $this->from = $from;
        $this->to = $to;
    }

    /**
     * The channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        // Broadcast to the channel of the receiver (user-specific channel)
        return new Channel('chat.' . $this->to);  // This is targeting 'chat.{userId}' channel
    }

    /**
     * The name of the event to broadcast.
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'random.chat.message';  // This is the event name the frontend will listen for
    }
}
