Feature: Registration

  Scenario: Erfolgreiche Registrierung
    Given ich bin auf der Login-Seite zum Registrieren
    When ich klicke auf den geh-zu-Registrieren-Button
    And ich gebe "botdaniel092@gmail.com", "test" und "Daniel Freire Mendes" ein
    And ich klicke auf den Registrieren-Button
    Then sollte ich die Startseite nach register sehen