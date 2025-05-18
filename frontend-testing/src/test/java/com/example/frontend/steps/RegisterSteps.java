package com.example.frontend.steps;

import io.cucumber.java.Before;
import io.cucumber.java.After;
import io.cucumber.java.en.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import com.example.frontend.utils.WebDriverUtils;

import static org.junit.Assert.assertEquals;

public class RegisterSteps {

    private WebDriver driver;
    private WebDriverWait wait;

    @Before
    public void setUp() {
        WebDriverUtils.setUp();
        driver = WebDriverUtils.getDriver();
        wait = WebDriverUtils.getWait();
    }

    @After
    public void tearDown() {
        WebDriverUtils.tearDown();
    }

    @Given("ich bin auf der Login-Seite zum Registrieren")
    public void ichBinAufDerLoginSeiteZumRegistrieren() {
        driver.get(WebDriverUtils.getBaseUrl() + "/login/dwh");
        WebDriverUtils.takeScreenshot("screenshots/register/login_page.png");
    }

    @When("ich klicke auf den geh-zu-Registrieren-Button")
    public void ichKlickeAufDenGehZuRegistrierenButton() {
        wait.until(ExpectedConditions.elementToBeClickable(By.id("register-btn"))).click();
        WebDriverUtils.takeScreenshot("screenshots/register/register_btn.png");
    }

//    @When("ich gebe {string}, {string} und {string} ein")
//    public void ichGebeEmailPasswortUndNameEin(String email, String password, String name) {
//        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("email"))).sendKeys(email);
//        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("password"))).sendKeys(password);
//        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("name"))).sendKeys(name);
//        WebDriverUtils.takeScreenshot("screenshots/register/enter_email_passwort_name.png");
//    }
//
//    @When("ich klicke auf den Registrieren-Button")
//    public void ichKlickeAufDenRegistrierenButton() {
//        wait.until(ExpectedConditions.elementToBeClickable(By.id("send-btn"))).click();
//        WebDriverUtils.takeScreenshot("screenshots/register/sent_btn.png");
//    }

    @Then("sollte ich die Startseite nach register sehen")
    public void sollteIchDieStartseiteNachRegistrierenSehen() {
//        String expectedUrl = WebDriverUtils.getBaseUrl() + "/dwh/dashboard";
        String expectedUrl = WebDriverUtils.getBaseUrl() + "/register/dwh";
        wait.until(ExpectedConditions.urlToBe(expectedUrl));
        assertEquals("Die URL nach dem Registrieren ist nicht korrekt.", expectedUrl, driver.getCurrentUrl());
        WebDriverUtils.takeScreenshot("screenshots/register/dashboard.png");
    }
}