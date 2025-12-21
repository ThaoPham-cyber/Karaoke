
// SongData.js
const SongData = [
    { id: 1, title: "Nơi này có anh", artist: "Sơn Tùng M-TP", genre: "Pop", time: "4:32", hot: true },
    { id: 2, title: "Muộn rồi mà sao còn", artist: "Sơn Tùng M-TP", genre: "Pop", time: "4:35", hot: true },
    { id: 3, title: "Lạc trôi", artist: "Sơn Tùng M-TP", genre: "Remix", time: "4:58", hot: false },
    { id: 4, title: "Nàng thơ", artist: "Hoàng Dũng", genre: "Ballad", time: "4:12", hot: true },
    { id: 8, title: "Hãy trao cho anh", artist: "Sơn Tùng M-TP", genre: "Remix", time: "4:05", hot: true }
];

// Khởi tạo hàng đợi nếu chưa có (Tránh bị ghi đè khi nạp lại file)
if (typeof PlaylistQueue === 'undefined') {
    var PlaylistQueue = []; 
}