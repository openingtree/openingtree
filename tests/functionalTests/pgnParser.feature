# Test cases taken from https://github.com/kevinludwig/pgn-parser
# Copyright 2020 Kevin Ludwig

# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
@skipTests
Feature: Grammar for pgn-parser
  Scenario:  Able to parse large pgn

    When convert pgn file "features/gorilla_176_Games.pgn" to json
    Then item "lastRun.length" > 1000

  Scenario: Able to parse null moves
    When set "pgnString" to:
      """
      [Event "Turkey Cup 2014"]
      [Site "Kemer TUR"]
      [Date "2014.02.02"]
      [Round "2.71"]
      [White "Subasi,Zeki"]
      [Black "Yuvarlak,U"]
      [Result "1/2-1/2"]
      [WhiteElo "1714"]
      [BlackElo "1850"]
      [ECO "C45"]
      [Opening "Scotch"]
      [Variation "Schmidt variation"]
      [WhiteFideId "6345433"]
      [BlackFideId "6305598"]
      [EventDate "2014.02.01"]

      1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nc3 Bb4 6. Nxc6 bxc6 7. Bd3 d5 8.
      O-O Bxc3 9. bxc3 dxe4 10. Qe2 O-O 11. Bxe4 Re8 12. f3 Bf5 13. Bg5 -- 14. Rad1
      Qe7 15. Bxf6 Qxf6 16. Qc4 Rad8 17. Bxc6 1/2-1/2
      """
    When convert pgn item "pgnString" to json
    Then "${lastRun[0].moves.length}" is equal to 33


  Scenario: Parse basic movetext
    When convert pgn string "1.e4 e5 2. d4 exd4 3. Qxd4 Nc6 4. Qe3 Nf6 *" to json
    Then "${lastRun[0].moves.length}" is equal to 8

  Scenario: Parse headers
    When set "pgnString" to:
      """
      [Event "LACC Botvinnik Open"]
      [White "Kasparov"]
      1. d4 d5 2. c4 c6 3. cxd5 cxd4 1/2-1/2
      """
    When convert pgn item "pgnString" to json
    Then "${lastRun[0].moves.length}" is equal to 6

  Scenario: Allow no move numbers
    When convert pgn string 'e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4 c3 Ba5 d4 exd4 *' to json
    Then "${lastRun[0].moves.length}" is equal to 12

  Scenario: Allow move numbers no periods
    When convert pgn string '1 e4 e5 2 Nf3 Nc6 3 Bc4 Bc5 4 b4 Bxb4 5 c3 Ba5 6 d4 exd4 *' to json
    Then "${lastRun[0].moves.length}" is equal to 12

  Scenario: Allow castles
    When convert pgn string '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4 exd4 7. O-O dxc3 *' to json
    Then "${lastRun[0].moves.length}" is equal to 14

  Scenario: Allow castles long
    When set "pgnString" to:
      """
    1. e4 d5 2. exd5 Qxd5
    3. Nf3 Bg4
    4. Be2 Nc6
    5. h3 O-O-O
    *
      """
    When convert pgn item "pgnString" to json
    Then "${lastRun[0].moves.length}" is equal to 10

  Scenario: Allow promotions
    When convert pgn string '1. e4 e5 2. Nf3 Nc6 3. f8=Q+ dxe1=N+ *' to json
    Then "${lastRun[0].moves.length}" is equal to 6

  Scenario: Allow newlines
    When set "pgnString" to:
      """
      1. e4 e5
      2. Nf3 Nc6
      3.Bc4 Bc5 1-0
      """
    When convert pgn item "pgnString" to json
    Then "${lastRun[0].moves.length}" is equal to 6

  Scenario: Allow checkmates
    When set "pgnString" to:
      """
      1. f3 e5 2. g4 Qh4#
      0-1
      """
    When convert pgn item "pgnString" to json
    Then "${lastRun[0].moves.length}" is equal to 4

  Scenario: Allow NAG
    When set "pgnString" to:
      """
      1. f3 $2 e5 $1 2. g4 $4 $15 Qh4#
      0-1
      """
    When convert pgn item "pgnString" to json
    Then "${lastRun[0].moves.length}" is equal to 4

  Scenario: Allow alternative to NAGs !
    When set "pgnString" to:
      """
      1. f3? e5! 2. g4?? axb6?! 3. bxa8=N!? Qh4+!!
      0-1
      """
    When convert pgn item 'pgnString' to json
    Then "${lastRun[0].moves.length}" is equal to 6

  Scenario: Allow commentary
    When set "pgnString" to:
      """
      1. f3 {some comment} e5 {another comment} 2. g4 Qh4#
      0-1
      """
    When convert pgn item "pgnString" to json
    Then "${lastRun[0].moves.length}" is equal to 4

  Scenario: Allow start of game commentary
    When set "pgnString" to:
      """
      {start of game} 1. f3 e5 2. g4 Qh4#
      0-1
      """
    When convert pgn string '${pgnString}' to json
    Then "${lastRun[0].moves.length}" is equal to 4

  Scenario: Allow disambiguation moves
    When convert pgn string '1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 5. e3 Nbd7 *' to json
    Then "${lastRun[0].moves.length}" is equal to 10

  Scenario: Allow ... prefixed on moves
    When convert pgn string '1. d4 {some commentary then} 1. ...d5 2. c4 dxc4 *' to json
    Then "${lastRun[0].moves.length}" is equal to 4

  Scenario: Allow RAV
    When convert pgn string '1. e4 (1. d4 d5 ) e5 2. d4 (2. Nf3 Nc6 ) exd4 *' to json
    Then "${lastRun[0].moves.length}" is equal to 4

  Scenario: Allow RAV of single move
    When convert pgn string '1. e4 (1. d4 ) e5 2. d4 exd4 *' to json
    Then "${lastRun[0].moves.length}" is equal to 4

  Scenario: Allow RAV with no trailing whitespace
    When convert pgn string '1. e4 (1. d4 d5) e5 2. d4 exd4 *' to json
    Then "${lastRun[0].moves.length}" is equal to 4

  Scenario: Allow move after RAV without whitespace
    When convert pgn string '1. e4 (1. d4 d5)e5 2. d4 exd4 *' to json
    Then "${lastRun[0].moves.length}" is equal to 4

  Scenario: Allow RAV after RAV without whitespace
    When convert pgn string '1. e4 (1. d4 d5)(1. f4 e5)e5 2. d4 exd4 *' to json
    Then "${lastRun[0].moves.length}" is equal to 4

  Scenario: Allow promotion without equal sign
    When convert pgn string '1. e4 f5 2. exf5 g6 3. fxg6 h6 4. g7 Rh7 5. gxf8Q+ *' to json
    Then "${lastRun[0].moves.length}" is equal to 9

  Scenario: Allow multiple RAV for same move
    When convert pgn string '1. e4 (1. d4 d5) (1. c4 e5) e5 *' to json
    Then "${lastRun[0].moves.length}" is equal to 2
    And "${lastRun[0].moves[0].ravs.length}" is equal to 2

  Scenario: Allow 4...exd4 syntax
    When convert pgn string '1. e4 e5 (1...c5 2. Nf3 Nc6) 2. f4 exf4 *' to json
    Then "${lastRun[0].moves.length}" is equal to 4

  Scenario: Allow whitespace after result
    When convert pgn string '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O d6 6. Re1 1-0 ' to json
    Then "${lastRun[0].moves.length}" is equal to 11

  Scenario: Allow half move at end
    When convert pgn string '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O d6 6. Re1 1-0' to json
    Then "${lastRun[0].moves.length}" is equal to 11

  Scenario: Allow abandoned games (no moves)
    When set "pgnString" to:
      """
    [Termination "Abandoned"]

    *
      """
    When convert pgn string '${pgnString}' to json
    Then "${lastRun[0].moves.length}" is equal to 0

  Scenario: Allow multiple games in input
    When set "pgnString" to:
      """
      1. d4 d5 2. c4 c6 *
      1. e4 e5 2. d4 exd4 3. c3 dxc3 4. Bc4 cxb2 5. Bxb2 d6 1/2-1/2
      """
    When convert pgn string "${pgnString}" to json
    Then "${lastRun.length}" is equal to 2
    And "${lastRun[0].moves.length}" is equal to 4
    And "${lastRun[1].moves.length}" is equal to 10

  Scenario: Disambiguate both rank and file
    When convert pgn string '1. d4 d5 2. Nc3 Nf6 3. Ne4?? h6?? 4. Ng5?? a6?? 5. Ng5f3! 1/2-1/2' to json
    Then "${lastRun.length}" is equal to 1
    And "${lastRun[0].moves.length}" is equal to 9

  Scenario: Allow single line comments
    When set "pgnString" to:
      """
      ; lead comment
      [SomeHeader "Value"]
      1. e4 e5 *
      """
    When convert pgn string "${pgnString}" to json
    Then "${lastRun.length}" is equal to 1
    And "${lastRun[0].comments_above_header.length}" is equal to 1
    And "${lastRun[0].comments_above_header[0].text}" is equal to " lead comment"

  Scenario: Supports multiple comments between half-moves
    When convert pgn string '1. e4 { this is a comment } { [%csl Gd5,Gf5][%cal Ge4d5,Ge4f5] } *' to json
    Then "${lastRun[0].moves.length}" is equal to 1

  Scenario: Fully parse command commments
    When convert pgn string '1. e4 { this is a comment } { [%csl Gd5,Gf5][%cal Ge4d5,Ge4f5] } *' to json
    Then  "${lastRun[0].moves.length}" is equal to 1
    And  "${lastRun[0].moves[0].comments.length}" is equal to 2
    And  "${lastRun[0].moves[0].comments[0].text}" is equal to ' this is a comment '
    And  "${lastRun[0].moves[0].comments[1].commands.length}" is equal to 2
    And  "${lastRun[0].moves[0].comments[1].commands[0].key}" is equal to "csl"
    And  "${lastRun[0].moves[0].comments[1].commands[0].values}" is equal to:
      """
      [
        "Gd5",
        "Gf5"
      ]
      """

  Scenario: Parse accented characters
    When convert pgn string '1.e4 {A à E é I î O ô U ù Y} *' to json
    Then  "${lastRun[0].moves[0].comments.length}" is equal to 1
    And   "${lastRun[0].moves[0].comments[0].text}" is equal to 'A à E é I î O ô U ù Y'
