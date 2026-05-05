<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function index()
    {
        $rooms = Room::all();
        return view('admin.rooms.index', compact('rooms'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_ruang' => 'required|string|max:255',
            'status' => 'required|in:dibuka,maintenance,ditutup'
        ]);

        Room::create($request->all());
        return redirect()->route('rooms.index')->with('success', 'Ruangan berhasil ditambahkan');
    }

    public function update(Request $request, Room $room)
    {
        $request->validate([
            'status' => 'required|in:dibuka,maintenance,ditutup'
        ]);

        $room->update(['status' => $request->status]);
        return redirect()->route('rooms.index')->with('success', 'Status ruangan berhasil diperbarui');
    }
}
