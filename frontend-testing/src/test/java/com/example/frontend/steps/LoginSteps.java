package com.example.frontend.steps;

import io.cucumber.java.Before;
import io.cucumber.java.After;
import io.cucumber.java.en.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import com.example.frontend.utils.WebDriverUtils;
import java.util.List;
import static org.junit.Assert.assertEquals;
import org.openqa.selenium.WebElement;

public class LoginSteps {

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

    @Given("ich bin auf der Login-Seite")
    public void ichBinAufDerLoginSeite() {
        driver.get(WebDriverUtils.getBaseUrl() + "/login/dwh");
        WebDriverUtils.takeScreenshot("screenshots/login/login_page.png");
    }

    @When("ich gebe {string} und {string} ein")
    public void ichGebeBenutzernameUndPasswortEin(String email, String password) {
        // Get all input fields on the page
        List<WebElement> inputs = wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(By.tagName("input")));
        inputs.get(0).sendKeys(email);
        inputs.get(1).sendKeys(password);
        WebDriverUtils.takeScreenshot("screenshots/login/enter_email_passwort.png");
    }

    @When("ich klicke auf den Login-Button")
    public void ichKlickeAufDenLoginButton() {
        wait.until(ExpectedConditions.elementToBeClickable(By.id("send-btn"))).click();
        WebDriverUtils.takeScreenshot("screenshots/login/sent_btn.png");
    }

    @Then("sollte ich die Startseite nach login sehen")
    public void sollteIchDieStartseiteNachLoginSehen() {
        String expectedUrl = WebDriverUtils.getBaseUrl() + "/dwh/dashboard";
        wait.until(ExpectedConditions.urlToBe(expectedUrl));
        assertEquals("Die URL nach dem Login ist nicht korrekt.", expectedUrl, driver.getCurrentUrl());
        WebDriverUtils.takeScreenshot("screenshots/login/dashboard.png");
    }
}