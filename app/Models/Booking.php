<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'room_id', 'nama', 'instansi', 'kontak', 'ruangan',
        'tanggal', 'jam_mulai', 'jam_selesai', 'keperluan',
        'status'
    ];

    public function room() {
        return $this->belongsTo(Room::class, 'room_id');
    }
}
