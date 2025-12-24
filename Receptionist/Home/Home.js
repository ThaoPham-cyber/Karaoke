(function () {

  /* ================= STORAGE KEYS ================= */
  const ROOM_KEY = "karaoke_rooms_v1";
  const BILL_KEY = "karaoke_bill_pending_v1";
  const SERVICE_KEY = "karaoke_services_v1";

  /* ================= DOM ================= */
  const activeRoomList = document.getElementById("activeRoomList");
  const orderList = document.getElementById("orderList");
  const activeCount = document.getElementById("activeCount");
  const orderCount = document.getElementById("orderCount");

  /* ================= STORAGE ================= */
  const load = key => {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  };

  const save = (key, data) =>
    localStorage.setItem(key, JSON.stringify(data));

  /* ================= NAV ================= */
  document.querySelectorAll(".qa-item").forEach(item => {
    item.onclick = () => {
      if (item.dataset.link) {
        window.location.href = item.dataset.link;
      }
    };
  });

  /* ================= SYNC ORDER → BILL ================= */
  function markOrderServed(roomId) {
   const rooms = load(ROOM_KEY);
   const bills = load(BILL_KEY);
   const services = load(SERVICE_KEY);

   const roomIndex = rooms.findIndex(r => r.id === roomId);
   if (roomIndex === -1) return;

   const room = rooms[roomIndex];
   if (!room.orders || room.orders.length === 0) return;

   // ===== 1. LẤY / TẠO BILL =====
   let bill = bills.find(b => b.roomId === roomId);

    if (!bill) {
    const customer = room.customers?.[0] || {};

    bill = {
      roomId: room.id,
      roomName: room.name,
      startTime: room.checkIn || Date.now(),
      pricePerHour: room.roomPrice || 100000,
      customer: {
        name: customer.name || "Khách lẻ",
        phone: customer.phone || ""
      },
      services: []
    };

    bills.push(bill);
  }

  // ===== 2. GỘP DỊCH VỤ =====
  room.orders.forEach(o => {
    const svc = services.find(s => s.id === o.svcId);
    if (!svc) return;

    const existed = bill.services.find(s => s.svcId === o.svcId);
    if (existed) {
      existed.qty += o.qty;
    } else {
      bill.services.push({
        svcId: svc.id,
        name: svc.name,
        price: svc.price,
        qty: o.qty
      });
    }
  });

  // ===== 3. CLEAR ĐƠN =====
  rooms[roomIndex].orders = [];
  rooms[roomIndex].hasNewOrder = false;

  save(ROOM_KEY, rooms);
  save(BILL_KEY, bills);

  render(); // 🔥 UI BIẾN MẤT NGAY
  }


  /* ================= RENDER ================= */
  function render() {
    const rooms = load(ROOM_KEY);
    const services = load(SERVICE_KEY);

    /* ===== PHÒNG ĐANG SỬ DỤNG ===== */
    const activeRooms = rooms.filter(r => r.status === "using");
    activeCount.textContent = `${activeRooms.length} phòng`;
    activeRoomList.innerHTML = "";

    activeRooms.forEach(r => {
      const cust = r.customers?.[0] || {};
      const el = document.createElement("div");
      el.className = "item";

      el.innerHTML = `
        <div class="item-top">
          <div>
            <span class="status-dot"></span>
            <strong>${r.name}</strong>
            ${r.orders?.length ? `<span class="badge orange">Có đơn mới</span>` : ""}
          </div>
        </div>
        <div>KH: ${cust.name || "-"}</div>
        <div class="time">⏱ Bắt đầu: ${cust.start || "--:--"}</div>
      `;

      activeRoomList.appendChild(el);
    });

    /* ===== ĐƠN CHỜ PHỤC VỤ ===== */
    const orderRooms = rooms.filter(r => r.orders && r.orders.length);
    orderCount.textContent = `${orderRooms.length} đơn`;
    orderList.innerHTML = "";

    orderRooms.forEach(r => {
      const urgent = r.orders.length >= 3;
      const el = document.createElement("div");
      el.className = "item";
      el.style.borderColor = urgent ? "#ef4444" : "#e5e7eb";

      el.innerHTML = `
        <div class="item-top">
          <strong>
            ${r.name}
            ${urgent ? `<span class="badge red">Gấp</span>` : ""}
          </strong>
        </div>

        <div class="order-list">
          ${r.orders.map(o => {
            const svc = services.find(s => s.id === o.svcId);
            return `• ${svc ? svc.name : "(Dịch vụ đã xoá)"} × ${o.qty}`;
          }).join("<br>")}
        </div>

        <button class="btn-done">✔ Đã phục vụ</button>
      `;

      el.querySelector(".btn-done").onclick = () => {
        if (confirm(`Xác nhận ${r.name} đã phục vụ xong?`)) {
          markOrderServed(r.id);
        }
      };

      orderList.appendChild(el);
    });
  }

  render();

})();
