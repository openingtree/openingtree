Feature: Opening Tree Entry
  Background:
    When set "directory" to "tests/uiTests/"
  @loadGameTypes
  @select-source
  @copy-fen
  @tab5-elements
  @lichess-analysis
  @clicktabs
  Scenario: Open the url
    When set:
      | url                   |
      | ${process.env.HOST} |
    And open
  @clicktabs
  Scenario Outline:  Make sure tab <index> is clickable and the active text is <expected>
    And get tab <index>
    And click it
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
  Scenario Outline: Select source <source>
    When select source "<source>"
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
  @skipci
  # Skip this in CI because clipboardy is difficult to get to work there.
  Scenario: Copy fen
    # Click the report tab.
    And get tab 4
    And click it
    And get id "fenField"
    And click it
    And get clipboard content
    And it is equal to "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

  @tab5-elements
  Scenario Outline: Perform <text> from tab 5 (controls)
    When get tab 5
    And click it
    And get element from text "<text>"
    And click it
    Examples:
      | text              |
      | Flip board        |
      | Clear games       |
      | Starting position |
      | Computer analysis |
      | Light mode        |
      | Dark mode         |
  @lichess-analysis
  Scenario: Click lichess analysis
    When get tab 5
    And click it
    And get element from text "Computer analysis"
    And click it
    And switch tab 1
    And wait 1000 milliseconds
    And get element from text "FEN"
    And click it
    And switch tab 0

  @loadGameTypes
  Scenario Outline: Load at least <minGames> games for variant <gameType>
    When get tab 1
    And click it
    And get element from text "change"
    And click it
    And get element from text "<gameType>"
    And click it
    And select source "<source>"
    And get id "playerNameTextBox"
    And set text "<playerName>" to it
    And get continue element 3
    And click it
    And get element from text "<color>"
    And click it
    And get continue element 4
    And click it
    And get element from text 'Analyze games'
    And click it
    And wait 2000 milliseconds
    And screenshot
    And get element from text "stop"
    And click it
    And wait 7000 milliseconds
    And get element containing text "<color> games"
    And get text from it
    And set "numGames" to "${lastRun.replace(/[^\d]+/g,'')}"
    Then item "numGames" > <minGames>
    Examples:
      | gameType         | playerName  | color | source   | minGames |
      | Racing kings     | royalmaniac | White | lichess  | 20       |
      | Standard rules   | EricRosen   | White | lichess  | 30       |
      | Standard rules   | IMRosen     | Black | chesscom | 5        |
      | Crazyhouse       | blitzbullet | White | lichess  | 10       |
      | Three check      | catask      | White | lichess  | 5        |
      | King of the hill | Shprot86    | White | lichess  | 5        |