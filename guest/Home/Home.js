const startTime = Date.now();

// Cập nhật đồng hồ
function updateTime() {
    const diff = Date.now() - startTime;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    document.getElementById("runningTime").textContent = 
        `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    document.getElementById("usageTime").textContent = `${h} giờ ${m} phút`;
}
setInterval(updateTime, 1000);

// Hàm chuyển tab
function setActiveNav(element) {
    document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
    element.classList.add("active");
}

// Nạp giao diện Chọn bài hát
function loadSongPage(element) {
    setActiveNav(element);
    const contentArea = document.getElementById("content-area");
    
    // Chèn cấu trúc HTML của trang Song
    contentArea.innerHTML = `
        <div class="song-page">
            <h2>Chọn bài hát</h2>
            <p class="sub">Tìm và thêm bài hát vào danh sách phát</p>
            <div class="search-container">
                <div class="search-box">
                    <input id="searchInput" placeholder="Tìm tên bài hát, ca sĩ..." onkeyup="searchSong()">
                    <button onclick="searchSong()"><i class="fa-solid fa-magnifying-glass"></i></button>
                </div>
            </div>
            <div class="genre">
                <button class="active" onclick="filterGenre('all', this)">Tất cả</button>
                <button onclick="filterGenre('Pop', this)">Pop</button>
                <button onclick="filterGenre('Ballad', this)">Ballad</button>
                <button onclick="filterGenre('Remix', this)">Remix</button>
                <button onclick="filterGenre('Bolero', this)">Bolero</button>
            </div>
            <div id="songList" class="song-list"></div>
        </div>
    `;
    // Gọi hàm render từ Song.js để đổ dữ liệu vào #songList
    if (typeof renderSongs === "function") {
        renderSongs(SongData);
    }
}

// Khởi tạo trang mặc định khi vừa mở
window.onload = () => {
    loadSongPage(document.querySelector(".nav-item"));
};
setTimeout(() => {
        if (typeof renderSongs === "function" && typeof SongData !== 'undefined') {
            renderSongs(SongData);
        }
    }, 50);
// ... các hàm khác giữ nguyên ...

function loadPlaylistPage(element) {
    setActiveNav(element);
    const contentArea = document.getElementById("content-area");
    
    // Nạp giao diện List trực tiếp
    contentArea.innerHTML = `
        <div class="playlist-page">
            <div class="now-playing-card">
                <div class="playing-label"><i class="fa-solid fa-volume-high"></i> Đang phát</div>
                <div class="playing-content">
                    <div class="song-art"><i class="fa-solid fa-music"></i></div>
                    <div class="playing-info">
                        <h2 id="currentTitle">Chưa có bài hát</h2>
                        <p id="currentArtist">Vui lòng thêm bài hát từ danh sách</p>
                        <div class="progress-bar"><div class="progress" style="width: 30%"></div></div>
                        <div class="time-info"><span>1:30</span><span>4:32</span></div>
                    </div>
                    <div class="player-controls">
                        <button class="btn-ctrl" onclick="togglePlay()"><i class="fa-solid fa-pause"></i></button>
                        <button class="btn-ctrl" onclick="nextSong()"><i class="fa-solid fa-forward-step"></i></button>
                    </div>
                </div>
            </div>

            <div class="queue-section">
                <h3>Hàng đợi (<span id="queueCount">0</span> bài)</h3>
                <div id="playlistContainer" class="queue-list"></div>
            </div>
        </div>
    `;
 // Home.js

    // Gọi hàm render từ List.js
    if (typeof renderPlaylist === "function") {
        renderPlaylist();
    }
}
function loadFoodPage(element) {
    setActiveNav(element);
    const contentArea = document.getElementById("content-area");

    
    // Nạp HTML bằng Template String (vì bạn không chạy server để dùng fetch)
    contentArea.innerHTML = `<div class="food-page">
    <div class="food-main">
        <div class="food-header">
            <div class="search-box">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" id="foodSearch" placeholder="Tìm kiếm món ăn..." onkeyup="searchFood()">
            </div>
            <div class="category-tabs">
                <button class="active" onclick="filterFood('all', this)">Tất cả</button>
                <button onclick="filterFood('Đồ uống có cồn', this)">Đồ uống</button>
                <button onclick="filterFood('Nước ngọt', this)">Nước ngọt</button>
                <button onclick="filterFood('Đồ ăn nhẹ', this)">Đồ ăn</button>
            </div>
        </div>
        <div id="foodGrid" class="food-grid">
            </div>
    </div>

    <div class="cart-sidebar">
        <div class="cart-header">
            <div class="cart-icon"><i class="fa-solid fa-cart-shopping"></i></div>
            <div>
                <h3>Giỏ hàng</h3>
                <span id="cartCount">0 món</span>
            </div>
        </div>
        <div id="cartList" class="cart-items">
            </div>
        <div class="cart-summary">
            <div class="summary-line">
                <span>Tạm tính</span>
                <span id="cartSubtotal">0đ</span>
            </div>
            <div class="summary-line total">
                <span>Tổng cộng</span>
                <span id="cartTotal">0đ</span>
            </div>
            <button class="btn-checkout" onclick="sendOrder()">
                <i class="fa-solid fa-paper-plane"></i> Gửi đơn hàng
            </button>
        </div>
    </div>
</div>`;
    
    currentCategory = "all";
    currentFoodList = FoodData;

    renderFood(currentFoodList);
    updateCartUI();
}
