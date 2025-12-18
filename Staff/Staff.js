/* =========================================================
   Staff.js – Production (SYNC WITH BILL)
========================================================= */
(function () {
  const ROOM_KEY = "karaoke_rooms_v1";
  const BILL_KEY = "karaoke_bill_pending_v1";
  const SERVICE_KEY = "karaoke_services_v1";

  const grid = document.getElementById("orderGrid");

  let rooms = [];
  let bills = [];
  let services = [];

  /* ================= LOAD ================= */
  function load() {
    rooms = JSON.parse(localStorage.getItem(ROOM_KEY)) || [];
    bills = JSON.parse(localStorage.getItem(BILL_KEY)) || [];
    services = JSON.parse(localStorage.getItem(SERVICE_KEY)) || [];
  }

  function saveAll() {
    localStorage.setItem(ROOM_KEY, JSON.stringify(rooms));
    localStorage.setItem(BILL_KEY, JSON.stringify(bills));
  }

  /* ================= UTIL ================= */
  const nowTime = () =>
    new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  const getService = id =>
    services.find(s => s.id === id) || { name: "Dịch vụ", price: 0 };

  /* ================= RENDER ================= */
  function render() {
    grid.innerHTML = "";

    rooms.forEach(room => {
      if (!room.orders?.length) return;

      room.orders.forEach((order, idx) => {
        if (!order.status) order.status = "pending";

        const card = document.createElement("div");
        card.className = `order-card ${order.status}`;

        card.innerHTML = `
          <div class="order-header">
            <strong>${room.name}</strong>
            <span class="badge ${order.status}">
              ${order.status === "pending" ? "Chờ giao" :
                order.status === "shipping" ? "Đang giao" : "Đã giao"}
            </span>
            <span class="time">${order.deliveryStart || "--:--"}</span>
          </div>

          <div class="order-body">
            <div>${getService(order.svcId).name} × ${order.qty}</div>
          </div>

          <div class="order-action">
            ${renderAction(room.id, idx, order.status)}
          </div>
        `;

        grid.appendChild(card);
      });
    });
  }

  function renderAction(roomId, idx, status) {
    if (status === "pending")
      return `<button onclick="startDelivery('${roomId}',${idx})">Bắt đầu giao</button>`;

    if (status === "shipping")
      return `<button onclick="completeDelivery('${roomId}',${idx})">Xác nhận đã giao</button>`;

    return "";
  }

  /* ================= ACTIONS ================= */
  window.startDelivery = function (roomId, idx) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    room.orders[idx].status = "shipping";
    room.orders[idx].deliveryStart = nowTime();

    saveAll();
    render();
  };

  window.completeDelivery = function (roomId, idx) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const order = room.orders[idx];
    const svc = getService(order.svcId);

    /* ==== CREATE / UPDATE BILL ==== */
    let bill = bills.find(b => b.roomId === room.id);
    if (!bill) {
      const cust = room.customers?.[0] || {};
      bill = {
        roomId: room.id,
        roomName: room.name,
        startTime: Date.now(),
        pricePerHour: room.price,
        customer: cust,
        services: []
      };
      bills.push(bill);
    }

    bill.services.push({
      svcId: order.svcId,
      name: svc.name,
      qty: order.qty,
      price: svc.price
    });

    /* ==== REMOVE ORDER ==== */
    room.orders.splice(idx, 1);

    saveAll();
    render();
  };

  /* ================= INIT ================= */
  load();
  render();
})();
