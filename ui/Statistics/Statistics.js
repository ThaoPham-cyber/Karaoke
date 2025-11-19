document.addEventListener("DOMContentLoaded", () => {
  // === Lấy dữ liệu từ LocalStorage ===
  const roomData = JSON.parse(localStorage.getItem("karaokeRoomData") || '{"rooms": []}');
  const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");

  const rooms = roomData.rooms;

  // === Thống kê số liệu ===
  const totalRooms = rooms.length;
  const inUseRooms = rooms.filter(r => r.status === "inuse").length;
  const availableRooms = rooms.filter(r => r.status === "available").length;
  const bookedRooms = rooms.filter(r => r.status === "booked").length;
  const repairRooms = rooms.filter(r => r.status === "repair").length;

  // Tính doanh thu tổng từ danh sách bookings
  const totalRevenue = bookings.reduce((sum, b) => sum + (parseFloat(b.deposit) || 0), 0);

  // === Cập nhật thẻ hiển thị ===
  document.getElementById("totalRevenue").textContent = totalRevenue.toLocaleString("vi-VN") + " VNĐ";
  document.getElementById("totalCustomers").textContent = new Set(bookings.map(b => b.phone)).size;
  document.getElementById("activeRooms").textContent = inUseRooms;
  document.getElementById("totalRooms").textContent = totalRooms;

  // === Biểu đồ cột: doanh thu theo tháng ===
  const monthlyRevenue = Array(12).fill(0);
  bookings.forEach(b => {
    const month = new Date(b.date).getMonth();
    monthlyRevenue[month] += parseFloat(b.deposit || 0);
  });

  new Chart(document.getElementById("revenueChart"), {
    type: "bar",
    data: {
      labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
      datasets: [{
        label: "Doanh thu (VNĐ)",
        data: monthlyRevenue,
        backgroundColor: "#007bff",
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // === Biểu đồ tròn: tình trạng phòng ===
  const statusData = [availableRooms, inUseRooms, bookedRooms, repairRooms];

  new Chart(document.getElementById("roomStatusChart"), {
    type: "doughnut",
    data: {
      labels: ["Trống", "Đang sử dụng", "Đặt trước", "Sửa chữa"],
      datasets: [{
        data: statusData,
        backgroundColor: ["#28a745", "#ffc107", "#17a2b8", "#dc3545"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });

  // === Bảng chi tiết các đặt phòng ===
  const tbody = document.getElementById("bookingTableBody");
  tbody.innerHTML = bookings.length
    ? bookings.map(b => `
      <tr>
        <td>${b.roomName}</td>
        <td>${b.name}</td>
        <td>${b.date}</td>
        <td>${b.startTime}</td>
        <td>${b.endTime}</td>
        <td>${parseFloat(b.deposit || 0).toLocaleString("vi-VN")}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="6" style="text-align:center;color:gray;">Chưa có dữ liệu đặt phòng</td></tr>`;
});
