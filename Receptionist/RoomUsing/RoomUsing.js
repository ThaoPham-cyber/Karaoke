/* File: RoomUsing.js - Updated to use Font Awesome icons */

(function () {
    const ROOM_KEY = "karaoke_rooms_v1";
    const SERVICE_KEY = "karaoke_services_v1";
    const container = document.getElementById("roomContainer");

    /* ================= STORAGE ================= */
    function loadRooms() {
        try {
            return JSON.parse(localStorage.getItem(ROOM_KEY)) || [];
        } catch {
            return [];
        }
    }

    function loadServices() {
        try {
            return JSON.parse(localStorage.getItem(SERVICE_KEY)) || [];
        } catch {
            return [];
        }
    }

    /* ================= UTIL ================= */
    function money(v) {
        return Number(v || 0).toLocaleString("vi-VN") + "đ";
    }

    function calcHours(start) {
        // ... (Giữ nguyên logic tính giờ)
        if (!start) return 0;
        const [h, m] = start.split(":").map(Number);
        // Giả định start là HH:MM, tính theo phút
        const startTime = new Date();
        startTime.setHours(h);
        startTime.setMinutes(m);
        startTime.setSeconds(0);
        
        const now = new Date();
        const diffMs = now.getTime() - startTime.getTime();
        
        // Tránh giá trị âm nếu giờ hiện tại nhỏ hơn giờ bắt đầu (xảy ra khi chuyển ngày)
        if (diffMs <= 0) return 1; 

        // Tính giờ đã dùng (làm tròn lên)
        const hours = Math.ceil(diffMs / 3600000); 
        return Math.max(1, hours); 
    }

    /* ================= RENDER ================= */
    function render() {
        const rooms = loadRooms();
        const services = loadServices();

        container.innerHTML = "";

        const usingRooms = rooms.filter(
            r => r.status === "using" || r.status === "ready_to_pay"
        );

        if (!usingRooms.length) {
            container.innerHTML =
                `<div style="padding:40px;text-align:center;color:#6b7280">
                  Không có phòng đang sử dụng
                </div>`;
            return;
        }

        usingRooms.forEach(room => {
            const cust = room.customers?.[0] || {};
            // Giả định `room.price` là giá/giờ
            const roomPricePerHour = room.roomPrice || 100000; 
            const hours = calcHours(cust.start);
            const roomFee = hours * roomPricePerHour;

            let serviceFee = 0;
            let orderCount = 0;
            let pendingOrderCount = 0;

            // Dữ liệu dịch vụ demo từ RoomBooking.js thường lưu ở room.orders
            const orders = (room.orders || []).map(o => {
                const svc = services.find(s => s.id === o.svcId);
                const price = (svc?.price || 0); // Đơn giá
                const total = price * o.qty; // Tổng tiền món
                
                serviceFee += total;
                orderCount += o.qty;

                if (o.served !== true) {
                    pendingOrderCount++;
                }

                return {
                    name: svc?.name || "(Đã xoá)",
                    qty: o.qty,
                    price: total, // Lưu tổng tiền món
                    unitPrice: price, // Lưu đơn giá
                    served: o.served === true,
                    time: o.time || "--:--"
                };
            });
            
            const totalBill = roomFee + serviceFee;
            
            // Xử lý thời gian hiển thị (Giả định `cust.start` là HH:MM)
            const startTimeStr = cust.start || "--:--";
            const usedTimeStr = `${hours}h 00p`; // Có thể thay bằng logic tính phút chi tiết hơn nếu có data

            const card = document.createElement("div");
            card.className = "room-card" + (room.status === "ready_to_pay" ? " ready" : "");
            
            // Tìm badge có đơn chờ
            const pendingBadge = pendingOrderCount > 0 ? 
                `<span class="badge pending">Có đơn chờ</span>` : 
                '';

            card.innerHTML = `
                <div class="room-header">
                    <div class="room-details">
                        <div class="room-status-group">
                            <span class="room-title">${room.name}</span>
                            <span class="badge ${room.status === "ready_to_pay" ? "wait" : "using"}">
                                ${room.status === "ready_to_pay" ? "Sẵn sàng thanh toán" : "Đang sử dụng"}
                            </span>
                            ${pendingBadge}
                            <div class="arrow">
                                <i class="fa-solid fa-angle-down"></i>
                            </div>
                        </div>
                        <div class="room-meta-row">
                            <i class="fa-solid fa-user"></i> ${cust.name || "-"} | 
                            <i class="fa-solid fa-phone"></i> ${cust.phone || "-"}
                        </div>
                    </div>
                    <button class="add-btn" onclick="alert('Thêm món cho ${room.name}')">
                        <i class="fa-solid fa-plus"></i> Thêm món
                    </button>
                </div>

                <div class="room-info">
                    <div>
                        <i class="fa-solid fa-clock"></i> Bắt đầu: ${startTimeStr}
                        <span class="used-time">Đã dùng: ${usedTimeStr}</span>
                    </div>

                    <div>
                        <i class="fa-solid fa-house"></i> Tiền phòng: ${money(roomFee)}
                        <span>(${money(roomPricePerHour)}/h × ${hours}h)</span>
                    </div>

                    <div>
                        <i class="fa-solid fa-basket-shopping"></i> Tiền dịch vụ: ${money(serviceFee)}
                    </div>

                    <div class="total">Tổng: ${money(totalBill)}</div>
                </div>

                <div class="expand">
                    <h4>Tóm tắt sử dụng</h4>
                    <div class="summary-boxes">
                        <div class="box time">
                            <i class="fa-solid fa-clock"></i>
                            <div>
                                <strong>${usedTimeStr}</strong>
                                <span>Bắt đầu lúc ${startTimeStr}</span>
                            </div>
                        </div>
                        <div class="box fee">
                            <i class="fa-solid fa-door-closed"></i>
                            <div>
                                <strong>${money(roomFee)}</strong>
                                <span>${money(roomPricePerHour)}/giờ</span>
                            </div>
                        </div>
                        <div class="box service">
                            <i class="fa-solid fa-martini-glass-citrus"></i>
                            <div>
                                <strong>${money(serviceFee)}</strong>
                                <span>${orders.length} đơn hàng</span>
                            </div>
                        </div>
                    </div>

                    <h4>Chi tiết dịch vụ đã sử dụng (${orders.length} đơn hàng - ${pendingOrderCount} chờ phục vụ)</h4>
                    ${orders.length ? orders.map(o => `
                        <div class="service-item">
                            <div>
                                <strong>${o.qty} × ${o.name}</strong><br>
                                <span>🕒 ${o.time}, ${money(o.unitPrice)}/món</span>
                            </div>
                            <span class="status ${o.served ? "done" : "wait"}">
                                ${o.served ? "Đã phục vụ" : "Chờ phục vụ"}
                            </span>
                        </div>
                    `).join("") : `<div style="color:${'#6b7280'}; padding:10px 0;">Chưa có dịch vụ nào được đặt</div>`}
                </div>
            `;

            // Logic mở/đóng
            const arrow = card.querySelector(".arrow");
            const expand = card.querySelector(".expand");
            const header = card.querySelector(".room-header");
            
            // Click vào mũi tên để mở/đóng
            arrow.onclick = (e) => {
                e.stopPropagation(); // Ngăn chặn sự kiện lan truyền
                expand.classList.toggle("show");
                arrow.classList.toggle("open");
                card.classList.toggle("expanded");
            };
            
            // Có thể click vào bất cứ đâu trên header (trừ nút Thêm món) để mở/đóng
            card.querySelector(".room-details").onclick = () => {
                expand.classList.toggle("show");
                arrow.classList.toggle("open");
                card.classList.toggle("expanded");
            };


            container.appendChild(card);
        });
    }

    // Tải dữ liệu và render khi trang load
    render();
})();