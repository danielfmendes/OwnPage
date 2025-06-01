Feature: Registration

  Scenario: Erfolgreiche Registrierung
    Given ich bin auf der Login-Seite
    When ich klicke auf den Registrieren-Button
    And ich gebe "botdaniel092@gmail.com", "test" und "Daniel Freire Mendes" ein
    And ich klicke auf den Save-Button
    Then sollte ich die Startseite nach "register" sehen
    And ich überprüfe, ob "Daniel Freire Mendes" und "botdaniel092@gmail.com" angezeigt werden