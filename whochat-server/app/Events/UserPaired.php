<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class UserPaired implements ShouldBroadcastNow
{
    use SerializesModels;

    public $your_id;
    public $partner_id;

    public function __construct($your_id, $partner_id)
    {
        $this->your_id = $your_id;
        $this->partner_id = $partner_id;
    }

    public function broadcastOn()
    {
        // Ensure channel subscription
        return new Channel('chat.' . $this->your_id); // Listen on private-chat.{userId}
    }

    public function broadcastAs()
    {
        return 'UserPaired'; 
    }
}
