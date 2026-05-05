<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Room;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index()
    {
        $bookings = Booking::with('room')->orderBy('tanggal', 'desc')->get();
        return view('admin.bookings.index', compact('bookings'));
    }

    public function create()
    {
        $rooms = Room::where('status', 'dibuka')->get();
        return view('admin.bookings.create', compact('rooms'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'nama' => 'required|string|max:255',
            'instansi' => 'required|string|max:255',
            'kontak' => 'required|string|max:255',
            'tanggal' => 'required|date',
            // Sometimes HTML time inputs include seconds or not, let's keep validation simple
            'jam_mulai' => 'required',
            'jam_selesai' => 'required',
            'keperluan' => 'required|string|max:255',
        ]);

        Booking::create(array_merge($request->all(), ['status' => 'disetujui']));

        return redirect()->route('bookings.index')->with('success', 'Reservasi berhasil dibuat.');
    }

    public function update(Request $request, Booking $booking)
    {
        $request->validate([
            'status' => 'required|in:pending,disetujui,ditolak'
        ]);

        $booking->update(['status' => $request->status]);
        return redirect()->route('bookings.index')->with('success', 'Status reservasi berhasil diperbarui.');
    }
}
