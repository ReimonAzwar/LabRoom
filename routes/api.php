<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\RoomController;

// Public API (frontend)
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/bookings', [BookingController::class, 'index']);
Route::post('/bookings', [BookingController::class, 'store']);
Route::put('/bookings/{id}', [BookingController::class, 'update']);
//Admin
Route::post('/login', [AuthController::class, 'login']);

//Protected API
Route::middleware('auth:sanctum')->group(function() {
    Route::put('/rooms/{id}', [RoomController::class, 'update']);
    Route::put('/rooms/{id}/status', [RoomController::class, 'updateStatus']);
    Route::put('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
    Route::put('/bookings/{id}', [BookingController::class, 'update']);
    Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);
    Route::post('/logout', [AuthController::class, 'logout']);
});