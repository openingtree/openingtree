import Chess from 'chess.js'

function turnColor() {
    return fullTurnName(this.chess.turn())
}

function fullTurnName(shortName) {
    return shortName === 'w' ? 'white' : 'black'
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

function navigateTo(fen, previousMove){
    this.chess = new Chess(fen)
    this.setState({fen:fen, lastMove:previousMove})

}
function updateProcessedGames(n, openingGraph) {
    this.setState({
    gamesProcessed: this.state.gamesProcessed+n,
    openingGraph: openingGraph
    })
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
    var moves
    if (this.turnColor() === this.playerColor()) {
        moves = this.state.openingGraph.movesForFen(this.chess.fen())
    } else {
        moves = this.state.openingGraph.movesAgainstFen(this.chess.fen())
    } 
    return moves?moves.sort((a,b)=>b.count-a.count):moves
}

function fillArray(arr, len) {
    for (var i = arr.length; i < len; i++) {
        arr.push({'orig':'i'+i, 'dest':'i'+(i+1), brush:this.brushes()[0]});
    }
    return arr;
}



function reset() {
    this.chess = new Chess()
    this.setState({fen: this.chess.fen(), lastMove:{from:'ab1',to:'ab2', san:''}})
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

function addStateManagement(obj){
    obj.orientation  = orientation
    obj.turnColor = turnColor
    obj.calcMovable = calcMovable
    obj.onMove = onMove
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
}

export {addStateManagement}