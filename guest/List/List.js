// List.js
let isPlaying = true;
let currentSeconds = 0;

function togglePlay() {
    isPlaying = !isPlaying;
    const playBtn = document.querySelector('.btn-ctrl i');
    if (playBtn) {
        playBtn.className = isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play";
    }
}

function nextSong() {
    if (PlaylistQueue.length > 0) {
        PlaylistQueue.shift(); 
        currentSeconds = 0;
        renderPlaylist();
    }
}

// Hàm cập nhật thời gian bài hát mỗi giây
setInterval(() => {
    if (!isPlaying || PlaylistQueue.length === 0) return;

    currentSeconds++;
    const progress = document.querySelector('.progress');
    const currentTimeText = document.querySelector('.time-info span:first-child');
    
    // Giả lập tổng thời gian bài hát là 272 giây (4:32)
    const totalSeconds = 272; 
    
    if (progress) {
        let percent = (currentSeconds / totalSeconds) * 100;
        progress.style.width = percent + "%";
    }

    if (currentTimeText) {
        let m = Math.floor(currentSeconds / 60);
        let s = currentSeconds % 60;
        currentTimeText.innerText = `${m}:${String(s).padStart(2, '0')}`;
    }

    if (currentSeconds >= totalSeconds) nextSong();
}, 1000);
function renderPlaylist() {
    const container = document.getElementById("playlistContainer");
    const countLabel = document.getElementById("queueCount");
    const titleNode = document.getElementById("currentTitle");
    const artistNode = document.getElementById("currentArtist");

    if (!container) return;

    container.innerHTML = "";
    countLabel.innerText = PlaylistQueue.length;

    if (PlaylistQueue.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding:20px; color:#94a3b8;'>Hàng đợi trống. Hãy quay lại trang bài hát để thêm!</p>";
        if (titleNode) titleNode.innerText = "Chưa có bài hát";
        if (artistNode) artistNode.innerText = "Vui lòng thêm bài hát từ danh sách";
        return;
    }

    // Hiển thị bài đầu tiên lên Card "Đang phát"
    if (titleNode) titleNode.innerText = PlaylistQueue[0].title;
    if (artistNode) artistNode.innerText = PlaylistQueue[0].artist;

    // Render danh sách hàng đợi
    PlaylistQueue.forEach((s, index) => {
        const div = document.createElement("div");
        div.className = "queue-item";
        div.innerHTML = `
            <div class="q-index">${index + 1}</div>
            <div class="q-info">
                <strong>${s.title}</strong>
                <span>${s.artist} • ${s.time}</span>
            </div>
            <div class="q-status"><span class="badge">Chờ phát</span></div>
            <button class="btn-delete" onclick="removeFromQueue('${s.qId}')">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        container.appendChild(div);
    });
}

function removeFromQueue(qId) {
    // Lưu ý: qId là String từ Date.now()
    PlaylistQueue = PlaylistQueue.filter(s => String(s.qId) !== String(qId));
    renderPlaylist();
}