<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Room;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
    \App\Models\User::create([
        'username' => 'admin',
        'password' => bcrypt('lab2026'),
    ]);

    \App\Models\Room::create([
        'nama_ruangan' => 'Lab_Komputer B',
        'kapasitas' => 30,
        'status' => 'tersedia'
    ]);
    
    }
}
