@extends('layouts.admin')

@section('content')
<div class="header">
    <h1>Tinjauan Reservasi</h1>
    <p style="color: var(--text-muted); margin-top: 0.5rem;">Tinjau dan kelola permintaan reservasi kelas dari pengguna</p>
</div>

<div class="glass-card">
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Pemesan</th>
                <th>Instansi</th>
                <th>Ruangan</th>
                <th>Jadwal</th>
                <th>Status</th>
                <th>Aksi</th>
            </tr>
        </thead>
        <tbody>
            @foreach($bookings as $booking)
            <tr>
                <td>{{ $booking->id }}</td>
                <td>
                    <div style="font-weight: 600;">{{ $booking->nama }}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">{{ $booking->kontak }}</div>
                </td>
                <td>{{ $booking->instansi }}</td>
                <td>{{ $booking->room ? $booking->room->nama_ruang : 'N/A' }}</td>
                <td>
                    <div>{{ \Carbon\Carbon::parse($booking->tanggal)->format('d M Y') }}</div>
                    <div style="font-size: 0.85rem; color: var(--accent);">{{ date('H:i', strtotime($booking->jam_mulai)) }} - {{ date('H:i', strtotime($booking->jam_selesai)) }}</div>
                </td>
                <td>
                    <span class="badge badge-{{ $booking->status }}">{{ ucfirst($booking->status) }}</span>
                </td>
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        <form action="{{ route('bookings.update', $booking->id) }}" method="POST">
                            @csrf
                            @method('PUT')
                            <input type="hidden" name="status" value="disetujui">
                            <button type="submit" class="btn btn-success" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" {{ $booking->status == 'disetujui' ? 'disabled' : '' }}>Setujui</button>
                        </form>
                        <form action="{{ route('bookings.update', $booking->id) }}" method="POST">
                            @csrf
                            @method('PUT')
                            <input type="hidden" name="status" value="ditolak">
                            <button type="submit" class="btn btn-danger" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" {{ $booking->status == 'ditolak' ? 'disabled' : '' }}>Tolak</button>
                        </form>
                    </div>
                </td>
            </tr>
            @endforeach
            @if($bookings->isEmpty())
            <tr>
                <td colspan="7" style="text-align: center; color: var(--text-muted);">Belum ada permintaan reservasi.</td>
            </tr>
            @endif
        </tbody>
    </table>
</div>
@endsection
