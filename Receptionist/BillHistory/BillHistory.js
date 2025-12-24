(() => {

  const BILL_HISTORY_KEY = "karaoke_bill_history_v1";
  const bodyEl = document.getElementById("billHistoryBody");

  const modal = document.getElementById("billDetailModal");
  const closeBtn = modal.querySelector(".close");

  const mRoom = document.getElementById("mRoom");
  const mCustomer = document.getElementById("mCustomer");
  const mTime = document.getElementById("mTime");
  const mPayment = document.getElementById("mPayment");
  const mRoomFee = document.getElementById("mRoomFee");
  const mServices = document.getElementById("mServices");
  const mDiscount = document.getElementById("mDiscount");
  const mTotal = document.getElementById("mTotal");

  const formatCurrency = v =>
    Number(v || 0).toLocaleString("vi-VN") + "đ";

  function loadHistory() {
    return JSON.parse(localStorage.getItem(BILL_HISTORY_KEY)) || [];
  }

  function renderTable() {
    const history = loadHistory();
    bodyEl.innerHTML = "";

    if (!history.length) {
      bodyEl.innerHTML = `
        <tr><td colspan="6">Chưa có hóa đơn nào</td></tr>`;
      return;
    }

    history.reverse().forEach(bill => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${new Date(bill.paidAt).toLocaleDateString("vi-VN")}</td>
        <td>${bill.roomName}</td>
        <td>${bill.customer?.name || "Khách lẻ"}</td>
        <td>
          ${new Date(bill.startTime).toLocaleTimeString("vi-VN")} -
          ${new Date(bill.endTime).toLocaleTimeString("vi-VN")}
        </td>
        <td>${bill.paymentMethod}</td>
        <td>
          <i class="fa-solid fa-eye view-btn"></i>
        </td>
      `;

      tr.querySelector(".view-btn").onclick = () =>
        openDetail(bill);

      bodyEl.appendChild(tr);
    });
  }

  function openDetail(bill) {
    mRoom.textContent = bill.roomName;
    mCustomer.textContent = bill.customer?.name || "Khách lẻ";
    mPayment.textContent = bill.paymentMethod;
    mDiscount.textContent = formatCurrency(bill.discount || 0);
    mTotal.textContent = formatCurrency(bill.grandTotal);

    mTime.textContent =
      new Date(bill.startTime).toLocaleString("vi-VN") +
      " → " +
      new Date(bill.endTime).toLocaleString("vi-VN");

    mRoomFee.innerHTML =
      formatCurrency(bill.totalRoomFee || 0);

    mServices.innerHTML = bill.services.map(s => `
      <div>${s.name} × ${s.qty} — ${formatCurrency(s.price * s.qty)}</div>
    `).join("");

    modal.classList.remove("hidden");
  }

  closeBtn.onclick = () => modal.classList.add("hidden");
  modal.onclick = e => e.target === modal && modal.classList.add("hidden");

  renderTable();

})();
