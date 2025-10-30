package src;

import javafx.scene.web.WebEngine;
import java.io.File;
import java.nio.file.Files;

public class JSBridge {
    private final WebEngine engine;

    public JSBridge(WebEngine engine) {
        this.engine = engine;
    }

    // Hàm cho phép JS gọi để lấy nội dung HTML
    public String loadHtmlContent(String relativePath) {
        try {
            File file = new File("D:/VSCode/ui/" + relativePath);
            if (file.exists()) {
                return Files.readString(file.toPath());
            } else {
                System.err.println("Không tìm thấy file: " + relativePath);
                return "<p style='color:red'>Không tìm thấy trang " + relativePath + "</p>";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "<p style='color:red'>Lỗi khi tải file: " + e.getMessage() + "</p>";
        }
    }
}
