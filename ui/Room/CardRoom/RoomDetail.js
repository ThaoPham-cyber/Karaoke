document.addEventListener("DOMContentLoaded", () => {
    const roomInfo = document.getElementById("roomInfo");
    const orderList = document.getElementById("orderList");
    const itemName = document.getElementById("itemName");
    const itemPrice = document.getElementById("itemPrice");
    const btnAddItem = document.getElementById("btnAddItem");
    const btnPay = document.getElementById("btnPay");
    const btnBack = document.getElementById("btnBack");
    const totalPriceEl = document.getElementById("totalPrice");

    const roomId = localStorage.getItem("selectedRoom") || "1";
    roomInfo.innerHTML = `<p><b>Mã Phòng:</b> ${roomId}</p><p><b>Tên:</b> Phòng ${100 + parseInt(roomId)}</p>`;

    let orders = [];
    let total = 0;

    btnAddItem.addEventListener("click", () => {
        const name = itemName.value.trim();
        const price = parseFloat(itemPrice.value);

        if (!name || isNaN(price) || price <= 0) {
            alert("Vui lòng nhập tên và giá hợp lệ!");
            return;
        }

        orders.push({ name, price });
        total += price;

        const li = document.createElement("li");
        li.textContent = `${name} - ${price.toLocaleString()} VNĐ`;
        orderList.appendChild(li);

        totalPriceEl.textContent = total.toLocaleString();
        itemName.value = "";
        itemPrice.value = "";
    });

    btnPay.addEventListener("click", () => {
        if (orders.length === 0) {
            alert("Chưa có món nào để thanh toán!");
            return;
        }
        alert(`Thanh toán thành công!\nTổng tiền: ${total.toLocaleString()} VNĐ`);
        orders = [];
        orderList.innerHTML = "";
        total = 0;
        totalPriceEl.textContent = "0";
    });

    document.getElementById("btnBack").addEventListener("click", () => {
  javaBridge.loadPage("D:/VSCode/ui/Room/Room.html");
});
});
