Feature: Login

  Scenario: Erfolgreiches Login
    Given ich bin auf der Login-Seite
    When ich gebe "testuser@example.com" und "test" ein
    And ich klicke auf den Login-Button
    Then sollte ich die Startseite nach login sehen
