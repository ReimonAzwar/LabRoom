<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Room;

class RoomController extends Controller
{
    public function index() {
        $rooms = Room::all();
        return response()->json($rooms);
    }

    public function update(Request $request, $id) {
        $room = Room::findOrFail($id);
        $room->update([
            'cap' => $request->cap,
            'fasilitas' => $request->fasilitas,
            'status' => $request->status,
            'closedUntil' => $request->closedUntil,
    ]);
    
    return response()->json(['message' => 'Berhasil']);
    
    }
}
