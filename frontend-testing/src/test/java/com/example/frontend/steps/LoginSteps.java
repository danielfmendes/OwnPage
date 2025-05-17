package com.example.frontend.steps;

import io.cucumber.java.en.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import io.github.bonigarcia.wdm.WebDriverManager;

import static org.junit.Assert.assertTrue;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;

public class LoginSteps {

    private WebDriver driver;

    @Given("ich bin auf der Login-Seite")
    public void ich_bin_auf_der_login_seite() {
        String os = System.getProperty("os.name").toLowerCase();

        if (os.contains("mac")) {
            System.setProperty("webdriver.chrome.driver", "/opt/homebrew/bin/chromedriver");
        } else {
            WebDriverManager.chromedriver().setup();
        }

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");

        driver = new ChromeDriver(options);
        driver.get("http://localhost:3000/login/dwh");
    }

//    @When("ich gebe {string} und {string} ein")
//    public void ich_gebe_und_ein(String email, String password) {
//        driver.findElement(By.id("label.e-mail")).sendKeys(email);
//        driver.findElement(By.id("label.password")).sendKeys(password);
//    }

    @When("ich klicke auf den Login-Button")
    public void ich_klicke_auf_den_login_button() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement button = wait.until(ExpectedConditions.elementToBeClickable(By.id("demo-btn")));
        button.click();
    }

    @Then("sollte ich die Startseite sehen")
    public void sollte_ich_die_startseite_sehen() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.urlContains("/dwh/dashboard"));

        boolean isHomePage = driver.getCurrentUrl().contains("/dwh/dashboard");
        assertTrue("Startseite wird nicht angezeigt", isHomePage);
        driver.quit();
    }
}
