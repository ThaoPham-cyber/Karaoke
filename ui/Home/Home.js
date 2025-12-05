document.addEventListener("DOMContentLoaded", () => {

    // hiệu ứng khi nhấn quick-item
    const items = document.querySelectorAll(".quick-item");

    items.forEach(item => {
        item.addEventListener("click", () => {
            item.style.transform = "scale(0.95)";
            setTimeout(() => item.style.transform = "scale(1)", 150);
        });
    });

});
