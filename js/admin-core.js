
let allBookings = [];
const API_BASE_URL = "http://localhost:8000/api"

async function loadRooms() {
  const response = await fetch(`${API_BASE_URL}/rooms`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('admin-token')}`,
      'Accept': 'application/json'
    }
  });
  return await response.json();
}

async function loadBookings() {
  try {const response = await fetch(`${API_BASE_URL}/bookings`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('admin-token')}`,
      'Accept': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Gagal mengambil data');
    return await response.json();
  } catch (error) {
    console.error(error);
    return []; // Kembalikan array kosong agar .filter() tidak error
  }
}

function toMin(t){ const[h,m]=t.split(':').map(Number); return h*60+m; }

function togglePw(){
  const inp=document.getElementById('inp-pw');
  const off=document.getElementById('eye-off');
  const on=document.getElementById('eye-on');
  if(inp.type==='password'){ inp.type='text'; off.style.display='none'; on.style.display=''; }
  else { inp.type='password'; on.style.display='none'; off.style.display=''; }
}

async function doLogin(){
  const user = document.getElementById('inp-user').value;
  const pass = document.getElementById('inp-pw').value;
  const btn = document.getElementById('login-btn');
  const errBox = document.getElementById('login-err');
  const errText = document.getElementById('login-err-text');

  btn.innerText = "Mengecek...";
  btn.disabled = true;

  try {
    const response =  await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ username: user, password: pass })
    });
    
    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('admin-token', data.token);
      
      document.getElementById('login-page').style.display = 'none';
      document.getElementById('admin-page').style.display = 'block';
      document.getElementById('logged-user').innerText = user;

      renderAdmin();
      renderRoomsPanel();
    }
    else {
      errBox.style.display = 'flex';
      errText.innerText = data.message || "Username atau password salah";
    }
  }
  catch (error) {
    errBox.style.display = 'flex';
    errText.innerText = "Gagal terhubung ke server";
  }
  finally {
    btn.innerText = "Masuk ke Dashboard";
    btn.disabled = false;
  }
}

function doLogout(){
  localStorage.removeItem('admin-token');
}

/* ═══════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════ */
let filterStatus='all', searchQ='';

async function renderAdmin() {
  allBookings = await loadBookings();

  document.getElementById('s-total').textContent = allBookings.length;
  document.getElementById('s-pending').textContent = allBookings.filter(b => b.status === 'pending').length;
  document.getElementById('s-approved').textContent = allBookings.filter(b => b.status === 'disetujui').length;
  document.getElementById('s-rejected').textContent = allBookings.filter(b => b.status === 'ditolak').length;
  
  document.getElementById('a-total').textContent = allBookings.length;
  document.getElementById('a-pending').textContent = allBookings.filter(b => b.status === 'pending').length;
  
  renderTable(allBookings);
}

 function renderTable(dataRaw) {
  let data= dataRaw || allBookings;
  
  if(!Array.isArray(data)) return;
  if(filterStatus !== 'all') data = data.filter(b => b.status === filterStatus);
  if(searchQ) data = data.filter(b =>
    b.nama.toLowerCase().includes(searchQ) ||
    b.room.name.toLowerCase().includes(searchQ) ||
    b.instansi.toLowerCase().includes(searchQ)
  );
  
  data.sort((a,b)=> b.id - a.id); // newest first

  const el=document.getElementById('blist');
  if(!data.length){
    el.innerHTML=`<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><br>Tidak ada data pemesanan</div>`;
    return;
  }

  const fmtDate=d=>{ const[y,m,dd]=d.split('-'); return `${dd}/${m}/${y}`; };

  el.innerHTML=data.map(b=>{
    const tc = b.status === 'pending' ? 'pending' : b.status === 'disetujui' ? 'approved' : 'rejected';
    const tl = b.status === 'pending' ? 'Menunggu' : b.status === 'disetujui' ? 'Disetujui' : 'Ditolak';

    const acts=b.status==='pending'
      ?`<button class="abtn ap" onclick="openModal(${b.id})">Tinjau</button>
        <button class="abtn ar" onclick="decide(${b.id},'rejected')">Tolak</button>`
      :`<button class="abtn done" disabled>${tl}</button>`;

    return `<div class="brow">
      <div class="c"><div class="cname">${b.nama}</div><div class="csub">${b.kontak}</div></div>
      <div class="c col-inst">${b.instansi}</div>
      <div class="c">${b.room.name}</div>
      <div class="c col-time">${fmtDate(b.tanggal)}<br><span style="color:var(--text3);font-size:11px">${b.jam_mulai} – ${b.jam_selesai}</span></div>
      <div class="c"><span class="tag ${tc}"><span class="tdot"></span>${tl}</span></div>
      <div class="acts">${acts}</div>
    </div>`;
  }).join('');
}

/* ── ROOM MANAGEMENT ── */
let rmgmtName='', rmgmtStatus='available';

async function saveRoomMgmt() {
  const roomsList = await loadRooms();
  const r = roomsList.find(x => x.name === rmgmtName);
  
  if (!r) {
    closeRoomMgmt();
    return;
  }

  const payload = {
    cap: parseInt(document.getElementById('rmgmt-cap').value) || r.cap,
    fasilitas: document.getElementById('rmgmt-fasilitas').value.trim(),
    status: rmgmtStatus,
    closedUntil: (rmgmtStatus === 'available') ? null : document.getElementById('rmgmt-until').value
  };

  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${r.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      closeRoomMgmt();
      await renderRoomsPanel(); 
      showToast('Data ruangan berhasil diperbarui!', 'success');
    } else {
      const err = await response.json();
      showToast(err.message || 'Gagal menyimpan data', 'warn');
    }
  } catch (error) {
    showToast('Koneksi server bermasalah', 'error');
  }
}

/* ── ROOMS PANEL (sidebar section) ── */

async function renderRoomsPanel(){
  const statusLabels={available:'Tersedia',maintenance:'Maintenance',closed:'Ditutup'};
  
  // Ambil data langsung dari database
  const roomsList = await loadRooms();

  // Aside sidebar
  const asideEl=document.getElementById('aside-rooms');
  if(asideEl){
    asideEl.innerHTML=roomsList.map(r=>{
      const stCol=r.status==='available'?'var(--green)':r.status==='maintenance'?'var(--amber)':'var(--red)';
      return `<div class="aside-item" onclick="openRoomCalendar('${r.name}')" style="position:relative">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:15px;height:15px;flex-shrink:0"><rect x="2" y="3" width="20" height="14" rx="3"/><path d="M8 21h8M12 17v4"/></svg>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12.5px">${r.name}</span>
        <span style="width:7px;height:7px;border-radius:50%;background:${stCol};flex-shrink:0;display:inline-block"></span>
        <button onclick="event.stopPropagation();openRoomMgmt('${r.name}')" style="background:none;border:none;cursor:pointer;color:var(--text3);padding:0 0 0 4px;font-size:14px;line-height:1;transition:color .15s" title="Kelola ruangan" onmouseover="this.style.color='var(--teal)'" onmouseout="this.style.color='var(--text3)'">⚙</button>
      </div>`;
    }).join('');
  }

  // Main panel cards
  const panelEl=document.getElementById('room-panel-list');
  if(!panelEl) return;
  panelEl.innerHTML=roomsList.map(r=>{
    const stCls=r.status==='available'?'available':r.status==='maintenance'?'maintenance':'closed';
    const stLbl=statusLabels[r.status]||r.status;
    const untilTxt=r.closedUntil?` s/d ${r.closedUntil.split('-').reverse().join('/')}`:'';
    return `<div class="room-stat-card">
      <div class="room-stat-info">
        <div class="room-stat-name">${r.name}</div>
        <div class="room-stat-detail">Kapasitas: ${r.cap} orang</div>
        ${r.fasilitas?`<div class="room-stat-detail" style="margin-top:3px;color:var(--text3);font-size:11px">${r.fasilitas}</div>`:''}
      </div>
      <div class="room-stat-right">
        <span class="rstag ${stCls}">${stLbl}${untilTxt}</span>
        <button class="btn-edit-room" onclick="openRoomMgmt('${r.name}')">Edit</button>
      </div>
    </div>`;
  }).join('');

  // Refresh calendar if open
  if(typeof rcRoom!=='undefined' && rcRoom) renderRoomCalendar();
}

/* ── NAVIGATION ── */
function navTo(section, btn){
  document.querySelectorAll('.aside-item').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  if(section==='dashboard' || section === 'all'){
    filterStatus='all';
  } else if(section==='pending'){
    filterStatus='pending';
  } else if(section === 'approved'){
    filterStatus='disetujui';
  }
  renderTable();
}

/* ── ROOM CALENDAR ── */
let rcRoom='', rcYear=0, rcMonth=0, rcSelectedDate='';

function openRoomCalendar(room){
  rcRoom=room;
  const now=new Date();
  rcYear=now.getFullYear(); rcMonth=now.getMonth();
  rcSelectedDate='';
  document.getElementById('rc-title').textContent='Jadwal: '+room;
  document.getElementById('rc-sub').textContent='Klik tanggal untuk melihat detail reservasi';
  renderRoomCalendar();
  document.getElementById('room-cal-overlay').classList.add('show');
}
function closeRoomCalendar(){
  document.getElementById('room-cal-overlay').classList.remove('show');
  document.getElementById('rc-day-detail').style.display='none';
}
document.getElementById('room-cal-overlay').addEventListener('click',function(e){if(e.target===this)closeRoomCalendar();});

function rcChangeMonth(dir){
  rcMonth+=dir;
  if(rcMonth>11){rcMonth=0;rcYear++;}
  if(rcMonth<0){rcMonth=11;rcYear--;}
  renderRoomCalendar();
}

function renderRoomCalendar(){
  const mn=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  document.getElementById('rc-month-label').textContent=mn[rcMonth]+' '+rcYear;
  const days=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  const list=allBookings.filter(b => b.room.name === rcRoom && b.status !== 'ditolak');
  const today=new Date().toISOString().split('T')[0];
  let html=days.map(d=>`<div class="rc-head">${d}</div>`).join('');
  const firstDay=new Date(rcYear,rcMonth,1).getDay();
  const daysInMonth=new Date(rcYear,rcMonth+1,0).getDate();
  for(let i=0;i<firstDay;i++) html+=`<div class="rc-day empty"></div>`;
  for(let d=1;d<=daysInMonth;d++){
    const dateStr=`${rcYear}-${String(rcMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const bks=list.filter(b=>b.tanggal===dateStr);
    const isToday=dateStr===today;
    const isSel=dateStr===rcSelectedDate;
    let cls='rc-day';
    if(bks.length) cls+=' has-bookings';
    if(isToday) cls+=' today';
    if(isSel) cls+=' selected';
    const dots=bks.length?`<div class="rc-dot-row">${bks.slice(0,4).map(()=>`<span class="rc-dot"></span>`).join('')}</div>`:'';
    html+=`<div class="${cls}" onclick="rcSelectDay('${dateStr}')"><div class="rc-day-num">${d}</div>${dots}</div>`;
  }
  document.getElementById('rc-cal-grid').innerHTML=html;
  if(rcSelectedDate) renderRcDayDetail(rcSelectedDate);
}

function rcSelectDay(dateStr){
  rcSelectedDate=dateStr;
  renderRoomCalendar();
  renderRcDayDetail(dateStr);
}

function renderRcDayDetail(dateStr){
  const [y,m,d]=dateStr.split('-');
  const label=new Date(dateStr+'T00:00:00').toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  document.getElementById('rc-day-title').textContent=label;
  const list= allBookings.filter(b => b.room.name === rcRoom && b.tanggal === dateStr && b.status !== 'ditolak');
  const det=document.getElementById('rc-day-detail');
  det.style.display='block';
  if(!list.length){
    document.getElementById('rc-day-list').innerHTML=`<div style="font-size:12.5px;color:var(--text3);padding:10px 0">Tidak ada reservasi pada hari ini.</div>`;
    return;
  }
  list.sort((a,b)=>toMin(a.jam_mulai)-toMin(b.jam_mulai));
  document.getElementById('rc-day-list').innerHTML=list.map(b=>{
    const tagCls=b.status==='disetujui'?'approved':b.status==='pending'?'pending':'rejected';
    const tagLbl=b.status==='disetujui'?'Disetujui':b.status==='pending'?'Menunggu':'Ditolak';
    return `<div class="rc-item">
      <div>
        <div class="rc-item-info"><strong>${b.nama}</strong> · ${b.instansi} <span class="tag-sm ${tagCls}">${tagLbl}</span></div>
        <div class="rc-item-time">🕐 ${b.jam_mulai} – ${b.jam_selesai} &nbsp;|&nbsp; ${b.keperluan}</div>
      </div>
      <div class="rc-item-acts">
        <button class="rc-btn edit" onclick="openEdit(${b.id})">Edit</button>
        <button class="rc-btn del" onclick="deleteBooking(${b.id})">Hapus</button>
      </div>
    </div>`;
  }).join('');
}

/* EDIT RUANGAN */

function pickStatus(s, showToastNotice = true) {
  rmgmtStatus = s;
  const btns = document.querySelectorAll('.status-pick');
  btns.forEach(b => {
    b.classList.remove('active');
    if(b.classList.contains(s)) b.classList.add('active');
  });

  const untilWrap = document.getElementById('rmgmt-until-wrap');
  if(s === 'available') {
    untilWrap.style.display = 'none';
  } else {
    untilWrap.style.display = 'block';
  }
}

async function openRoomMgmt(roomName) {
  // Ambil data ruangan terbaru
  const roomsList = await loadRooms();
  const r = roomsList.find(x => x.name === roomName);
  
  if (!r) return;

  // Set variabel global untuk digunakan saat save
  rmgmtName = r.name;

  // Isi data ke dalam modal
  const titleEl = document.getElementById('rmgmt-title');
  if(titleEl) titleEl.textContent = `Kelola Ruangan: ${r.name}`;
  
  document.getElementById('rmgmt-cap').value = r.cap || '';
  document.getElementById('rmgmt-fasilitas').value = r.fasilitas || '';

  // Atur UI pilihan status
  pickStatus(r.status, false);

  // Jika sedang tidak available, isi tanggal penutupan jika ada
  if (r.status !== 'available' && r.closedUntil) {
    document.getElementById('rmgmt-until').value = r.closedUntil;
  } else {
    document.getElementById('rmgmt-until').value = '';
  }

  // Tampilkan overlay/modal
  document.getElementById('room-mgmt-overlay').classList.add('show');
}

function closeRoomMgmt() {
  document.getElementById('room-mgmt-overlay').classList.remove('show');
}

/* ── EDIT BOOKING ── */

async function deleteBooking(id) {
  if (!confirm('Hapus reservasi ini?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
      }
    });

    if (response.ok) {
      renderAdmin();
      if (rcRoom) renderRcDayDetail(rcSelectedDate); // Refresh kalender jika sedang dibuka
      showToast('Reservasi berhasil dihapus.', 'success');
    }
  } catch (error) {
    showToast('Gagal menghapus data', 'error');
  }
}

let editId=null;
async function openEdit(id){
  const list = await loadBookings();
  const b=list.find(x=>x.id===id);
  if(!b) return;

  editId=id;
  document.getElementById('edit-sub').textContent=b.room.name;
  document.getElementById('edit-nama').value=b.nama;
  document.getElementById('edit-tanggal').value=b.tanggal;
  document.getElementById('edit-mulai').value=b.jam_mulai;
  document.getElementById('edit-selesai').value=b.jam_selesai;
  document.getElementById('edit-kep').value=b.keperluan;
  document.getElementById('edit-overlay').classList.add('show');
}
function closeEdit(){ document.getElementById('edit-overlay').classList.remove('show'); editId=null; }
document.getElementById('edit-overlay').addEventListener('click',function(e){if(e.target===this)closeEdit();});

async function saveEdit() {
  const payload = {
    nama: document.getElementById('edit-nama').value.trim(),
    tanggal: document.getElementById('edit-tanggal').value,
    jam_mulai: document.getElementById('edit-mulai').value,
    jam_selesai: document.getElementById('edit-selesai').value,
    keperluan: document.getElementById('edit-kep').value.trim()
  };

  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${editId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      closeEdit();
      renderAdmin();
      showToast('Reservasi diperbarui!', 'success');
    } else {
      const err = await response.json();
      showToast(err.message || 'Gagal menyimpan perubahan', 'warn');
    }
  } catch (error) {
    showToast('Koneksi server bermasalah', 'error');
  }
} 

function setFilter(s, btn){
  filterStatus=s;
  document.querySelectorAll('.fbtn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderTable();
}
function setSearch(q){ searchQ=q.toLowerCase(); renderTable(); }

/* ── MODAL ── */
const TL_S=7*60, TL_E=17*60, TL_D=TL_E-TL_S;
function pct(m){ return Math.max(0,Math.min(100,((m-TL_S)/TL_D)*100)); }

let activeId=null;
async function openModal(id){
  const list= await loadBookings();
  const b=list.find(x=>x.id===id);
  if(!b) return;
  activeId=id;

  const fmtDate=d=>{ const[y,m,dd]=d.split('-'); return `${dd}/${m}/${y}`; };
  const dayFmt=d=>new Date(d+'T00:00:00').toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

  document.getElementById('m-title').textContent=`Pemesanan: ${b.room.name}`;
  document.getElementById('m-sub').textContent=`Diajukan oleh ${b.nama} · ${b.instansi}`;
  document.getElementById('m-nama').textContent=b.nama;
  document.getElementById('m-inst').textContent=b.instansi;
  document.getElementById('m-kontak').textContent=b.kontak;
  document.getElementById('m-room').textContent=b.room.name;
  document.getElementById('m-time').textContent=`${dayFmt(b.tanggal)}, ${b.jam_mulai} – ${b.jam_selesai}`;
  document.getElementById('m-kep').textContent=b.keperluan;

  // Render timeline
  const others=list.filter(x =>
    x.room.name === b.room.name &&
    x.tanggal===b.tanggal && 
    x.id!==b.id&& 
    x.status!=='ditolak'
  );

  let tlHtml=others.map(x=>{
    const s=pct(toMin(x.jam_mulai)), e=pct(toMin(x.jam_selesai));
    return `<div class="modal-tl-seg booked" style="left:${s}%;width:${Math.max(e-s,1)}%" title="${x.nama}: ${x.jam_mulai}–${x.jam_selesai}">${x.jam_mulai}–${x.jam_selesai}</div>`;
  }).join('');
  const cs=pct(toMin(b.jam_mulai)), ce=pct(toMin(b.jam_selesai));
  tlHtml+=`<div class="modal-tl-seg current" style="left:${cs}%;width:${Math.max(ce-cs,1)}%">${b.jam_mulai}–${b.jam_selesai}</div>`;
  document.getElementById('m-tl-bar').innerHTML=tlHtml;

  // Buttons
  const ap=document.getElementById('m-approve');
  const rj=document.getElementById('m-reject');
  if(b.status==='pending'){
    ap.style.display='';rj.style.display='';
    ap.onclick=()=>decide(id,'approved');
    rj.onclick=()=>decide(id,'rejected');
  } else {
    ap.style.display='none';rj.style.display='none';
  }

  document.getElementById('overlay').classList.add('show');
}

async function decide(id, status) {
  const dbStatus = status === 'approved' ? 'disetujui' : 'ditolak';
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type' : 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
      },
      body: JSON.stringify({ status: dbStatus})
    });

    if (response.ok) {
      closeModal();
      await renderAdmin(); // Refresh data otomatis dari server
      showToast(status === 'approved' ? 'Pemesanan disetujui!' : 'Pemesanan ditolak.', status === 'approved' ? 'success' : 'error');
    } else {
      const err = await response.json();
      console.log("Detail Error 422:", err);
      showToast('Gagal memperbarui status', 'error');
    }
  }

  catch (error) {
    showToast('Koneksi server gagal', 'error');
  }
}

function closeModal(){ document.getElementById('overlay').classList.remove('show'); activeId=null; }

/* ── TOAST ── */
function showToast(msg, type='success'){
  const icons={
    success:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    warn:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
  };
  const t=document.createElement('div');
  t.className=`toast ${type}`;
  t.innerHTML=`${icons[type]||icons.success}${msg}`;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(), 3200);
}

/* ── OVERLAY CLOSE ── */
document.getElementById('overlay').addEventListener('click',function(e){ if(e.target===this)closeModal(); });

/* ── CSS SPIN ── */
const style=document.createElement('style');
style.textContent=`@keyframes spin{to{transform:rotate(360deg)}}`;
document.head.appendChild(style);