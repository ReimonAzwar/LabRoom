<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Room;
use App\Models\Booking;
use Carbon\Carbon;

class ApiController extends Controller
{
    public function getRooms()
    {
        $rooms = Room::all();
        // Return in format expected by JS
        $data = $rooms->map(function ($room) {
            return [
                'id' => $room->id,
                'name' => $room->name,
                'cap' => $room->cap,
                'fasilitas' => $room->fasilitas,
                'status' => $room->status,
                'closedUntil' => $room->closedUntil
            ];
        });
        return response()->json($data);
    }

    public function getBookings()
    {
        $bookings = Booking::with('room')->get();
        $data = $bookings->map(function ($b) {
            return [
                'id' => $b->id,
                'ruangan_id' => $b->room_id,
                'ruangan' => $b->room ? $b->room->name : 'Unknown',
                'nama' => $b->nama,
                'instansi' => $b->instansi,
                'kontak' => $b->kontak,
                'tanggal' => $b->tanggal,
                'jamMulai' => substr($b->jam_mulai, 0, 5),
                'jamSelesai' => substr($b->jam_selesai, 0, 5),
                'keperluan' => $b->keperluan,
                'status' => $b->status == 'disetujui' ? 'approved' : ($b->status == 'ditolak' ? 'rejected' : 'pending'),
                'createdAt' => $b->created_at->toIso8601String()
            ];
        });
        return response()->json($data);
    }

    public function storeBooking(Request $request)
    {
        $request->validate([
            'room_name' => 'required',
            'nama' => 'required',
            'instansi' => 'nullable',
            'kontak' => 'required',
            'tanggal' => 'required|date',
            'jamMulai' => 'required',
            'jamSelesai' => 'required',
            'keperluan' => 'required',
        ]);

        $room = Room::where('name', $request->room_name)->first();
        if (!$room) return response()->json(['success' => false, 'message' => 'Room not found'], 404);

        $booking = Booking::create([
            'room_id' => $room->id,
            'nama' => $request->nama,
            'instansi' => $request->instansi,
            'kontak' => $request->kontak,
            'tanggal' => $request->tanggal,
            'jam_mulai' => $request->jamMulai,
            'jam_selesai' => $request->jamSelesai,
            'keperluan' => $request->keperluan,
            'status' => 'pending'
        ]);

        return response()->json(['success' => true, 'booking_id' => $booking->id]);
    }

    public function updateBookingStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:approved,rejected,pending']);
        $booking = Booking::findOrFail($id);
        
        $dbStatus = $request->status == 'approved' ? 'disetujui' : ($request->status == 'rejected' ? 'ditolak' : 'pending');
        $booking->update(['status' => $dbStatus]);

        return response()->json(['success' => true]);
    }

    public function deleteBooking($id)
    {
        $booking = Booking::findOrFail($id);
        $booking->delete();
        return response()->json(['success' => true]);
    }

    public function updateRoom(Request $request, $name)
    {
        $room = Room::where('name', $name)->firstOrFail();
        
        if ($request->has('cap')) $room->cap = $request->cap;
        if ($request->has('fasilitas')) $room->fasilitas = $request->fasilitas;
        if ($request->has('status')) {
            $room->status = $request->status;
        }
        if ($request->has('closedUntil')) $room->closedUntil = $request->closedUntil ?: null;

        $room->save();
        return response()->json(['success' => true]);
    }

    public function updateBooking(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);
        
        if ($request->has('nama')) $booking->nama = $request->nama;
        if ($request->has('tanggal')) $booking->tanggal = $request->tanggal;
        if ($request->has('jamMulai')) $booking->jam_mulai = $request->jamMulai;
        if ($request->has('jamSelesai')) $booking->jam_selesai = $request->jamSelesai;
        if ($request->has('keperluan')) $booking->keperluan = $request->keperluan;

        $booking->save();
        return response()->json(['success' => true]);
    }
}
