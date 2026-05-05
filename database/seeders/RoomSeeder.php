<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Room;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rooms = [
            ['nama_ruang' => 'Lab Komputer A', 'kapasitas' => 30, 'fasilitas' => '30 PC, Proyektor, AC, WiFi, Whiteboard', 'status' => 'dibuka'],
            ['nama_ruang' => 'Lab Komputer B', 'kapasitas' => 30, 'fasilitas' => '30 PC, Proyektor, AC, WiFi, Printer', 'status' => 'dibuka'],
            ['nama_ruang' => 'Lab Jaringan', 'kapasitas' => 24, 'fasilitas' => '24 PC, Rack Server, Switch, Router, Kabel UTP', 'status' => 'dibuka'],
            ['nama_ruang' => 'Lab Elektronika', 'kapasitas' => 20, 'fasilitas' => 'Osiloskop, PCB, Solder, Power Supply, Multimeter', 'status' => 'dibuka'],
            ['nama_ruang' => 'Ruang Seminar', 'kapasitas' => 60, 'fasilitas' => 'Meja Bundar, Proyektor, Sound System, AC, Papan Tulis', 'status' => 'dibuka'],
            ['nama_ruang' => 'Ruang Rapat', 'kapasitas' => 15, 'fasilitas' => 'Meja Rapat, Proyektor, TV, AC, Whiteboard', 'status' => 'dibuka'],
        ];

        foreach ($rooms as $room) {
            Room::create($room);
        }
    }
}
