/* =========================================
   BillHistory.js – POS History + Modal
========================================= */

(() => {
  const STORAGE_KEY = "karaoke_bill_history_v1";

  const tableBody = document.getElementById("billTableBody");
  const searchInput = document.getElementById("searchInput");
  const fromDate = document.getElementById("fromDate");
  const toDate = document.getElementById("toDate");

  const modal = document.getElementById("billModal");
  const modalContent = document.getElementById("modalContent");

  let bills = [];

  /* ========== LOAD ========= */
  function load() {
    try {
      bills = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      bills = [];
    }
  }

  /* ========== UTIL ========= */
  const money = v => Number(v).toLocaleString("vi-VN") + "đ";

  /* ========== FILTER ========= */
  function getFiltered() {
    const kw = searchInput.value.toLowerCase();

    return bills.filter(b => {
      const text =
        (b.roomName + b.customer?.name + b.customer?.phone).toLowerCase();

      const paidDate = new Date(b.paidAt).toISOString().slice(0, 10);

      return (
        (!kw || text.includes(kw)) &&
        (!fromDate.value || paidDate >= fromDate.value) &&
        (!toDate.value || paidDate <= toDate.value)
      );
    });
  }

  /* ========== RENDER ========= */
  function render() {
    tableBody.innerHTML = "";

    getFiltered().forEach((b, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${b.roomName}</td>
        <td>${b.customer?.name || "Khách lẻ"}</td>
        <td>${new Date(b.paidAt).toLocaleString("vi-VN")}</td>
        <td class="total">${money(b.total)}</td>
        <td class="method">${b.paymentMethod}</td>
        <td>
          <button class="btn-view" onclick="viewBill('${b.id}')">
            Xem
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  /* ========== MODAL ========= */
  window.viewBill = function (id) {
    const b = bills.find(x => x.id === id);
    if (!b) return;

    modalContent.innerHTML = `
      <div class="modal-row"><span>Phòng</span><strong>${b.roomName}</strong></div>
      <div class="modal-row"><span>Khách</span><strong>${b.customer?.name || "Khách lẻ"}</strong></div>
      <div class="modal-row"><span>SĐT</span><strong>${b.customer?.phone || "-"}</strong></div>
      <div class="modal-row"><span>Thanh toán</span><strong>${b.paymentMethod}</strong></div>
      <div class="modal-row"><span>Thời gian</span><strong>${new Date(b.paidAt).toLocaleString("vi-VN")}</strong></div>

      <div class="modal-section">
        <h4>Dịch vụ</h4>
        ${b.services.map(s => `
          <div class="modal-item">
            <span>${s.name} × ${s.qty}</span>
            <strong>${money(s.price * s.qty)}</strong>
          </div>
        `).join("")}
      </div>

      <div class="modal-section">
        <div class="modal-item">
          <span>Tổng cộng</span>
          <strong style="color:#e91e8f">${money(b.total)}</strong>
        </div>
      </div>
    `;

    modal.style.display = "flex";
  };

  window.closeModal = () => modal.style.display = "none";

  modal.onclick = e => {
    if (e.target === modal) closeModal();
  };

  /* ========== EVENTS ========= */
  searchInput.oninput = render;
  fromDate.onchange = render;
  toDate.onchange = render;

  /* ========== INIT ========= */
  load();
  render();
})();
