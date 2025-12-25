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
  /* Home.js - Cập nhật lại hàm markOrderServed */
 
  function markOrderServed(roomId) {
  const rooms = load(ROOM_KEY);
  let bills = load(BILL_KEY);
  const services = load(SERVICE_KEY);

  const roomIndex = rooms.findIndex(r => r.id === roomId);
  if (roomIndex === -1) return;

  const room = rooms[roomIndex];
  if (!room.orders || room.orders.length === 0) return;

  // 1. Tìm hoặc tạo Bill
  let bill = bills.find(b => b.roomId === roomId);
  if (!bill) {
    const customer = room.customers?.[0] || {};
    bill = {
      roomId: room.id,
      roomName: room.name,
      startTime: room.startTime || Date.now(),
      pricePerHour: room.price || 0,
      customer: {
        name: customer.name || "Khách lẻ",
        phone: customer.phone || ""
      },
      services: []
    };
    bills.push(bill);
  }

  // 2. Chuyển món từ orders vào bill.services
  room.orders.forEach(orderItem => {
    const svcInfo = services.find(s => s.id === orderItem.svcId);
    if (!svcInfo) return;

    const existedInBill = bill.services.find(s => s.svcId === orderItem.svcId);
    if (existedInBill) {
      existedInBill.qty += orderItem.qty;
    } else {
      bill.services.push({
        svcId: svcInfo.id,
        name: svcInfo.name,
        price: svcInfo.price,
        qty: orderItem.qty
      });
    }
  });

  // 3. XÓA ĐƠN HÀNG TRONG PHÒNG (Để món của phòng khác đẩy lên)
  rooms[roomIndex].orders = []; 
  
  // 4. Lưu lại toàn bộ
  save(ROOM_KEY, rooms);
  save(BILL_KEY, bills);

  // 5. Cập nhật giao diện ngay lập tức
  render(); 
  // alert(`Đã phục vụ xong cho ${room.name}`); // Bạn có thể tắt alert nếu muốn mượt hơn
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
    const orderRooms = rooms.filter(r => Array.isArray(r.orders) && r.orders.length);
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

        <button class="btn-done" data-room-id="${r.id}">
          ✔ Đã phục vụ
        </button>
      `;

      orderList.appendChild(el);
    });
  }
  orderList.addEventListener("click", function (e) {
  const btn = e.target.closest(".btn-done");
  if (!btn) return;

  const roomId = btn.dataset.roomId;
  if (!roomId) return;

  // Tìm phòng trong dữ liệu thực tế
  const rooms = load(ROOM_KEY);
  const room = rooms.find(r => r.id === roomId);
  
  if (room) {
    // Xác nhận và xử lý
    if (confirm(`Xác nhận ${room.name} đã phục vụ xong?`)) {
      markOrderServed(roomId); // Hàm này đã có lệnh render() ở cuối
    }
  }
});
  render();
})();
