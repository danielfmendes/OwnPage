package com.example.frontend.steps;

import com.example.frontend.utils.WebDriverUtils;
import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import static com.example.frontend.steps.HelperProvider.*;

public class UtilsSteps {

    @Before
    public void setUp() {
        WebDriverUtils.setUp();
    }

    @After
    public void tearDown() {
        WebDriverUtils.tearDown();
    }

    @Given("ich bin auf der Login-Seite")
    public void ichBinAufDerLoginSeite() {
        openPage("/dwh/login");
        takeScreenshot("screenshots/login/login_page.png");
    }

    @When("ich klicke auf den Save-Button")
    public void ichKlickeAufDenLoginButton() {
        click(By.id("send-btn"));
        takeScreenshot("screenshots/login/sent_btn.png");
    }

    @Then("sollte ich die Startseite nach {string} sehen")
    public void sollteIchDieStartseiteSehen(String page) {
        String expectedUrl = WebDriverUtils.getBaseUrl() + "/dwh/dashboard";
        assertCurrentUrl(expectedUrl);
        takeScreenshot("screenshots/register/" + page + ".png");
    }

    @Then("ich überprüfe, ob {string} und {string} angezeigt werden")
    public void ichÜberpruefeObBenutzernameUndEmailAngezeigtWerden(String userName, String email) {
        click(By.cssSelector("button[aria-haspopup='menu']"));
        takeScreenshot("screenshots/login/avatar_clicked.png");

        WebElement userNameElement = waitUntilVisible(By.xpath("//p[contains(text(), '" + userName + "')]"));
        WebElement emailElement = waitUntilVisible(By.xpath("//p[contains(text(), '" + email + "')]"));

        assertTextEquals(userName, userNameElement);
        assertTextEquals(email, emailElement);

        takeScreenshot("screenshots/login/user_info_checked.png");
    }
}
