package src;

import javafx.application.Application;
import javafx.concurrent.Worker;
import javafx.scene.Scene;
import javafx.scene.layout.BorderPane;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import netscape.javascript.JSObject;
import java.io.File;

public class Main extends Application {
    @Override
    public void start(Stage stage) {
        WebView webView = new WebView();
        WebEngine engine = webView.getEngine();
        engine.setJavaScriptEnabled(true);

        // ⚙️ Giúp Flatpickr & JS hiện đại hoạt động
        engine.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36");

        // Khởi tạo Bridge
        JSBridge bridge = new JSBridge(engine); 

        engine.getLoadWorker().stateProperty().addListener((obs, old, newState) -> {
            if (newState == Worker.State.SUCCEEDED) {
                JSObject window = (JSObject) engine.executeScript("window");
                // Gán Bridge vào JS với tên "Bridge" (ĐỒNG BỘ với UI.html)
                window.setMember("Bridge", bridge);
                System.out.println("✅ JSBridge đã gắn vào window.Bridge");

                // ⚠️ QUAN TRỌNG: Kích hoạt code JavaScript để tải trang mặc định 
                // sau khi Bridge đã sẵn sàng.
                engine.executeScript(
                    "document.querySelector('.menu button[data-page=\"Room\"]').click();"
                );
            }
        });

        File file = new File("D:/VSCode/ui/UI.html");
        engine.load(file.toURI().toString());

        BorderPane root = new BorderPane(webView);
        Scene scene = new Scene(root, 1280, 720);
        stage.setScene(scene);
        stage.setTitle("Karaoke Management - JavaFX WebView");
        stage.show();
    }

    public static void main(String[] args) {
        launch();
    }
}