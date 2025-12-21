/**
 * Vẽ danh sách bài hát ra màn hình
 * @param {Array} list Danh sách bài hát cần hiển thị
 */
function renderSongs(list) {
    const box = document.getElementById("songList");
    if (!box) return;
    box.innerHTML = "";

    list.forEach(s => {
        const div = document.createElement("div");
        div.className = "song-item";
        div.innerHTML = `
            <div class="song-info">
                <strong>${s.title}</strong>
                <span>${s.artist} • ${s.time}</span>
            </div>
            <button class="btn-add" onclick="addSongToQueue(${s.id})"> 
                <i class="fa-solid fa-plus"></i> Thêm
            </button>
        `;
        box.appendChild(div);
    });
}

function addSongToQueue(songId) {
    // 1. Tìm bài hát trong kho dữ liệu dựa trên ID
    const song = SongData.find(item => item.id === songId);
    
    if (song) {
        const newQueueItem = { ...song, qId: Date.now() + Math.random() };
        PlaylistQueue.push(newQueueItem);

        alert("Đã thêm: " + song.title);
        console.log("Hàng đợi hiện tại:", PlaylistQueue);
    } else {
        console.error("Không tìm thấy bài hát có ID:", songId);
    }
}

/**
 * Lọc bài hát theo thể loại
 */
function filterGenre(genreName, btnElement) {
    const buttons = document.querySelectorAll(".genre button");
    buttons.forEach(btn => btn.classList.remove("active"));
    btnElement.classList.add("active");
    const filtered = (genreName === "all") 
        ? SongData 
        : SongData.filter(s => s.genre === genreName);
    
    renderSongs(filtered);
}

/**
 * Tìm kiếm bài hát
 */
function searchSong() {
    const keyword = document.getElementById("searchInput").value.toLowerCase();
    const filtered = SongData.filter(s => 
        s.title.toLowerCase().includes(keyword) || 
        s.artist.toLowerCase().includes(keyword)
    );
    renderSongs(filtered);
}

