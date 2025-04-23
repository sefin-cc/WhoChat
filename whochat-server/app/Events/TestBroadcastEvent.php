<?php

namespace App\Events; // Corrected namespace declaration

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class TestBroadcastEvent implements ShouldBroadcastNow
{
    public $message;

    // Constructor
    public function __construct($message)
    {
        $this->message = $message;
    }

    // Channel for the event
    public function broadcastOn()
    {
        return new Channel('test-channel');
    }

    // Optional: This specifies the event name
    public function broadcastAs()
    {
        return 'test.message';
    }
}
