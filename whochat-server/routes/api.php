<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Broadcast;

Broadcast::routes(['middleware' => []]);


Route::post('/connect', [ChatController::class, 'connect']);
Route::post('/send', [ChatController::class, 'sendMessage']);
Route::post('/disconnect', [ChatController::class, 'disconnect']);
Route::post('/reconnect', [ChatController::class, 'reconnect']);
Route::get('/status', [ChatController::class, 'status']);
Route::post('/heartbeat', [ChatController::class, 'heartbeat']);

Route::get('/test-broadcast', [ChatController::class, 'triggerTestBroadcast']);