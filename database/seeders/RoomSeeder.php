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
            ['name' => 'Lab Terpadu 1', 'cap' => 40, 'fasilitas' => '40 PC, Proyektor, AC, WiFi, Whiteboard', 'status' => 'available'],
            ['name' => 'Lab Terpadu 2', 'cap' => 40, 'fasilitas' => '40 PC, Proyektor, AC, WiFi, Whiteboard', 'status' => 'available'],
            ['name' => 'Lab Terpadu 3', 'cap' => 40, 'fasilitas' => '40 PC, Proyektor, AC, WiFi, Whiteboard', 'status' => 'available'],
        ];

        foreach ($rooms as $room) {
            Room::create($room);
        }
    }
}
