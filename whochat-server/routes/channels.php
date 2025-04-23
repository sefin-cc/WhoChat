<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.{userId}', function ($user, $userId) {
    return true; // Allow anyone to join any chat.{userId} channel
});

Broadcast::channel('test-channel', function () {
    return true;
});