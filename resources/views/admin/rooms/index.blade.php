@extends('layouts.admin')

@section('content')
<div class="header">
    <h1>Manajemen Ruangan</h1>
    <p style="color: var(--text-muted); margin-top: 0.5rem;">Atur ketersediaan dan status ruangan Laboratorium Terpadu</p>
</div>

<div class="glass-card">
    <div class="flex-between" style="margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.25rem;">Daftar Ruangan</h2>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Nama Ruangan</th>
                <th>Status Saat Ini</th>
                <th>Ubah Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($rooms as $room)
            <tr>
                <td>{{ $room->id }}</td>
                <td style="font-weight: 600;">{{ $room->nama_ruang }}</td>
                <td>
                    <span class="badge badge-{{ $room->status }}">{{ ucfirst($room->status) }}</span>
                </td>
                <td>
                    <form action="{{ route('rooms.update', $room->id) }}" method="POST" style="display: flex; gap: 0.5rem;">
                        @csrf
                        @method('PUT')
                        <select name="status" style="width: auto; padding: 0.4rem; font-size: 0.85rem;" onchange="this.form.submit()">
                            <option value="dibuka" {{ $room->status == 'dibuka' ? 'selected' : '' }}>Dibuka</option>
                            <option value="maintenance" {{ $room->status == 'maintenance' ? 'selected' : '' }}>Maintenance</option>
                            <option value="ditutup" {{ $room->status == 'ditutup' ? 'selected' : '' }}>Ditutup</option>
                        </select>
                    </form>
                </td>
            </tr>
            @endforeach
            @if($rooms->isEmpty())
            <tr>
                <td colspan="4" style="text-align: center; color: var(--text-muted);">Belum ada data ruangan.</td>
            </tr>
            @endif
        </tbody>
    </table>
</div>

<div class="glass-card" style="max-width: 500px;">
    <h2 style="font-size: 1.25rem; margin-bottom: 1.5rem;">Tambah Ruangan Baru</h2>
    <form action="{{ route('rooms.store') }}" method="POST">
        @csrf
        <div class="form-group">
            <label for="nama_ruang">Nama Ruangan</label>
            <input type="text" id="nama_ruang" name="nama_ruang" required placeholder="Contoh: Lab Komputer 1">
        </div>
        <div class="form-group">
            <label for="status">Status Awal</label>
            <select id="status" name="status" required>
                <option value="dibuka">Dibuka</option>
                <option value="maintenance">Maintenance</option>
                <option value="ditutup">Ditutup</option>
            </select>
        </div>
        <button type="submit" class="btn btn-primary">Simpan Ruangan</button>
    </form>
</div>
@endsection
