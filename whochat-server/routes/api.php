<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController;

Route::post('/connect', [ChatController::class, 'connect']);
Route::post('/send', [ChatController::class, 'sendMessage']);
Route::post('/disconnect', [ChatController::class, 'disconnect']);
Route::post('/reconnect', [ChatController::class, 'reconnect']);
