  /* File: RoomBooking.js
    Modern Room booking logic:
    - stores rooms in localStorage key "karaoke_rooms_v1"
    - reads services from localStorage key "karaoke_services_v1" (if present) to add to orders
  */

  (function(){
    const STORAGE_KEY = "karaoke_rooms_v1";
    const SERVICE_KEY = "karaoke_services_v1";

    // DOM
    const sumAvailableEl = document.getElementById("sumAvailable");
    const sumUsingEl = document.getElementById("sumUsing");
    const sumMaintenanceEl = document.getElementById("sumMaintenance");

    const searchRoom = document.getElementById("searchRoom");
    const filterStatus = document.getElementById("filterStatus");
    const addRoomBtn = document.getElementById("addRoomBtn");
    const roomListEl = document.getElementById("roomList");

    // modals & forms
    const roomModal = document.getElementById("roomModal");
    const roomModalTitle = document.getElementById("roomModalTitle");
    const closeRoomModal = document.getElementById("closeRoomModal");
    const roomForm = document.getElementById("roomForm");
    const roomIdInput = document.getElementById("roomId");
    const fieldRoomName = document.getElementById("fieldRoomName");
    const fieldRoomType = document.getElementById("fieldRoomType");
    const fieldCapacity = document.getElementById("fieldCapacity");
    const fieldPrice = document.getElementById("fieldPrice");
    const fieldStatus = document.getElementById("fieldStatus");
    const cancelRoom = document.getElementById("cancelRoom");

    const bookingModal = document.getElementById("bookingModal");
    const bookingTitle = document.getElementById("bookingTitle");
    const closeBookingModal = document.getElementById("closeBookingModal");
    const bookingForm = document.getElementById("bookingForm");
    const bookingRoomInfo = document.getElementById("bookingRoomInfo");
    const bookCustomerName = document.getElementById("bookCustomerName");
    const bookPhone = document.getElementById("bookPhone");
    const bookPersons = document.getElementById("bookPersons");
    const bookStartTime = document.getElementById("bookStartTime");
    const cancelBooking = document.getElementById("cancelBooking");

    const usageModal = document.getElementById("usageModal");
    const usageTitle = document.getElementById("usageTitle");
    const closeUsageModal = document.getElementById("closeUsageModal");
    const usageTop = document.getElementById("usageTop");
    const ordersList = document.getElementById("ordersList");
    const serviceSelect = document.getElementById("serviceSelect");
    const serviceQty = document.getElementById("serviceQty");
    const addServiceBtn = document.getElementById("addServiceBtn");
    const totalRoomFee = document.getElementById("totalRoomFee");
    const totalServiceFee = document.getElementById("totalServiceFee");
    const grandTotal = document.getElementById("grandTotal");
    const closeUsageDone = document.getElementById("closeUsageDone");
    const checkoutBtn = document.getElementById("checkoutBtn");

    // state
    let rooms = [];
    let services = []; // loaded from SERVICE_KEY
    let activeRoomId = null; // room id currently in a modal (booking or usage)

    // util
    function genId(prefix='R'){ return prefix + '_' + Date.now().toString(36) + '_' + Math.floor(Math.random()*9000); }
    function pad(n){ return (n < 10 ? '0' : '') + n; }
    function todayTimeString(hhmm){ if(hhmm) return hhmm; const d=new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
    function money(v){ return Number(v).toLocaleString('vi-VN') + 'đ'; }

    // storage
    function load(){
      try{
        const raw = localStorage.getItem(STORAGE_KEY);
        if(raw) rooms = JSON.parse(raw);
        else seedDemo();
      }catch(e){
        console.error('load rooms err', e);
        seedDemo();
      }

      // load services if present (used by reception Food page)
      try{
        const sraw = localStorage.getItem(SERVICE_KEY);
        if(sraw) services = JSON.parse(sraw);
        else services = []; // empty if not provided
      }catch(e){ services = []; }
    }
    function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms)); }

    function seedDemo(){
      rooms = [
        { id: genId(), name: 'Phòng VIP 01', type:'VIP', capacity:10, price:200000, status:'using', customers:[{name:'Nguyễn Văn A', phone:'0901234567', start: todayTimeString('14:30')}], orders:[ /* {svcId, qty} */ ], note:'' },
        { id: genId(), name: 'Phòng VIP 02', type:'VIP', capacity:10, price:200000, status:'available', customers:[], orders:[], note:'' },
        { id: genId(), name: 'Phòng 03', type:'Standard', capacity:6, price:100000, status:'available', customers:[], orders:[], note:'' },
        { id: genId(), name: 'Phòng 04', type:'Standard', capacity:6, price:100000, status:'using', customers:[{name:'Trần Thị B', phone:'0912345678', start: todayTimeString('15:00')}], orders:[], note:'' },
        { id: genId(), name: 'Phòng 05', type:'Couple', capacity:2, price:80000, status:'maintenance', customers:[], orders:[], note:'' }
      ];
      save();
    }

    // render
    function renderSummary(){
      const totalAvailable = rooms.filter(r=>r.status==='available').length;
      const totalUsing = rooms.filter(r=>r.status==='using').length;
      const totalMaint = rooms.filter(r=>r.status==='maintenance').length;
      sumAvailableEl.textContent = `${totalAvailable} phòng`;
      sumUsingEl.textContent = `${totalUsing} phòng`;
      sumMaintenanceEl.textContent = `${totalMaint} phòng`;
    }

    function cardBorderClass(status){
      if(status === 'using') return 'red';
      if(status === 'maintenance') return 'yellow';
      return 'green';
    }

    function renderRooms(){
      const kw = (searchRoom.value || '').toLowerCase().trim();
      const filter = filterStatus.value || '__all';
      roomListEl.innerHTML = '';

      const list = rooms.filter(r=>{
        if(filter !== '__all' && r.status !== filter) return false;
        if(!kw) return true;
        return (r.name||'').toLowerCase().includes(kw) || (r.type||'').toLowerCase().includes(kw);
      });

      if(list.length === 0){
        roomListEl.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#777; padding:30px">Không có phòng nào</div>`;
        renderSummary();
        return;
      }

      list.forEach(r=>{
        const card = document.createElement('div');
        card.className = `room-card ${cardBorderClass(r.status)}`;
        card.dataset.id = r.id;

        const statusText = r.status === 'available' ? 'Còn trống' : r.status === 'using' ? 'Đang sử dụng' : 'Bảo trì';

        // compute first customer display
        const firstCust = (r.customers && r.customers.length) ? r.customers[0] : null;

        card.innerHTML = `
          <div class="top">
            <h3>${escapeHtml(r.name)}</h3>
            <div class="type">${escapeHtml(r.type||'')}</div>

            <div class="room-meta">
              <div><i class="fa-solid fa-user"></i> Sức chứa: ${r.capacity} người</div>
              <div>Giá: ${money(r.price)}/giờ</div>
              ${firstCust ? `<div class="cust-panel" style="margin-top:8px; padding:8px; border-radius:8px; background:#f8fafc">
                  <strong>KH: ${escapeHtml(firstCust.name)}</strong><br><small>${escapeHtml(firstCust.phone||'')}</small><br><small>⏱ Bắt đầu: ${escapeHtml(firstCust.start)}</small>
              </div>` : ''}
            </div>
          </div>

          <div class="card-bottom">
            <div><span class="status-badge ${statusBadgeClass(r.status)}">${statusText}</span></div>

            <div class="actions">
              <button class="btn-edit" data-id="${r.id}"><i class="fa-solid fa-pen-to-square"></i></button>
              <button class="btn-customer" data-id="${r.id}"><i class="fa-solid fa-user-plus"></i></button>
              <button class="btn-delete" data-id="${r.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>
        `;
        // click on card opens booking or usage accordingly
        card.addEventListener('click', (ev)=>{
          // avoid when clicking action buttons (they have own handlers)
          if(ev.target.closest('.actions')) return;
          // open booking or usage depending status
          if(r.status === 'available'){
            openBookingModal(r.id);
          } else {
            openUsageModal(r.id);
          }
        });

        roomListEl.appendChild(card);
      });

      // bind actions (edit/delete/customer) using delegation
      roomListEl.querySelectorAll('.btn-edit').forEach(b => b.onclick = onEditRoom);
      roomListEl.querySelectorAll('.btn-delete').forEach(b => b.onclick = onDeleteRoom);
      roomListEl.querySelectorAll('.btn-customer').forEach(b => b.onclick = onOpenBookingFromBtn);

      renderSummary();
    }

    function statusBadgeClass(status){
      if(status === 'available') return 'status-available';
      if(status === 'using') return 'status-using';
      if(status === 'maintenance') return 'status-maintenance';
      return '';
    }

    // actions
    function onAddRoomClick(){ openRoomModal('add'); }
    function openRoomModal(mode, room=null){
      roomModal.classList.remove('hidden');
      if(mode==='add'){
        roomModalTitle.textContent = 'Thêm phòng';
        roomForm.reset();
        roomIdInput.value = '';
        fieldRoomType.value = 'VIP';
        fieldStatus.value = 'available';
      } else {
        roomModalTitle.textContent = 'Sửa phòng';
        roomIdInput.value = room.id;
        fieldRoomName.value = room.name;
        fieldRoomType.value = room.type;
        fieldCapacity.value = room.capacity;
        fieldPrice.value = room.price;
        fieldStatus.value = room.status;
      }
      setTimeout(()=> fieldRoomName.focus(), 80);
    }
    function closeRoomModalFn(){ roomModal.classList.add('hidden'); }

    function onEditRoom(e){
      e.stopPropagation();
      const id = e.currentTarget.dataset.id;
      const room = rooms.find(r=>r.id===id);
      if(room) openRoomModal('edit', room);
    }

    function onDeleteRoom(e){
      e.stopPropagation();
      const id = e.currentTarget.dataset.id;
      const room = rooms.find(r=>r.id===id);
      if(!room) return;
      if(!confirm(`Bạn có chắc muốn xóa ${room.name}?`)) return;
      rooms = rooms.filter(r=>r.id !== id);
      save();
      renderRooms();
      renderSummary();
    }

    // BOOKING from action button
    function onOpenBookingFromBtn(e){
      e.stopPropagation();
      const id = e.currentTarget.dataset.id;
      openBookingModal(id);
    }

    // BOOKING modal (for empty rooms)
    function openBookingModal(roomId){
      activeRoomId = roomId;
      const room = rooms.find(r=>r.id===roomId);
      if(!room) return;
      bookingModal.classList.remove('hidden');
      bookingTitle.textContent = `Đặt phòng ${room.name}`;
      bookingRoomInfo.innerHTML = `<div><strong>${escapeHtml(room.name)}</strong> • ${escapeHtml(room.type)} • ${money(room.price)}/giờ</div>`;
      bookingForm.reset();
      bookStartTime.value = todayTimeString();
      setTimeout(()=> bookCustomerName.focus(), 80);
    }
    function closeBookingModalFn(){ bookingModal.classList.add('hidden'); activeRoomId = null; }

    bookingForm.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      if(!activeRoomId) return;
      const name = bookCustomerName.value.trim();
      const phone = bookPhone.value.trim();
      const persons = Number(bookPersons.value) || 1;
      const start = bookStartTime.value || todayTimeString();
      if(!name || !phone){ alert('Vui lòng nhập tên và số điện thoại'); return; }

      const room = rooms.find(r=>r.id===activeRoomId);
      if(!room) { closeBookingModalFn(); return; }

      // add customer at front (so latest is first)
      room.customers = room.customers || [];
      room.customers.unshift({ name, phone, persons, start });
      room.status = 'using';
      room.orders = room.orders || [];
      save();
      closeBookingModalFn();
      renderRooms();
      renderSummary();
    });

    cancelBooking.addEventListener('click', (e)=>{ e.preventDefault(); closeBookingModalFn(); });
    closeBookingModal.addEventListener('click', closeBookingModalFn);

    // USAGE modal (for rooms already in use)
    function openUsageModal(roomId){
      activeRoomId = roomId;
      const room = rooms.find(r=>r.id===roomId);
      if(!room) return;
      usageModal.classList.remove('hidden');
      usageTitle.textContent = `Sử dụng - ${room.name}`;
      // top summary
      const firstCust = (room.customers && room.customers[0]) || {};
      usageTop.innerHTML = `<div class="left"><strong>${escapeHtml(firstCust.name||'')}</strong><div style="color:#6b7280">${escapeHtml(firstCust.phone||'')}</div></div>
        <div class="right"><div>Bắt đầu: <strong>${escapeHtml(firstCust.start||'')}</strong></div><div>Phòng: ${money(room.price)}/giờ</div></div>`;

      // load orders
      renderOrders(room);

      // fill service select from global services
      fillServiceSelect();

      computeTotals(room);
    }

    function closeUsageModalFn(){ usageModal.classList.add('hidden'); activeRoomId = null; }

    // add service to room orders
    addServiceBtn.addEventListener('click', (ev)=>{
      ev.preventDefault();
      if(!activeRoomId) return;
      const svcId = serviceSelect.value;
      const qty = Number(serviceQty.value) || 1;
      const svc = services.find(s=>s.id===svcId);
      if(!svc){ alert('Chọn dịch vụ hợp lệ'); return; }
      const room = rooms.find(r=>r.id===activeRoomId);
      room.orders = room.orders || [];
      // try find existing order and add qty
      const ex = room.orders.find(o=>o.svcId === svcId);
      if(ex) ex.qty += qty;
      else room.orders.push({ svcId, qty });
      // when adding service to a room that was available (edge), set using
      room.status = 'using';
      save();
      renderOrders(room);
      computeTotals(room);
      renderRooms(); // update card preview
    });

    // render orders list for a room inside usage modal
    function renderOrders(room){
      ordersList.innerHTML = '';
      if(!room.orders || room.orders.length === 0){
        ordersList.innerHTML = `<div style="color:#6b7280; padding:12px">Chưa có dịch vụ</div>`;
        return;
      }
      room.orders.forEach((o, idx)=>{
        const svc = services.find(s=>s.id === o.svcId) || { name:'(Đã xóa)', price:0 };
        const row = document.createElement('div');
        row.className = 'order-item';
        row.innerHTML = `<div><strong>${escapeHtml(svc.name)}</strong><div style="color:#6b7280;font-size:13px">${money(svc.price)} x ${o.qty}</div></div>
          <div style="display:flex;gap:8px;align-items:center">
            <div style="font-weight:700">${money((svc.price||0) * o.qty)}</div>
            <button class="btn-small btn-order-decr" data-idx="${idx}">-</button>
            <button class="btn-small btn-order-incr" data-idx="${idx}">+</button>
            <button class="btn-small btn-order-del" data-idx="${idx}">🗑</button>
          </div>`;
        ordersList.appendChild(row);
      });

      // bind order controls
      ordersList.querySelectorAll('.btn-order-del').forEach(b=> b.onclick = onOrderDel);
      ordersList.querySelectorAll('.btn-order-incr').forEach(b=> b.onclick = onOrderIncr);
      ordersList.querySelectorAll('.btn-order-decr').forEach(b=> b.onclick = onOrderDecr);
    }

    function onOrderDel(e){
      const idx = Number(e.currentTarget.dataset.idx);
      const room = rooms.find(r=>r.id===activeRoomId);
      if(!room) return;
      room.orders.splice(idx,1);
      save();
      renderOrders(room);
      computeTotals(room);
      renderRooms();
    }
    function onOrderIncr(e){
      const idx = Number(e.currentTarget.dataset.idx);
      const room = rooms.find(r=>r.id===activeRoomId);
      if(!room) return;
      room.orders[idx].qty += 1;
      save();
      renderOrders(room);
      computeTotals(room);
      renderRooms();
    }
    function onOrderDecr(e){
      const idx = Number(e.currentTarget.dataset.idx);
      const room = rooms.find(r=>r.id===activeRoomId);
      if(!room) return;
      room.orders[idx].qty = Math.max(1, room.orders[idx].qty - 1);
      save();
      renderOrders(room);
      computeTotals(room);
      renderRooms();
    }

    function computeTotals(room){
      // room time fee is demonstration only: here we don't compute actual hours, we show price as is
      const roomFee = room.price || 0;
      let svcTotal = 0;
      (room.orders||[]).forEach(o=>{
        const svc = services.find(s=>s.id===o.svcId);
        if(svc) svcTotal += (svc.price||0) * o.qty;
      });
      totalRoomFee.textContent = money(roomFee);
      totalServiceFee.textContent = money(svcTotal);
      grandTotal.textContent = money(roomFee + svcTotal);
    }

    function fillServiceSelect(){
      serviceSelect.innerHTML = '';
      if(!services || services.length===0){
        serviceSelect.innerHTML = `<option value="">(Không có dịch vụ)</option>`;
        return;
      }
      serviceSelect.innerHTML = services.map(s=>`<option value="${s.id}">${escapeHtml(s.name)} - ${money(s.price)}</option>`).join('');
    }

    // checkout (simple)
    checkoutBtn.addEventListener('click', (ev)=>{
      ev.preventDefault();
      if(!activeRoomId) return;
      const room = rooms.find(r=>r.id===activeRoomId);
      if(!room) return;
      if(!confirm('Xác nhận thanh toán và trả phòng?')) return;
      // clear customers and orders, set status to available
      room.customers = [];
      room.orders = [];
      room.status = 'available';
      save();
      closeUsageModalFn();
      renderRooms();
      renderSummary();
    });

    closeUsageModal.addEventListener('click', closeUsageModalFn);
    closeUsageDone.addEventListener('click', closeUsageModalFn);

    // room form submit (add / edit)
    roomForm.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      const id = roomIdInput.value;
      const data = {
        id: id || genId(),
        name: fieldRoomName.value.trim(),
        type: fieldRoomType.value,
        capacity: Number(fieldCapacity.value),
        price: Number(fieldPrice.value),
        status: fieldStatus.value,
        customers: [],
        orders: [],
        note: ''
      };
      if(!data.name){ alert('Tên phòng không được để trống'); return; }
      if(id){
        const idx = rooms.findIndex(r=>r.id === id);
        if(idx >= 0){
          // keep existing customers and orders
          data.customers = rooms[idx].customers || [];
          data.orders = rooms[idx].orders || [];
          rooms[idx] = data;
        }
      } else {
        // append to bottom (push)
        rooms.push(data);
      }
      save();
      closeRoomModalFn();
      renderRooms();
      renderSummary();
    });

    cancelRoom.addEventListener('click', (e)=>{ e.preventDefault(); closeRoomModalFn(); });
    closeRoomModal.addEventListener('click', closeRoomModalFn);

    // booking/usage modal close
    closeBookingModal.addEventListener('click', closeBookingModalFn);

    // search & filter
    searchRoom.addEventListener('input', ()=>renderRooms());
    filterStatus.addEventListener('change', ()=>renderRooms());

    // initial bindings
    addRoomBtn.addEventListener('click', onAddRoomClick);

    // helpers
    function escapeHtml(s){ if(s==null) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }

    // init
    function init(){
      load();
      renderRooms();
      renderSummary();
    }

    init();

  })();
