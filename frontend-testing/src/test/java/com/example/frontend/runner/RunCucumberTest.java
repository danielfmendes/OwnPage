package com.example.frontend.runner;

import io.cucumber.core.cli.Main;
import org.junit.Test;

public class RunCucumberTest {

    @Test
    public void runCucumber() {
        String featurePath = System.getProperty("cucumber.feature.path", "src/test/resources/features");

        int exitCode = Main.run(new String[]{
                "--glue", "com.example.frontend.steps",
                "--plugin", "pretty",
                featurePath
        }, Thread.currentThread().getContextClassLoader());

        if (exitCode != 0) {
            throw new RuntimeException("Cucumber tests failed with exit code " + exitCode);
        }
    }
}
