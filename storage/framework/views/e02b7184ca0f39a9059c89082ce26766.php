<?php $__env->startSection('content'); ?>
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
            <?php $__currentLoopData = $rooms; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $room): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <tr>
                <td><?php echo e($room->id); ?></td>
                <td style="font-weight: 600;"><?php echo e($room->nama_ruang); ?></td>
                <td>
                    <span class="badge badge-<?php echo e($room->status); ?>"><?php echo e(ucfirst($room->status)); ?></span>
                </td>
                <td>
                    <form action="<?php echo e(route('rooms.update', $room->id)); ?>" method="POST" style="display: flex; gap: 0.5rem;">
                        <?php echo csrf_field(); ?>
                        <?php echo method_field('PUT'); ?>
                        <select name="status" style="width: auto; padding: 0.4rem; font-size: 0.85rem;" onchange="this.form.submit()">
                            <option value="dibuka" <?php echo e($room->status == 'dibuka' ? 'selected' : ''); ?>>Dibuka</option>
                            <option value="maintenance" <?php echo e($room->status == 'maintenance' ? 'selected' : ''); ?>>Maintenance</option>
                            <option value="ditutup" <?php echo e($room->status == 'ditutup' ? 'selected' : ''); ?>>Ditutup</option>
                        </select>
                    </form>
                </td>
            </tr>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            <?php if($rooms->isEmpty()): ?>
            <tr>
                <td colspan="4" style="text-align: center; color: var(--text-muted);">Belum ada data ruangan.</td>
            </tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<div class="glass-card" style="max-width: 500px;">
    <h2 style="font-size: 1.25rem; margin-bottom: 1.5rem;">Tambah Ruangan Baru</h2>
    <form action="<?php echo e(route('rooms.store')); ?>" method="POST">
        <?php echo csrf_field(); ?>
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
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.admin', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\xampp\htdocs\ChatbotLab\resources\views/admin/rooms/index.blade.php ENDPATH**/ ?>