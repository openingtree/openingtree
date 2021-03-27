@iterate
Feature: Iterate over a pgn file
  Scenario: Iterate a pgn file
    When set:
      | color | player     | numGames |
      | white | gorilla_12 | 100      |
    When load pgn file "features/gorilla_176_Games.pgn"

  @chess.js
  Scenario:
    When load single pgn from file "features/gorilla_176_Games.pgn"
