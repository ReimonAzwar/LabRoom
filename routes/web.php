<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ApiController;

Route::get('/', function () {
    return view('user');
});

Route::get('/admin', function () {
    return view('admin_panel');
});

// API Routes for JS frontend
Route::prefix('api')->group(function() {
    Route::get('/rooms', [ApiController::class, 'getRooms']);
    Route::post('/rooms/{name}', [ApiController::class, 'updateRoom']);
    
    Route::get('/bookings', [ApiController::class, 'getBookings']);
    Route::post('/bookings', [ApiController::class, 'storeBooking']);
    Route::post('/bookings/{id}', [ApiController::class, 'updateBooking']);
    Route::post('/bookings/{id}/status', [ApiController::class, 'updateBookingStatus']);
    Route::delete('/bookings/{id}', [ApiController::class, 'deleteBooking']);
});
