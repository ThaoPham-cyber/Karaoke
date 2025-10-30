const contentArea = document.getElementById("content-area");
const buttons = document.querySelectorAll(".menu button");

buttons.forEach(button => {
  button.addEventListener("click", async () => {
    const page = button.dataset.page; 
    buttons.forEach(b => b.classList.remove("active"));
    button.classList.add("active");

    try {
      const response = await fetch(`pages/${page}.html`);
      const html = await response.text();
      contentArea.innerHTML = html;
      contentArea.style.width = "100%";
      contentArea.style.height = "100%";
    } catch (error) {
      contentArea.innerHTML = `<p style="color:red;">Không thể tải ${page}.html</p>`;
    }
  });
});
