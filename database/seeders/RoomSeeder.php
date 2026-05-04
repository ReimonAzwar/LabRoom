<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            ['name' => 'Lab Komputer 1', 'cap' => 30, 'fasilitas' => 'PC, AC, Proyektor', 'status' => 'available'],
            ['name' => 'Lab Komputer 2', 'cap' => 25, 'fasilitas' => 'PC, AC', 'status' => 'available'],
            ['name' => 'Ruang Rapat Utama', 'cap' => 15, 'fasilitas' => 'Meja Oval, AC, Smart TV', 'status' => 'maintenance'],
        ];

        foreach ($rooms as $room) {
            \App\Models\Room::create($room);
        }
    }
}
