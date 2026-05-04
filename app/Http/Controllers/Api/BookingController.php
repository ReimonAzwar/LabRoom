<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking; 
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validasi Input dari Frontend
        $validated = $request->validate([
            'room_id'     => 'required|exists:rooms,id',
            'nama'        => 'required|string|max:255',
            'instansi'    => 'required|string|max:255',
            'kontak'      => 'required|string',
            'tanggal'     => 'required|date',
            'jam_mulai'   => 'required',
            'jam_selesai' => 'required|after:jam_mulai',
            'keperluan'   => 'required|string',
        ]);

        // 2. Logika Cek Bentrok Jadwal (Database Query)
        $conflict = Booking::where('room_id', $request->room_id)
            ->where('tanggal', $request->tanggal)
            ->where('status', '!=', 'ditolak') // Booking yang ditolak tidak dianggap bentrok
            ->where(function ($query) use ($request) {
                $query->whereBetween('jam_mulai', [$request->jam_mulai, $request->jam_selesai])
                      ->orWhereBetween('jam_selesai', [$request->jam_mulai, $request->jam_selesai])
                      ->orWhere(function ($q) use ($request) {
                          $q->where('jam_mulai', '<=', $request->jam_mulai)
                            ->where('jam_selesai', '>=', $request->jam_selesai);
                      });
            })->exists();

        // 3. Jika Bentrok, Kirim Error ke Frontend
        if ($conflict) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Maaf, jadwal pada jam tersebut sudah dipesan oleh orang lain.'
            ], 409);
        }

        // 4. Jika Aman, Simpan ke Database
        $booking = Booking::create($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Pemesanan berhasil diajukan! Menunggu persetujuan admin.',
            'data'    => $booking
        ], 201);
    }
    
    // Fungsi index untuk melihat daftar booking (opsional)
    public function index()
    {
        try {
            $bookings = Booking::with('room')->get();
            return response()->json($bookings, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request, $id) {
        $booking = Booking::findorFail($id);
        $booking->update(['status' => $request->status]);
        return response()->json(['message' => 'Status updated']);
    }
    
    public function update(Request $request, $id) {
        $booking = Booking::findOrFail($id);
        $validated = $request->validate([
            'nama'        => 'required|string|max:255',
            'tanggal'     => 'required|date',
            'jam_mulai'   => 'required',
            'jam_selesai' => 'required',
            'keperluan'   => 'required|string',
        ]);

        $booking->update($validated);

        return response()->json(['message' => 'Pemesanan berhasil diperbaharui']);
    }
}