package com.example.frontend.utils;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.apache.commons.io.FileUtils;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.File;
import java.io.IOException;
import java.time.Duration;

public class WebDriverUtils {

    private static final String BASE_URL = "http://localhost:3000";
    private static WebDriver driver;
    private static WebDriverWait wait;

    private static Process xvfbProcess;
    private static Process ffmpegProcess;

    public static void setUp() {
        if (driver != null) return;

        if ("true".equalsIgnoreCase(System.getenv("CI"))) {
            startScreenRecording();
        }

        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();

        if ("true".equalsIgnoreCase(System.getenv("CI"))) {
            options.addArguments("--no-sandbox");
            options.addArguments("--disable-dev-shm-usage");
            options.addArguments("--disable-gpu");
            options.addArguments("--window-size=1920,1080");
            options.addArguments("--start-maximized");
            options.addArguments("--display=:99"); // use Xvfb display for CI
        }

        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    private static void startScreenRecording() {
        try {
            // Make sure recordings folder exists
            File recordingsDir = new File("recordings");
            if (!recordingsDir.exists()) {
                recordingsDir.mkdirs();
            }

            // Start Xvfb virtual framebuffer
            ProcessBuilder xvfbBuilder = new ProcessBuilder(
                    "Xvfb", ":99", "-screen", "0", "1920x1080x24"
            );
            xvfbBuilder.redirectErrorStream(true);
            xvfbProcess = xvfbBuilder.start();

            // Give Xvfb some time to start
            Thread.sleep(1000);

            // Start ffmpeg recording the virtual display :99.0
            ProcessBuilder ffmpegBuilder = new ProcessBuilder(
                    "ffmpeg",
                    "-y",
                    "-video_size", "1920x1080",
                    "-framerate", "25",
                    "-f", "x11grab",
                    "-i", ":99.0",
                    "-c:v", "libx264",
                    "-profile:v", "baseline",
                    "-level", "3.0",
                    "-preset", "ultrafast",
                    "-pix_fmt", "yuv420p",
                    "-movflags", "+faststart",
                    "recordings/test_run.mp4"
            );
            ffmpegBuilder.redirectErrorStream(true);
            ffmpegProcess = ffmpegBuilder.start();

            System.out.println("Started Xvfb and ffmpeg for screen recording.");
        } catch (IOException | InterruptedException e) {
            System.err.println("Error starting screen recording: " + e.getMessage());
        }
    }

    public static void tearDown() {
        if ("true".equalsIgnoreCase(System.getenv("CI"))) {
            stopScreenRecording();
        }

        if (driver != null) {
            try {
                driver.quit();
            } catch (Exception e) {
                System.err.println("Fehler beim Schließen des WebDrivers: " + e.getMessage());
            } finally {
                driver = null;
                wait = null;
            }
        }
    }

    private static void stopScreenRecording() {
        try {
            // Wait 1 second before stopping the recording
            Thread.sleep(1000);

            if (ffmpegProcess != null) {
                ffmpegProcess.destroy();
                ffmpegProcess.waitFor();
                System.out.println("Stopped ffmpeg recording.");
            }
            if (xvfbProcess != null) {
                xvfbProcess.destroy();
                xvfbProcess.waitFor();
                System.out.println("Stopped Xvfb.");
            }
        } catch (InterruptedException e) {
            System.err.println("Error stopping screen recording: " + e.getMessage());
        }
    }

    public static WebDriver getDriver() {
        if (driver == null) throw new IllegalStateException("WebDriver not initialized. Call setUp() first.");
        return driver;
    }

    public static WebDriverWait getWait() {
        if (wait == null) throw new IllegalStateException("WebDriverWait not initialized. Call setUp() first.");
        return wait;
    }

    public static String getBaseUrl() {
        return BASE_URL;
    }

    public static void takeScreenshot(String path) {
        try {
            File src = ((TakesScreenshot) getDriver()).getScreenshotAs(OutputType.FILE);
            FileUtils.copyFile(src, new File(path));
            System.out.println("Screenshot gespeichert unter: " + path);
        } catch (Exception e) {
            System.err.println("Screenshot fehlgeschlagen: " + e.getMessage());
        }
    }

    public static void sleepMillis(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            e.printStackTrace();
        }
    }

}
