import Chess from 'chess.js'
import * as Constants from '../app/Constants'
import {trackEvent} from '../app/Analytics'

function turnColor() {
    return fullTurnName(this.chess.turn())
}

function fullTurnName(shortName) {
    return shortName === 'w' ? Constants.PLAYER_COLOR_WHITE : Constants.PLAYER_COLOR_BLACK
}

function playerColor() {
    return this.state.settings.playerColor
}

function brushes() {
    if(this.playerColor() === this.turnColor()) {
        return this.forBrushes
    }
    return this.againstBrushes
}

function calcMovable() {
const dests = {}
    this.chess.SQUARES.forEach(s => {
        const ms = this.chess.moves({square: s, verbose: true})
        if (ms.length) dests[s] = ms.map(m => m.to)
    })
    return {
        free: false,
        dests,
        color: this.turnColor()
    }
}

function orientation() {
    return this.state.settings.orientation
}

function onMove(from, to) {
    const chess = this.chess
    let move = chess.move({ from, to, promotion: 'q'})
    this.setState({ fen: chess.fen(), lastMove: move})
}


function onMoveAction(from, to) {
    this.onMove(from,to)
    trackEvent(Constants.EVENT_CATEGORY_CHESSBOARD, "Move")
}

function navigateTo(fen, previousMove){
    this.chess = new Chess(fen)
    this.setState({fen:fen, lastMove:previousMove})
}
function updateProcessedGames(downloadLimit, n, openingGraph) {
    let totalGamesProcessed = this.state.gamesProcessed+n
    this.setState({
    gamesProcessed: totalGamesProcessed,
    openingGraph: openingGraph,
    downloadingGames: (totalGamesProcessed<downloadLimit || downloadLimit>=Constants.MAX_DOWNLOAD_LIMIT)?this.state.downloadingGames:false
    })
    // continue to download games if 
    // 1. we have not reached download limit OR
    //    there is no download limit set (downloadLimit>MAX condition)
    // 2. user did not hit stop button
    return (totalGamesProcessed < downloadLimit || downloadLimit>=Constants.MAX_DOWNLOAD_LIMIT)&& this.state.downloadingGames
}
function moveToShape(move) {
    return {
        orig:move.orig,
                    dest: move.dest,
                    brush: this.brushes()[move.level]
    }
}

function autoShapes() {
    var moves = this.movesToShow()
    if(moves) {
        var shapes = moves.map(this.moveToShape.bind(this))
        return this.fillArray(shapes,  25)
    }
    return this.fillArray([], 25) // dummy arrow to clear out existing arrows
}

function movesToShow() {
    if(!this.state.openingGraph.hasMoves()) {
        return null;
    }
    var moves = this.state.openingGraph.movesForFen(this.chess.fen())
    return moves?moves.sort((a,b)=>b.details.count-a.details.count):[]
}



function gameResults() {
    return this.state.openingGraph.gameResultsForFen(this.chess.fen())
}

function fillArray(arr, len) {
    for (var i = arr.length; i < len; i++) {
        arr.push({'orig':'i'+i, 'dest':'i'+(i+1), brush:this.brushes()[0]});
    }
    return arr;
}

function reset() {
    this.chess = new Chess()
    this.setState({fen: this.chess.fen(), lastMove:null})
}

function clear() {
    this.state.openingGraph.clear()
    this.state.gamesProcessed = 0
    this.reset()
}

function settingsChange(name, value) {
    let settings = this.state.settings
    settings[name] = value;
    this.setState({
        'settings':settings
    })
}
function showError(message, trackingLabel) {
    this.setState({message:message, messageSeverity:"error"})
    trackEvent(Constants.EVENT_CATEGORY_ERROR,"errorShown",
        trackingLabel?trackingLabel:message)
}

function showInfo(message, trackingLabel) {
    this.setState({message:message, messageSeverity:"success"})
    trackEvent(Constants.EVENT_CATEGORY_ERROR,"infoShown",
        trackingLabel?trackingLabel:message)
}


function closeError() {
    this.setState({message:'', subMessage:''})
}

function toggleFeedback() {
    this.setState({feedbackOpen:!this.state.feedbackOpen})
}

function setDownloading(val) {
    this.setState({downloadingGames:val})
}

function addStateManagement(obj){
    obj.orientation  = orientation
    obj.turnColor = turnColor
    obj.calcMovable = calcMovable
    obj.onMove = onMove
    obj.onMoveAction = onMoveAction
    obj.autoShapes = autoShapes
    obj.updateProcessedGames = updateProcessedGames
    obj.settingsChange = settingsChange
    obj.reset = reset
    obj.clear = clear
    obj.navigateTo = navigateTo
    obj.playerColor = playerColor
    obj.fillArray = fillArray
    obj.brushes = brushes
    obj.moveToShape = moveToShape
    obj.movesToShow = movesToShow
    obj.gameResults = gameResults
    obj.showError = showError
    obj.showInfo = showInfo
    obj.closeError = closeError
    obj.toggleFeedback = toggleFeedback.bind(obj)
    obj.setDownloading = setDownloading
}

export {addStateManagement}