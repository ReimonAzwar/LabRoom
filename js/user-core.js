/* ═══════════════════════════════════════
   CONFIGURATION & STATE
═══════════════════════════════════════ */
const API_BASE_URL = "http://localhost:8000/api";
let allBookings = [];
let allRooms = [];

/* ═══════════════════════════════════════
   DATA LOADER (API)
═══════════════════════════════════════ */
async function fetchData() {
  try {
    const [roomsRes, bookingsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/rooms`),
      fetch(`${API_BASE_URL}/bookings`)
    ]);
    
    allRooms = await roomsRes.json();
    allBookings = await bookingsRes.json();
    
    renderSidebar();
    initUserPage();
  } catch (error) {
    console.error("Gagal memuat data server:", error);
    showToast("Gagal terhubung ke server", "error");
  }
}

/* ═══════════════════════════════════════
   UTILITIES
═══════════════════════════════════════ */
function toMin(t) { 
  const [h, m] = t.split(':').map(Number); 
  return h * 60 + m; 
}

function getConflicts(ruanganName, tanggal, mulai, selesai) {
  const s = toMin(mulai), e = toMin(selesai);
  const roomObj = allRooms.find(r => r.name === ruanganName);
  const roomId = roomObj ? roomObj.id : null;
 
  return allBookings.filter(b => {
    const bTanggal = b.tanggal.split('T')[0].split(' ')[0];
    return b.ruangan === ruangan && 
           b.tanggal === tanggal && 
           b.status !== 'ditolak' &&
           s < toMin(b.jam_selesai) && e > toMin(b.jam_mulai);
  });
}

function showToast(message, type = "success") {

  const toast = document.createElement("div");
  toast.className = `toast-notif ${type}`;
  toast.innerText = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

/* ═══════════════════════════════════════
   UI RENDERING
═══════════════════════════════════════ */
function renderTimeline(ruangan, tanggal) {
  const wrapper = document.getElementById('peta-jadwal-wrapper');
  const bar = document.getElementById('timeline-bar');
  const title = document.getElementById('peta-title');

  if (!ruangan || !tanggal) return;

  wrapper.style.display = 'block';
  const tglIndo = new Date(tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  title.innerHTML = `Jadwal Terisi: ${ruangan} (${tglIndo})`;
  bar.innerHTML = '';

  // 1. Ambil jadwal yang sudah Approved dari database
  const booked = allBookings.filter(b => 
    b.ruangan === ruangan && 
    b.tanggal === tanggal && 
    b.status !== 'ditolak' 
  );
  
  const dayStart = 7 * 60; // 07:00
  const dayEnd = 17 * 60;   // 17:00
  const totalMin = dayEnd - dayStart;

  booked.forEach(b => {
    const start = toMin(b.jam_mulai), end = toMin(b.jam_selesai);
    const left = ((start - dayStart) / totalMin) * 100;
    const width = ((end - start) / totalMin) * 100;

    const slot = document.createElement('div');
    slot.className = 'booked-slot';
    slot.style.left = `${Math.max(0, left)}%`;
    slot.style.width = `${Math.min(100 - left, width)}%`;
    slot.innerHTML = `<span>${b.jam_mulai.substring(0,5)} - ${b.jam_selesai.substring(0,5)}</span>`;
    bar.appendChild(slot);
  });

  validateBookingTime();
}

function validateBookingTime() {
  const r = document.getElementById('f-ruangan').value;
  const t = document.getElementById('f-tanggal').value;
  const m = document.getElementById('f-mulai').value;
  const s = document.getElementById('f-selesai').value;
  const btn = document.getElementById('submit-btn');
  const inputM = document.getElementById('f-mulai');
  const inputS = document.getElementById('f-selesai');

  if (r && t && m && s) {
    const conflicts = getConflicts(r, t, m, s);
    if (conflicts.length > 0) {
      inputM.classList.add('err');
      inputS.classList.add('err');
      btn.disabled = true;
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> Jadwal Bentrok!`;
      btn.style.background = "var(--red)";
    } else {
      inputM.classList.remove('err');
      inputS.classList.remove('err');
      inputM.classList.add('ok');
      inputS.classList.add('ok');
      btn.disabled = false;
      btn.style.background = "linear-gradient(135deg,var(--teal),var(--teal2))";
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> Kirim Pemesanan`;
    }
  }
}

function renderSidebar() {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const hhmm = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');

  document.getElementById('room-status-list').innerHTML = allRooms.map(r => {
    let dot, label;
    if (r.status === 'maintenance') { dot = 'pt'; label = 'Maintenance'; }
    else if (r.status === 'closed') { dot = 'bs'; label = 'Ditutup'; }
    else {
      const busyNow = allBookings.some(b => 
        b.ruangan === r.name && b.tanggal === today && b.status === 'disetujui' &&
        toMin(b.jam_mulai) <= toMin(hhmm) && toMin(hhmm) < toMin(b.jam_selesai)
      );
      dot = busyNow ? 'bs' : 'av';
      label = busyNow ? 'Sedang Terpakai' : 'Tersedia';
    }
    return `
      <div class="room-row" onclick="openRoomCal('${r.name}')">
        <span class="rdot ${dot}"></span>
        <span class="rname">${r.name}</span>
        <span class="rstatus">${label}</span>
      </div>`;
  }).join('');
}

function initUserPage() {
  const container = document.getElementById('room-grid');
  if (!container) return;

  container.innerHTML = ''
}

/* ═══════════════════════════════════════
   BOOKING ACTIONS
═══════════════════════════════════════ */
async function submitBooking() {
  const btn = document.getElementById('submit-btn');

  const selectedRoomName = document.getElementById('f-ruangan').value;
  const roomObj = allRooms.find(r => r.name === selectedRoomName);
  
  const payload = {
    room_id: roomObj ? roomObj.id : null,
    nama: document.getElementById('f-nama').value.trim(),
    instansi: document.getElementById('f-inst').value.trim(),
    kontak: document.getElementById('f-kontak').value.trim(),
    ruangan: document.getElementById('f-ruangan').value,
    tanggal: document.getElementById('f-tanggal').value,
    jam_mulai: document.getElementById('f-mulai').value,
    jam_selesai: document.getElementById('f-selesai').value,
    keperluan: document.getElementById('f-kep').value.trim(),
    status: 'pending'
  };

  if (!payload.room_id || Object.values(payload).some(val => !val)) {
    showToast("Harap isi semua kolom!", "error");
    return;
  }

 if (allBookings.length > 0 && getConflicts(payload.ruangan, payload.tanggal, payload.jam_mulai, payload.jam_selesai).length > 0) {
    showToast("Jadwal sudah terisi!", "error");
    return;
  }

  btn.disabled = true;
  btn.innerText = "Mengirim...";

  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      showToast("Pemesanan Berhasil!", "success");
      await fetchData(); // Ambil data terbaru dari server
      renderSuccessState(payload);
    } else {
      const err = await response.json();
      alert(err.message || "Gagal menyimpan ke database", "error");
    }
  } catch (error) {
    console.error("Error:", error);
    showToast("Gagal terhubung ke server", "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `
    <svg viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg> Kirim Pemesanan`;
  }
}

function scrollToBooking() {
  const section = document.getElementById('booking-section');
  if (section) section.scrollIntoView({ behavior: 'smooth' });

  if (!document.getElementById('booking-form')) injectFormCard();
}

/* ═══════════════════════════════════════
   CHATBOT LOGIC
═══════════════════════════════════════ */

function toggleChat() {
  const box = document.getElementById('chat-box');
  box.classList.toggle('active');
}
function addMessage(text, sender) {
  // DISESUAIKAN: Menggunakan id="messages" sesuai index.html Anda
  const container = document.getElementById('messages');
  if (!container) return;

  const msg = document.createElement('div');
  msg.className = `message ${sender}`;
  msg.innerHTML = `<div class="bubble">${text}</div>`;
  container.appendChild(msg);
  
  container.scrollTop = container.scrollHeight;
}

function injectFormCard() {
  const container = document.getElementById('messages');
  if (!container || document.getElementById('booking-form-card')) return;

  const card = document.createElement('div');
  card.className = 'message bot';
  card.id = 'booking-form-card';
  card.style.width = '100%';
  card.style.maxWidth = '100%'; 
  
  const roomOptions = allRooms
    .filter(r => r.status === 'available')
    .map(r => `<option value="${r.name}">${r.name}</option>`)
    .join('');

  card.innerHTML = `
    <div class="form-card">
      <div class="fc-section-label">DATA PEMOHON</div>
      <div class="fc-row">
        <div class="fc-field">
          <label class="fc-label">Nama Lengkap <span class="req">*</span></label>
          <input type="text" id="f-nama" class="fc-input" placeholder="contoh: Budi Santoso">
        </div>
        <div class="fc-field">
          <label class="fc-label">Instansi / Fakultas <span class="req">*</span></label>
          <input type="text" id="f-inst" class="fc-input" placeholder="contoh: Teknik Informatika">
        </div>
      </div>
      <div class="fc-field">
        <label class="fc-label">No. HP / Email <span class="req">*</span></label>
        <input type="text" id="f-kontak" class="fc-input" placeholder="081234567890 atau nama@email.com">
      </div>
      <div class="fc-divider"></div>
      <div class="fc-section-label">DETAIL PEMESANAN</div>
      <div class="fc-row">
        <div class="fc-field">
          <label class="fc-label">Ruangan <span class="req">*</span></label>
          <select id="f-ruangan" class="fc-input">
            <option value="" disabled selected>— Pilih Ruangan —</option>
            ${roomOptions}
          </select>
        </div>
        <div class="fc-field">
          <label class="fc-label">Tanggal Pemakaian <span class="req">*</span></label>
          <input type="date" id="f-tanggal" class="fc-input">
        </div>
      </div>

      <!-- TEMPAT PETA JADWAL (Sesuai image_4f71bf.png) -->
      <div id="peta-jadwal-wrapper" style="display:none; margin: 15px 0;">
        <div class="fc-section-label" id="peta-title" style="color: var(--text2); font-size: 12px;">Peta Jadwal</div>
        <div class="timeline-bar" id="timeline-bar"></div>
        <div class="timeline-labels">
          <span>07:00</span><span>09:00</span><span>11:00</span><span>13:00</span><span>15:00</span><span>17:00</span>
        </div>
      </div>

      <div class="fc-row">
        <div class="fc-field">
          <label class="fc-label">Rentang Jam Pemakaian <span class="req">*</span> (07:00 – 17:00)</label>
          <div class="time-row">
            <input type="time" id="f-mulai" class="fc-input">
            <span class="time-sep">—</span>
            <input type="time" id="f-selesai" class="fc-input">
          </div>
        </div>
      </div>
      <div class="fc-field">
        <label class="fc-label">Keperluan / Keterangan <span class="req">*</span></label>
        <input type="text" id="f-kep" class="fc-input" placeholder="contoh: Praktikum Basis Data">
      </div>
      <button onclick="submitBooking()" id="submit-btn" class="fc-submit">Kirim Pemesanan</button>
    </div>
  `;
  
  container.appendChild(card);
  container.scrollTop = container.scrollHeight;

  const inputs = ['f-mulai', 'f-selesai', 'f-ruangan', 'f-tanggal'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    ['change', 'input'].forEach(evt => {
      el.addEventListener(evt, () => {
        const r = document.getElementById('f-ruangan').value;
        const t = document.getElementById('f-tanggal').value;
        const m = document.getElementById('f-mulai').value;
        const s = document.getElementById('f-selesai').value;

        if (r && t) renderTimeline(r, t); 
      
        if (r && t && m && s) {
        // Logika konflik Anda tetap sama...
          const conflicts = getConflicts(r, t, m, s);
          const inputM = document.getElementById('f-mulai');
          const inputS = document.getElementById('f-selesai');
          if (conflicts.length > 0) {
            inputM.classList.replace('ok', 'err'); inputS.classList.replace('ok', 'err');
          } else {
            inputM.classList.add('ok'); inputS.classList.add('ok');
            inputM.classList.remove('err'); inputS.classList.remove('err');
          }
        }
      });
    });
  });
}

function renderSuccessState(payload) {
  const card = document.getElementById('booking-form-card');
  if (card) {
    // Format tanggal untuk tampilan yang lebih manis
    const opsiTanggal = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const tanggalTampil = new Date(payload.tanggal).toLocaleDateString('id-ID', opsiTanggal);

    card.innerHTML = `
      <div class="form-card success-state-improved">
        <div class="success-icon-large">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        
        <h3 class="success-title">Pemesanan Terkirim!</h3>
        <p class="success-subtitle">
          Admin akan meninjau dan menghubungi Anda melalui<br>
          <strong>${payload.kontak}</strong>
        </p>

        <div class="summary-table">
          <div class="s-row">
            <span class="s-label">Ruangan</span>
            <span class="s-value">${payload.ruangan}</span>
          </div>
          <div class="s-row">
            <span class="s-label">Tanggal</span>
            <span class="s-value">${tanggalTampil}</span>
          </div>
          <div class="s-row">
            <span class="s-label">Waktu</span>
            <span class="s-value">${payload.jam_mulai} — ${payload.jam_selesai}</span>
          </div>
        </div>

        <div class="status-badge-waiting">
          <span class="dot-orange"></span> Menunggu konfirmasi admin
        </div>

        <button onclick="location.reload()" class="btn-new-booking">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg> Buat Pemesanan Baru
        </button>
      </div>
    `;
  }
}

/* ═══════════════════════════════════════
   INITIALIZATION
═══════════════════════════════════════ */
window.onload = async () => {
  await fetchData();

  setTimeout(() => {
    addMessage("Halo! Selamat datang di LabRoom. Silakan langsung isi formulir di bawah untuk melakukan reservasi.", "bot");
    injectFormCard();
  }, 500);
};