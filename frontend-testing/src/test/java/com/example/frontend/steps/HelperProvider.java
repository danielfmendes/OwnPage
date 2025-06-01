package com.example.frontend.steps;

import com.example.frontend.utils.WebDriverUtils;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;

public class HelperProvider {

    private static final WebDriver driver = WebDriverUtils.getDriver();
    private static final WebDriverWait wait = WebDriverUtils.getWait();

    public static void openPage(String relativeUrl) {
        driver.get(WebDriverUtils.getBaseUrl() + relativeUrl);
    }

    public static WebElement waitUntilVisible(By by) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(by));
    }

    public static List<WebElement> waitUntilVisibleAll(By by) {
        return wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(by));
    }

    public static WebElement waitUntilClickable(By by) {
        return wait.until(ExpectedConditions.elementToBeClickable(by));
    }

    public static void click(By by) {
        waitUntilClickable(by).click();
    }

    public static void enterText(By by, String text) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(by));
        element.clear();
        element.sendKeys(text);
    }

    public static void enterText(WebElement element, String text) {
        element.clear();
        element.sendKeys(text);
    }

    public static void assertTextEquals(String expected, WebElement element) {
        assert expected.equals(element.getText()) : "Expected '" + expected + "', but got '" + element.getText() + "'";
    }

    public static void assertCurrentUrl(String expectedUrl) {
        wait.until(ExpectedConditions.urlToBe(expectedUrl));
        assert expectedUrl.equals(driver.getCurrentUrl()) :
                "Expected URL: " + expectedUrl + ", but got: " + driver.getCurrentUrl();
    }

    public static void takeScreenshot(String path) {
        WebDriverUtils.takeScreenshot(path);
    }

    public static void selectFromDropdown(String visibleText) {
        click(By.xpath("//div[@role='option' and .//span[text()='" + visibleText + "']]"));
    }

    public static void selectDate(String day) {
        List<WebElement> rows = driver.findElements(By.cssSelector("tbody.rdp-tbody > tr"));
        for (WebElement row : rows) {
            for (WebElement td : row.findElements(By.tagName("td"))) {
                try {
                    WebElement btn = td.findElement(By.tagName("button"));
                    if (btn.getText().equals(day)) {
                        btn.click();
                        return;
                    }
                } catch (NoSuchElementException ignored) {
                }
            }
        }
    }

    public static void selectBirthDate(String day, String targetMonth, String targetYear) {
        click(By.id("datepicker"));

        LocalDate today = LocalDate.now();
        String currentMonth = today.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        String currentYear = String.valueOf(today.getYear());

        click(By.xpath("//button[.//span[text()='" + currentMonth + "']]"));
        selectFromDropdown(targetMonth);

        click(By.xpath("//button[.//span[text()='" + currentYear + "']]"));
        WebDriverUtils.sleepMillis(500);
        selectFromDropdown(targetYear);

        selectDate(day);
        click(By.id("datepicker"));
    }
}
