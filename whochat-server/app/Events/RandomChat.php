<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class RandomChat implements ShouldBroadcast
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

    public function broadcastOn()
    {
        return new Channel('random-chat');
    }

    public function broadcastAs()
    {
        return 'random.chat.message';
    }
}
