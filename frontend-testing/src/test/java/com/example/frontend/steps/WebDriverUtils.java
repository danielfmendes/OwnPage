package com.example.frontend.utils;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.apache.commons.io.FileUtils;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.File;
import java.time.Duration;

public class WebDriverUtils {

    private static final String BASE_URL = "http://localhost:3000";
    private static WebDriver driver;
    private static WebDriverWait wait;

    public static void setUp() {
        if (driver != null) {
            return; // Prevent multiple setups
        }

        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();

        // Run headless only in CI environments
        String ciEnv = System.getenv("CI");
        if ("true".equalsIgnoreCase(ciEnv)) {
            options.addArguments("--no-sandbox");
            options.addArguments("--disable-dev-shm-usage");
            options.addArguments("--disable-gpu");
            options.addArguments("--window-size=1920,1080");
            options.addArguments("--start-maximized");
        }

        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public static void tearDown() {
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
}
