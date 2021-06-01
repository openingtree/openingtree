# Test plan

## Entry
 * Launch openingtree.com
 * Make sure all tabs are are clickable. 
 * Change source to make sure that corresponding advanced filters and input field changes accordingly
 * Copy fen to make sure it copies to clipboard
 * Flip board
 * Computer analysis should go to lichess with starting position
 * More dropdown in header should work and all links working

## Navigator
 * Make moves on the chessboard
 * Make moves using navigator
 * Starting position and clear game controls should work
 * Use previous/next buttons to navigate
 * Use arrow keys to navigate
 * Fen should change on report tab
 * Computer analysis button should go to the right fen
 * Opening names should change
 
## Load
 * Enter `DrNykterstein` for lichess and `hikaru` for chess.com and click load
 * Click stop mid download and make sure it works
 * Try both white and black
 * Try advanced filters and make sure fewer games are being downloaded
 * Stop button should disappear after games are done downloading
 * Make sure moves tab link on user tab works

## Move
 * Make sure moves are being shown on on moves tab
 * all moves should be shown
 * click on moves should make moves on chessboard
 * moving on chessboard should make changes to moves tab
 * make a move on chessboard that is not in the list
 * make sure lines with single results show results of games
 * External links to game should work
 * Game result should show at the end. Clicking on that should go to game results
 * Info message at the bottom of moves tab should show the right message
 
## Download
 * Click Export as PGN button. File should download and be openable using scid
 * Filters should work when downloading files
 * Clicking on export and analyze together should do both
 * leaving the page should gracefully stop download
 * Download should work on all browsers. IOS mobile has an open bug and is not supported

## Report
 * Make sure mouseover on moves should show performance rating
 * Values on popover should make sense
 * External link to game should works
 * Full report in report tab should show report of current state
 * external links should work
 * Clear games control should work
 
 ## Mobile
 * Change size of browser window to make sure UI looks ok
 * Open on mobile browser
 * change orientation
 * Make sure performance overlay works

## Errors
 * Turn off wifi and click load
 * Enter random username and click load
 * Enter a username with 0 games played
 * Turn off wifi mid download
 * Try chess.com user `TheZahlen`. console log should show one game fails parsing should not break entire UI
 * Try `alireza2003` console log should show one game fails parsing should not break entire UI
 * Try clicking load and export button without entering a username. Error message should show
 
## Tracking
Make sure tracking events are logged for the following
 * Tab changes
 * Clicking black/white
 * Advanced filter changes
 * Clicking load
 * Clicking controls
 * Copy fen
 * Left/right arrow keys
 * Navigation keys
 * moves clicked
 * Errors
 * External links
 * Export as pgn
 
