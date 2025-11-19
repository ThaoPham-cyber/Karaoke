package src;

import javafx.scene.web.WebEngine;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

public class JSBridge {
    private final WebEngine engine;

    public JSBridge(WebEngine engine) {
        this.engine = engine;
    }

    // ✅ Cho phép JavaScript trong WebView gọi để lấy nội dung HTML
    public String loadHtmlContent(String relativePath) {
        try {
            File file = new File("D:/VSCode/ui/" + relativePath);
            if (file.exists()) {
                System.out.println("📄 Đang tải: " + file.getAbsolutePath());
                return Files.readString(file.toPath(), StandardCharsets.UTF_8);
            } else {
                System.err.println("❌ Không tìm thấy file: " + relativePath);
                return "<p style='color:red'>Không tìm thấy trang " + relativePath + "</p>";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "<p style='color:red'>Lỗi khi tải file: " + e.getMessage() + "</p>";
        }
    }
}
