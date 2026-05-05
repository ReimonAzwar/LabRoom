<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $fillable = ['nama_ruang', 'kapasitas', 'fasilitas', 'status', 'batas_tutup'];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
