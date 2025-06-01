package com.example.frontend.steps;

import io.cucumber.java.Before;
import io.cucumber.java.After;
import io.cucumber.java.en.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import com.example.frontend.utils.WebDriverUtils;

import java.util.List;

import static com.example.frontend.steps.HelperProvider.*;

public class LoginSteps {

    @Before
    public void setUp() {
        WebDriverUtils.setUp();
    }

    @After
    public void tearDown() {
        WebDriverUtils.tearDown();
    }

    @When("ich gebe {string} und {string} ein")
    public void ichGebeBenutzernameUndPasswortEin(String email, String password) {
        List<WebElement> inputs = HelperProvider.waitUntilVisibleAll(By.tagName("input"));
        enterText(inputs.get(0), email);
        enterText(inputs.get(1), password);
        takeScreenshot("screenshots/login/enter_email_passwort.png");
    }
}