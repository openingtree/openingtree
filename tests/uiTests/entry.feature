Feature: Opening Tree Entry
  Background:
    When set "directory" to "tests/uiTests/"
  @select-source
  @copy-fen
  @tab5-elements
  @lichess-analysis
  @clicktabs
  Scenario: Open the url
    When set:
      | url                   |
      | http://openingtree.com |
    And open
  @clicktabs
  Scenario Outline:  Make sure tab <index> is clickable and the active text is <expected>
    And click tab <index>
    And get active tab
    And get text from it
    And it is equal to "<expected>"
    Examples:
      | index | expected     |
      | 1     | User         |
      | 2     | Moves        |
      | 3     | Opening book |
      | 4     | Report       |
      | 5     | Controls     |
  @select-source
  Scenario: Minimize source
    When click tab 1
    And get active tab
    And get text from it
    When get multi tab 2
    And click it
  @select-source
  Scenario Outline: Select source <source>
    When get multi tab 2
    And click it
    When get source "<source>"
    And click it
    Examples:
      | source     |
      | lichess    |
      | chesscom   |
      | tournament |
      | opntfile   |
      | playerdb   |
      | eventdb    |
      | pgnfile    |
  @copy-fen
  Scenario: Copy fen
    # Click the report tab.
    And click tab 4
    And get id "fenField"
    And click it
    And get clipboard content
    And it is equal to "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

  @tab5-elements
  Scenario Outline: Perform <text> from tab 5 (controls)
    When click tab 5
    And get element from text "<text>"
    And click it
    Examples:
      | text              |
      | Flip board        |
      | Clear games       |
      | Starting position |
      | Computer analysis |
      | Light mode        |
      | Dark mode        |
  @lichess-analysis
  Scenario: Click lichess analysis
      When click tab 5
    And get element from text "Computer analysis"
    And click it
    And switch tab 1
    And wait 1000 milliseconds
    And get element from text "FEN"
    And click it
    And switch tab 0