@iterate
Feature: Iterate over a pgn file
  Background:
    When set "directory" to "tests/functionalTests"
  Scenario: Iterate a pgn file
    When set:
      | color | Name               | numGames |
      | white | Alexander Alekhine | 100        |
    When api request from file "getPlayer.json" is performed
    And set "playerInfo" to "${response.list.filter(i=>i.name===Name)[0]}"
    When api request from file "loadGames.json" is performed
    And load pgn item "response"

  @chess.js
  Scenario:
    When load single pgn from file "gorilla_176_Games.pgn"
