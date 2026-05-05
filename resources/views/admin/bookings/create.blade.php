@extends('layouts.admin')

@section('content')
<div class="header">
    <h1>Buat Reservasi (Admin)</h1>
    <p style="color: var(--text-muted); margin-top: 0.5rem;">Admin dapat membuat reservasi yang otomatis disetujui</p>
</div>

<div class="glass-card" style="max-width: 800px;">
    <form action="{{ route('bookings.store') }}" method="POST">
        @csrf
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <!-- Column 1 -->
            <div>
                <div class="form-group">
                    <label for="nama">Nama Lengkap</label>
                    <input type="text" id="nama" name="nama" required value="{{ old('nama') }}" placeholder="Nama pemesan">
                </div>
                
                <div class="form-group">
                    <label for="instansi">Instansi / Fakultas / Jurusan</label>
                    <input type="text" id="instansi" name="instansi" required value="{{ old('instansi') }}">
                </div>
                
                <div class="form-group">
                    <label for="kontak">Kontak (Email / No. HP)</label>
                    <input type="text" id="kontak" name="kontak" required value="{{ old('kontak') }}">
                </div>

                <div class="form-group">
                    <label for="keperluan">Keperluan</label>
                    <textarea id="keperluan" name="keperluan" rows="4" required>{{ old('keperluan') }}</textarea>
                </div>
            </div>

            <!-- Column 2 -->
            <div>
                <div class="form-group">
                    <label for="room_id">Ruangan</label>
                    <select id="room_id" name="room_id" required>
                        <option value="">-- Pilih Ruangan --</option>
                        @foreach($rooms as $room)
                            <option value="{{ $room->id }}" {{ old('room_id') == $room->id ? 'selected' : '' }}>{{ $room->nama_ruang }}</option>
                        @endforeach
                    </select>
                </div>

                <div class="form-group">
                    <label for="tanggal">Tanggal</label>
                    <input type="date" id="tanggal" name="tanggal" required value="{{ old('tanggal') }}">
                </div>
                
                <div style="display: flex; gap: 1rem;">
                    <div class="form-group" style="flex: 1;">
                        <label for="jam_mulai">Jam Mulai</label>
                        <input type="time" id="jam_mulai" name="jam_mulai" required value="{{ old('jam_mulai') }}">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="jam_selesai">Jam Selesai</label>
                        <input type="time" id="jam_selesai" name="jam_selesai" required value="{{ old('jam_selesai') }}">
                    </div>
                </div>
                
                <div style="margin-top: 2rem;">
                    <button type="submit" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1.1rem;">Submit Reservasi (Otomatis Disetujui)</button>
                </div>
            </div>
        </div>
    </form>
</div>
@endsection
