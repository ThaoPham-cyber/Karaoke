document.addEventListener("DOMContentLoaded", () => {
    const tblRooms = document.querySelector("#tblRooms tbody");
    const btnAddRoom = document.getElementById("btnAddRoom");
    const btnBack = document.getElementById("btnBack");

    let rooms = [
        { id: 1, name: "Phòng 101", status: "Trống", customer: "" },
        { id: 2, name: "Phòng 102", status: "Có Khách", customer: "Nguyễn Văn A" }
    ];

    function renderRooms() {
        tblRooms.innerHTML = "";
        rooms.forEach(room => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${room.id}</td>
                <td>${room.name}</td>
                <td>${room.status}</td>
                <td>${room.customer}</td>
                <td>
                    <button class="btnDetail" data-id="${room.id}">Chi tiết</button>
                    <button class="btnDelete" data-id="${room.id}">Xóa</button>
                </td>
            `;
            tblRooms.appendChild(tr);
        });
    }

    btnAddRoom.addEventListener("click", () => {
        const newId = rooms.length + 1;
        rooms.push({ id: newId, name: `Phòng ${100 + newId}`, status: "Trống", customer: "" });
        renderRooms();
    });

    tblRooms.addEventListener("click", e => {
        if (e.target.classList.contains("btnDetail")) {
            const id = e.target.dataset.id;
            localStorage.setItem("selectedRoom", id);
            window.location.href = "RoomDetail.html";
        }
        if (e.target.classList.contains("btnDelete")) {
            const id = e.target.dataset.id;
            rooms = rooms.filter(r => r.id != id);
            renderRooms();
        }
    });

    document.getElementById("btnBack").addEventListener("click", () => {
  javaBridge.loadPage("D:/VSCode/ui/Room/Room.html");
});

    renderRooms();
});
