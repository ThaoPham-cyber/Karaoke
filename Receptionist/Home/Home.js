(function () {

  const ROOM_KEY = "karaoke_rooms_v1";
  const BILL_KEY = "karaoke_bill_pending_v1";

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

  /* ================= MARK SERVED ================= */
  function markOrderServed(roomId) {
    const rooms = load(ROOM_KEY);
    const bills = load(BILL_KEY);

    const room = rooms.find(r => r.id === roomId);
    if (!room || !room.orders?.length) return;

    const customer = room.customers?.[0] || {};

    bills.push({
      roomId: room.id,
      roomName: room.name,
      startTime: room.checkIn || Date.now(),
      pricePerHour: room.roomPrice || 100000,
      customer: {
        name: customer.name || "Khách lẻ",
        phone: customer.phone || ""
      },
      services: room.orders.map(o => ({
        name: o.name,
        price: o.price,
        qty: o.qty
      }))
    });

    delete room.orders;

    save(BILL_KEY, bills);
    save(ROOM_KEY, rooms);

    render();
  }

  /* ================= RENDER ================= */
  function render() {
    const rooms = load(ROOM_KEY);

    /* ===== PHÒNG ĐANG DÙNG ===== */
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
    const orderRooms = rooms.filter(r => r.orders?.length);
    orderCount.textContent = `${orderRooms.length} đơn`;
    orderList.innerHTML = "";

    orderRooms.forEach(r => {
      const urgent = r.orders.length >= 3;
      const el = document.createElement("div");
      el.className = "item";
      el.style.borderColor = urgent ? "#ef4444" : "#e5e7eb";

      el.innerHTML = `
        <div class="item-top">
          <strong>${r.name}
            ${urgent ? `<span class="badge red">Gấp</span>` : ""}
          </strong>
        </div>
        <div>${r.orders.map(o => `• ${o.name} × ${o.qty}`).join("<br>")}</div>
        <button class="btn-done">✔ Đánh dấu đã phục vụ</button>
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
