/* =========================================================
   Bill.js – Production version (FINAL)
   - Thanh toán & khóa bill
   - Lưu lịch sử bill (bill_history)
   - Đồng bộ Room / Staff
========================================================= */

(() => {

  /* ================== STORAGE KEYS ================== */
  const BILL_KEY = "karaoke_bill_pending_v1";
  const BILL_HISTORY_KEY = "karaoke_bill_history_v1";
  const ROOM_KEY = "karaoke_rooms_v1";

  /* ================== DOM ================== */
  const waitingRoomList = document.getElementById("waitingRoomList");
  const waitingCountEl = document.getElementById("waitingCount");

  const billRoomName = document.getElementById("billRoomName");
  const billCustomerName = document.getElementById("billCustomerName");
  const billCustomerPhone = document.getElementById("billCustomerPhone");
  const billTimeRange = document.getElementById("billTimeRange");

  const roomFeeDetail = document.getElementById("roomFeeDetail");
  const serviceDetail = document.getElementById("serviceDetail");

  const subTotalEl = document.getElementById("subTotal");
  const discountEl = document.getElementById("discount");
  const grandTotalEl = document.getElementById("grandTotal");

  const paymentMethods = document.getElementById("paymentMethods");
  const cashReceivedInput = document.getElementById("cashReceived");
  const cashReturnEl = document.getElementById("cashReturn");
  const confirmPaymentBtn = document.getElementById("confirmPayment");

  /* ================== STATE ================== */
  let bills = [];
  let rooms = [];
  let selectedRoomId = null;
  let paymentMethod = "cash";
  let grandTotalAmount = 0;

  /* ================== UTIL ================== */
  const formatCurrency = v =>
    Number(v || 0).toLocaleString("vi-VN") + "đ";

  const loadJSON = key => {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  };

  const saveJSON = (key, data) =>
    localStorage.setItem(key, JSON.stringify(data));

  /* ================== LOAD DATA ================== */
  function loadData() {
    bills = loadJSON(BILL_KEY);
    rooms = loadJSON(ROOM_KEY);
  }

  /* ================== CALC ================== */
  function calcRoomFee(bill) {
    const hours = Math.max(
      1,
      Math.ceil((Date.now() - bill.startTime) / 3600000)
    );
    return {
      hours,
      total: hours * bill.pricePerHour
    };
  }

  function calcServiceTotal(bill) {
    return bill.services.reduce(
      (sum, s) => sum + s.price * s.qty,
      0
    );
  }

  /* ================== UI ================== */
  function hideBillDetails() {
    document.getElementById("billDetails").innerHTML = `
      <div style="padding:50px;text-align:center;color:#999">
        ← Chọn phòng để xem hóa đơn
      </div>`;
    confirmPaymentBtn.disabled = true;
  }

  /* ================== RENDER WAITING ================== */
  function renderWaitingRooms() {
    waitingRoomList.innerHTML = "";
    waitingCountEl.textContent = bills.length;

    if (!bills.length) {
      hideBillDetails();
      return;
    }

    bills.forEach(bill => {
      const div = document.createElement("div");
      div.className = "waiting-room-item";
      div.dataset.id = bill.roomId;

      if (bill.roomId === selectedRoomId) {
        div.classList.add("active");
      }

      const total =
        calcRoomFee(bill).total + calcServiceTotal(bill);

      div.innerHTML = `
        <div class="room-name">${bill.roomName}</div>
        <div class="customer-name">${bill.customer?.name || "Khách lẻ"}</div>
        <div class="total-amount">${formatCurrency(total)}</div>
      `;

      div.onclick = () => selectBill(bill.roomId);
      waitingRoomList.appendChild(div);
    });

    if (!selectedRoomId) {
      selectBill(bills[0].roomId);
    }
  }

  /* ================== SELECT BILL ================== */
  function selectBill(roomId) {
    selectedRoomId = roomId;

    document.querySelectorAll(".waiting-room-item")
      .forEach(el =>
        el.classList.toggle("active", el.dataset.id === roomId)
      );

    const bill = bills.find(b => b.roomId === roomId);
    if (bill) renderBillDetails(bill);
  }

  /* ================== BILL DETAILS ================== */
  function renderBillDetails(bill) {
    const roomFee = calcRoomFee(bill);
    const serviceTotal = calcServiceTotal(bill);

    grandTotalAmount = roomFee.total + serviceTotal;

    billRoomName.textContent = bill.roomName;
    billCustomerName.textContent = bill.customer?.name || "Khách lẻ";
    billCustomerPhone.textContent = bill.customer?.phone || "—";

    billTimeRange.textContent =
      new Date(bill.startTime).toLocaleTimeString("vi-VN", {hour:"2-digit",minute:"2-digit"}) +
      " - " +
      new Date().toLocaleTimeString("vi-VN", {hour:"2-digit",minute:"2-digit"});

    roomFeeDetail.innerHTML = `
      <span>${bill.roomName} × ${roomFee.hours}h</span>
      <strong>${formatCurrency(roomFee.total)}</strong>
    `;

    serviceDetail.innerHTML = bill.services.map(s => `
      <div>
        <span>${s.name} × ${s.qty}</span>
        <strong>${formatCurrency(s.price * s.qty)}</strong>
      </div>
    `).join("");

    subTotalEl.textContent = formatCurrency(grandTotalAmount);
    discountEl.textContent = formatCurrency(0);
    grandTotalEl.textContent = formatCurrency(grandTotalAmount);

    confirmPaymentBtn.disabled = false;
    updateCashReturn();
  }

  /* ================== PAYMENT ================== */
  function updateCashReturn() {
    const received = Number(cashReceivedInput.value || 0);
    const change = received - grandTotalAmount;

    cashReturnEl.textContent = formatCurrency(Math.max(0, change));
    cashReturnEl.style.color = change >= 0 ? "#22c55e" : "#ef4444";

    confirmPaymentBtn.disabled =
      paymentMethod === "cash" && received < grandTotalAmount;
  }

  paymentMethods.onclick = e => {
    const btn = e.target.closest(".pay-method");
    if (!btn) return;

    paymentMethod = btn.dataset.method;
    document.querySelectorAll(".pay-method")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelector(".cash-input-wrap").style.display =
      paymentMethod === "cash" ? "" : "none";
    document.querySelector(".cash-return-wrap").style.display =
      paymentMethod === "cash" ? "" : "none";

    if (paymentMethod !== "cash") {
      cashReceivedInput.value = grandTotalAmount;
    }

    updateCashReturn();
  };

  cashReceivedInput.oninput = updateCashReturn;

  /* ================== CONFIRM PAYMENT ================== */
  confirmPaymentBtn.onclick = () => {
    if (!selectedRoomId) return;
    if (!confirm("Xác nhận thanh toán?")) return;

    const billIndex = bills.findIndex(b => b.roomId === selectedRoomId);
    if (billIndex < 0) return;

    const bill = bills[billIndex];
    const roomFee = calcRoomFee(bill);
    const serviceTotal = calcServiceTotal(bill);

    /* ===== SAVE HISTORY ===== */
    const history = loadJSON(BILL_HISTORY_KEY);
    history.push({
      billId: "BILL_" + Date.now().toString(36),
      roomId: bill.roomId,
      roomName: bill.roomName,
      customer: bill.customer,
      startTime: bill.startTime,
      endTime: Date.now(),
      pricePerHour: bill.pricePerHour,
      services: bill.services,
      totalRoomFee: roomFee.total,
      totalServiceFee: serviceTotal,
      grandTotal: roomFee.total + serviceTotal,
      paymentMethod,
      cashReceived: Number(cashReceivedInput.value || 0),
      cashReturn:
        Math.max(0, Number(cashReceivedInput.value) - (roomFee.total + serviceTotal)),
      paidAt: Date.now(),
      status: "paid"
    });
    saveJSON(BILL_HISTORY_KEY, history);

    /* ===== REMOVE PENDING ===== */
    bills.splice(billIndex, 1);
    saveJSON(BILL_KEY, bills);

    /* ===== RELEASE ROOM ===== */
    const room = rooms.find(r => r.id === selectedRoomId);
    if (room) {
      room.status = "available";
      room.customers = [];
      room.orders = [];
      saveJSON(ROOM_KEY, rooms);
    }

    selectedRoomId = null;
    renderWaitingRooms();
    alert("Thanh toán thành công. Bill đã được khóa.");
  };

  /* ================== INIT ================== */
  function init() {
    loadData();
    renderWaitingRooms();
  }

  init();

})();
