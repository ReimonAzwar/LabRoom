<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'nama',
        'instansi',
        'kontak',
        'tanggal',
        'jam_mulai',
        'jam_selesai',
        'keperluan',
        'status'
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
