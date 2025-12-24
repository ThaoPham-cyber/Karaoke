const BOOKING_KEY = "karaoke_bookings_v1";
let bookings = [];
let selectedDate = new Date();

/* ================== STORAGE ================== */
function loadBookings() {
    bookings = JSON.parse(localStorage.getItem(BOOKING_KEY) || "[]");
}

function saveBookings() {
    localStorage.setItem(BOOKING_KEY, JSON.stringify(bookings));
}

/* ================== PHÒNG ================== */
function renderRoomSelect() {
    const rooms = JSON.parse(localStorage.getItem("karaoke_rooms_v1") || "[]");
    const select = document.getElementById("roomSelect");

    select.innerHTML = `<option value="">-- Chọn phòng --</option>` +
        rooms.map(r => `<option value="${r.id}">${r.name}</option>`).join("");
}

/* ================== DATE SELECT ================== */
function initDateSelect() {
    const day = document.getElementById("daySelect");
    const month = document.getElementById("monthSelect");
    const year = document.getElementById("yearSelect");

    day.innerHTML = "";
    month.innerHTML = "";
    year.innerHTML = "";

    for (let i = 1; i <= 31; i++) {
        day.innerHTML += `<option value="${i}">${i}</option>`;
    }

    for (let i = 1; i <= 12; i++) {
        month.innerHTML += `<option value="${i}">Tháng ${i}</option>`;
    }

    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i <= currentYear + 1; i++) {
        year.innerHTML += `<option value="${i}">${i}</option>`;
    }
}

function getSelectedDate() {
    const d = daySelect.value;
    const m = monthSelect.value;
    const y = yearSelect.value;

    if (!d || !m || !y) return null;

    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/* ================== CALENDAR GRID ================== */
function renderCalendar() {
    const grid = document.getElementById("calendarGrid");
    grid.innerHTML = "";

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();

    document.getElementById("calendarMonth").innerText =
        `Tháng ${month}/${year}`;

    for (let day = 1; day <= daysInMonth; day++) {

        const dateStr =
            `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

        const dayBookings = bookings.filter(b => b.date === dateStr);

        const cell = document.createElement("div");
        cell.className = "day-cell";
        cell.innerHTML = `<strong>${day}</strong>`;

        /* ===== highlight có lịch ===== */
        if (dayBookings.length > 0) {
            cell.classList.add("has-booking");

            if (dayBookings.length >= 3) {
                cell.classList.add("busy");
            }

            cell.title = dayBookings
                .map(b => `${b.roomName} (${b.start}-${b.end})`)
                .join("\n");

            const badge = document.createElement("span");
            badge.className = "badge";
            badge.innerText = dayBookings.length;
            cell.appendChild(badge);
        }

        cell.onclick = () => selectDay(day, cell);
        grid.appendChild(cell);
    }
}


function selectDay(day, cell) {
    document.querySelectorAll(".day-cell")
        .forEach(c => c.classList.remove("active"));

    cell.classList.add("active");

    const dateStr =
        `${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

    document.getElementById("selectedDateTitle").innerText =
        `Lịch ngày ${day}`;

    renderBookingList(dateStr);
}


/* ================== BOOKING LIST ================== */
function renderBookingList(date) {
    const list = document.getElementById("bookingList");
    const filtered = bookings.filter(b => b.date === date);

    list.innerHTML = filtered.length === 0
        ? `<p class="empty">Chưa có lịch hẹn</p>`
        : filtered.map(b => `
            <div class="booking-item">
                <strong>${b.roomName}</strong>
                <div>${b.start} - ${b.end}</div>
                <div>${b.customer}</div>
                <div>Cọc: ${b.deposit.toLocaleString()}đ</div>
            </div>
        `).join("");
}

/* ================== MODAL ================== */
function openBookingModal() {
    document.getElementById("bookingModal").classList.remove("hidden");
    initDateSelect();
}

function closeBookingModal() {
    document.getElementById("bookingModal").classList.add("hidden");
}

/* ================== SAVE BOOKING ================== */
function saveBooking() {
    const date = getSelectedDate();
    const roomId = roomSelect.value;
    const slot = timeSlot.value;

    if (!date || !roomId || !slot || !customerName.value) {
        alert("Vui lòng chọn đầy đủ ngày, phòng, khung giờ và tên khách");
        return;
    }

    const rooms = JSON.parse(localStorage.getItem("karaoke_rooms_v1") || "[]");
    const room = rooms.find(r => r.id === roomId);
    const [start, end] = slot.split(" - ");
    const ROOM_PRICE_PER_HOUR = 100000;

const hours = parseInt(end) - parseInt(start);
const roomTotal = hours * ROOM_PRICE_PER_HOUR;

    bookings.push({
        id: Date.now(),
        roomId,
        roomName: room.name,
        date,
        start,
        end,
        customer: customerName.value,
        phone: phone.value,
        deposit: Number(deposit.value || 0),
        note: note.value,
        total: roomTotal,
        status: "confirmed"
    });

    saveBookings();
    closeBookingModal();
    renderSummary();
    renderBookingList(date);
}

/* ================== SUMMARY ================== */
function renderSummary() {
    document.getElementById("sumTotal").innerText = bookings.length;
    document.getElementById("sumConfirmed").innerText =
        bookings.filter(b => b.status === "confirmed").length;
    document.getElementById("sumPending").innerText =
        bookings.filter(b => b.status === "pending").length;
    document.getElementById("sumDeposit").innerText =
        bookings.reduce((s, b) => s + b.deposit, 0).toLocaleString() + "đ";
}

/* ================== INIT ================== */
function init() {
    loadBookings();
    renderRoomSelect();
    renderCalendar();
    renderSummary();
}

init();
