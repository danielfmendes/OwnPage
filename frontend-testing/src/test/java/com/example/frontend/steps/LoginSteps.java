package com.example.frontend.steps;

import io.cucumber.java.Before;
import io.cucumber.java.After;
import io.cucumber.java.en.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.chrome.ChromeOptions;

import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import java.io.File;
import org.apache.commons.io.FileUtils;

import java.time.Duration;

import static org.junit.Assert.assertTrue;

public class LoginSteps {

    private WebDriver driver;
    private WebDriverWait wait;
    private static final String BASE_URL = "http://localhost:3000";

    @Before
    public void setUp() {
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();

        // Run headless only in CI environments
        String ciEnv = System.getenv("CI");
        if ("true".equalsIgnoreCase(ciEnv)) {
            options.addArguments("--headless=new");
            options.addArguments("--no-sandbox");
            options.addArguments("--disable-dev-shm-usage");
        }

        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @After
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    // Neue Methode, um screenshots/login zu machen
    private void takeScreenshot(String filename) {
        try {
            File scrFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            FileUtils.copyFile(scrFile, new File(filename));
            System.out.println("Screenshot gespeichert unter: " + filename);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Given("ich bin auf der Login-Seite")
    public void ichBinAufDerLoginSeite() {
        driver.get(BASE_URL + "/login/dwh");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("e-mail")));
        takeScreenshot("screenshots/login/login_page.png");
    }

    @When("ich gebe {string} und {string} ein")
    public void ichGebeBenutzernameUndPasswortEin(String email, String password) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("e-mail")));
        driver.findElement(By.id("e-mail")).sendKeys(email);
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("password")));
        driver.findElement(By.id("password")).sendKeys(password);
        takeScreenshot("screenshots/login/enter_email_passwort.png");
    }

    @When("ich klicke auf den Login-Button")
    public void ichKlickeAufDenLoginButton() {
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("send-btn")));
        driver.findElement(By.id("send-btn")).click();
    }

    @Then("sollte ich die Startseite sehen")
    public void sollteIchDieStartseiteSehen() {
        String expectedUrl = BASE_URL + "/dwh/dashboard";
        wait.until(ExpectedConditions.urlToBe(expectedUrl));
        String currentUrl = driver.getCurrentUrl();
        assertTrue("Erwartete URL: " + expectedUrl + ", aber war: " + currentUrl,
                currentUrl.equals(expectedUrl));
        takeScreenshot("screenshots/login/dashboard.png");
    }
}