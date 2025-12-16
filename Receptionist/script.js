// File: D:/VSCode/ui/script.js
const contentArea = document.getElementById("content-area");

// ✅ Hàm nạp trang con qua Bridge (Java gọi)
window.loadContentPage = async function (folder, page) {
  try {
    const path = `${folder}/${page}.html`;
    console.log("🔄 Đang load:", path);

    // ⚙️ Gọi Java Bridge
    const html = Bridge.loadHtmlContent(path);
    contentArea.innerHTML = html;

    // 🔁 Sau khi chèn, nạp lại các file script bên trong (Flatpickr, RoomBooking.js, ...)
    const scripts = contentArea.querySelectorAll("script[src]");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      newScript.src = oldScript.src;
      document.body.appendChild(newScript);
    });

  } catch (e) {
    console.error("Lỗi loadContentPage:", e);
    contentArea.innerHTML = `<p style="color:red;">Không thể tải trang ${page}</p>`;
  }
};
