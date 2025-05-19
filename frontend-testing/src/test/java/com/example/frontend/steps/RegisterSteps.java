package com.example.frontend.steps;

import io.cucumber.java.Before;
import io.cucumber.java.After;
import io.cucumber.java.en.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import com.example.frontend.utils.WebDriverUtils;
import org.openqa.selenium.WebElement;
import java.util.List;

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

    @When("ich gebe {string}, {string} und {string} ein")
    public void ichGebeEmailPasswortUndNameEin(String email, String password, String name) {
        String expectedUrl = WebDriverUtils.getBaseUrl() + "/register/dwh";
        wait.until(ExpectedConditions.urlToBe(expectedUrl));
        assertEquals("Die URL nach dem Klicken des Registrier-Buttons ist nicht korrekt.", expectedUrl, driver.getCurrentUrl());

        // Get all input fields on the page
        List<WebElement> inputs = wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(By.tagName("input")));

        // Fill out name
        inputs.get(0).sendKeys(name);
        wait.until(ExpectedConditions.elementToBeClickable(By.id("datepicker"))).click();

        // Select Month: August
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[.//span[text()='May']]"))
        ).click();

        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//div[@role='option' and .//span[text()='August']]"))
        ).click();

        // Select Year: 2002
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[.//span[text()='2025']]"))
        ).click();
        WebDriverUtils.sleepMillis(500);
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//div[@role='option' and .//span[text()='2002']]"))
        ).click();

        // Select date: 20/08/2002
        List<WebElement> rows = driver.findElements(By.cssSelector("tbody.rdp-tbody > tr"));
        WebElement cell = rows.get(4).findElements(By.tagName("td")).get(2);
        WebElement button = cell.findElement(By.tagName("button"));
        button.click();

        wait.until(ExpectedConditions.elementToBeClickable(By.id("datepicker"))).click();

        // Continue with email and password
        inputs.get(1).sendKeys(email);
        inputs.get(2).sendKeys(password);

        WebDriverUtils.takeScreenshot("screenshots/register/enter_email_passwort_name.png");
    }


    @When("ich klicke auf den Registrieren-Button")
    public void ichKlickeAufDenRegistrierenButton() {
        wait.until(ExpectedConditions.elementToBeClickable(By.id("send-btn"))).click();
        WebDriverUtils.takeScreenshot("screenshots/register/sent_btn.png");
    }

    @Then("sollte ich die Startseite nach register sehen")
    public void sollteIchDieStartseiteNachRegistrierenSehen() {
        String expectedUrl = WebDriverUtils.getBaseUrl() + "/dwh/dashboard";
        wait.until(ExpectedConditions.urlToBe(expectedUrl));
        assertEquals("Die URL nach dem Registrieren ist nicht korrekt.", expectedUrl, driver.getCurrentUrl());
        WebDriverUtils.takeScreenshot("screenshots/register/dashboard.png");
    }
}