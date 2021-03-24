@iterate
Feature: Iterate over a pgn file
  Scenario: Iterate a pgn file
    When set:
      | color | player     |
      | white | gorilla_12 |
    When load pgn file "features/gorilla_176_Games.pgn"

   @chess.js
  Scenario: 
    When load single pgn from file "features/gorilla_176_Games.pgn" 
