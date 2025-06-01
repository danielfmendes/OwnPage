package com.example.frontend.steps;

import io.cucumber.java.Before;
import io.cucumber.java.After;
import io.cucumber.java.en.*;
import com.example.frontend.utils.WebDriverUtils;
import org.openqa.selenium.*;

import java.util.List;

import static com.example.frontend.steps.HelperProvider.*;

public class RegisterSteps {

    @Before
    public void setUp() {
        WebDriverUtils.setUp();
    }

    @After
    public void tearDown() {
        WebDriverUtils.tearDown();
    }

    @When("ich klicke auf den Registrieren-Button")
    public void ichKlickeAufDenRegistrierenButton() {
        click(By.id("register-btn"));
        takeScreenshot("screenshots/register/register_btn.png");
    }

    @When("ich gebe {string}, {string} und {string} ein")
    public void ichRegistrierDatenEin(String email, String password, String name) {
        String expectedUrl = WebDriverUtils.getBaseUrl() + "/dwh/register";
        assertCurrentUrl(expectedUrl);

        List<WebElement> inputs = waitUntilVisibleAll(By.tagName("input"));
        enterText(inputs.get(0), name);

        selectBirthDate("27", "August", "2002");

        enterText(inputs.get(1), email);
        enterText(inputs.get(2), password);

        takeScreenshot("screenshots/register/enter_email_passwort_name.png");
    }
}