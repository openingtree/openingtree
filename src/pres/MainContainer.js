import React from 'react'
import Chess from 'chess.js'
import Chessground from 'react-chessground'
import 'react-chessground/dist/styles/chessground.css'
import {openingGraph} from '../app/OpeningGraph'
import PGNLoader from './PGNLoader'
import SettingsView from './Settings'
import Navigator from './Navigator'

export default class MainContainer extends React.Component {
  
  constructor(props){
    super(props)
    this.chess = new Chess()
    this.state = {
        fen: this.chess.fen(),
        lastMove: null,
        gamesProcessed:0,
        openingGraph:openingGraph,
        playerName:'',
        settings:{
          orientation:'white',
          playerColor:'white'
        }
      }
    this.forBrushes = ['paleGrey', 'paleGreen', 'green']
    this.againstBrushes = ['paleRed', 'paleRed', 'red']
  }

 

  turnColor() {
    return this.fullTurnName(this.chess.turn())
  }

  fullTurnName(shortName) {
    return shortName === 'w' ? 'white' : 'black'
  }

  playerColor() {
    return this.state.settings.playerColor
  }

  brushes() {
    if(this.playerColor() === this.turnColor()) {
      return this.forBrushes
    }
    return this.againstBrushes
  }

  calcMovable() {
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

  orientation() {
    return this.state.settings.orientation
  }

  onMove(from, to) {
    const chess = this.chess
    let move = chess.move({ from, to, promotion: 'q'})
    this.setState({ fen: chess.fen(), lastMove: move})
  }

  navigateTo(fen, previousMove){
    this.chess = new Chess(fen)
    this.setState({fen:fen, lastMove:previousMove})

  }
  updateProcessedGames(n, openingGraph) {
      this.setState({
        gamesProcessed: this.state.gamesProcessed+n,
        openingGraph: openingGraph
      })
  }
  moveToShape(move) {
    return {
      orig:move.orig,
                    dest: move.dest,
                    brush: this.brushes()[move.level]
    }
  }

  autoShapes() {
    var moves
    if (this.turnColor() === this.playerColor()) {
      moves = this.state.openingGraph.movesForFen(this.chess.fen())
    } else {
      moves = this.state.openingGraph.movesAgainstFen(this.chess.fen())
    } 
    if(moves) {
      var shapes = moves.map(this.moveToShape.bind(this))
      return this.fillArray(shapes,  25)
    }
    return this.fillArray([], 25) // dummy arrow to clear out existing arrows
  }

  fillArray(arr, len) {
    for (var i = arr.length; i < len; i++) {
      arr.push({'orig':'i'+i, 'dest':'i'+(i+1), brush:this.brushes()[0]});
    }
    return arr;
  }
  
  

  reset() {
    this.chess = new Chess()
    this.setState({fen: this.chess.fen(), lastMove:{from:'ab1',to:'ab2', san:''}})
  }

  clear() {
    this.state.openingGraph.clear()
    this.state.gamesProcessed = 0
    this.reset()
  }

  settingsChange(settings) {
    this.setState({
      'settings':settings
    })
  }

  render() {
    let lastMoveArray = this.state.lastMove ? [this.state.lastMove.from, this.state.lastMove.to] : null
    return <div> 
        
        <Chessground
      width={512}
      height={512}
      n={this.state.n}
      orientation={this.orientation()}
      turnColor={this.turnColor()}
      movable={this.calcMovable()}
      
      lastMove={lastMoveArray}
      fen={this.state.fen}
      onMove={this.onMove.bind(this)}
      drawable ={{
        enabled: true,
        visible: true,
        autoShapes: this.autoShapes()
      }}
      style={{ margin: 'auto' }}
    /><div>Number of games processed: {this.state.gamesProcessed}</div><PGNLoader notify = {this.updateProcessedGames.bind(this)}/>
    <SettingsView onChange = {this.settingsChange.bind(this)}/><div><button onClick = {this.reset.bind(this)}>Reset</button><button onClick = {this.clear.bind(this)}>Clear</button></div>
    <Navigator fen = {this.state.fen} move={this.state.lastMove} onChange ={this.navigateTo.bind(this)}/></div>
  }
}
