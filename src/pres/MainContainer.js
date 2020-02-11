import React from 'react'
import Chess from 'chess.js'
import Chessground from 'react-chessground'
import 'react-chessground/dist/styles/chessground.css'
import {openingGraph} from '../app/OpeningGraph'
import Navigator from './Navigator'
import GlobalHeader from './GlobalHeader'
import {Container, Row, Col} from 'reactstrap'
import ControlsContainer from './ControlsContainer'
import {addStateManagement} from './StateManagement'

export default class MainContainer extends React.Component {
  
  constructor(props){
    super(props)
    this.chess = new Chess()
    addStateManagement(this)
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

 


  render() {
    let lastMoveArray = this.state.lastMove ? [this.state.lastMove.from, this.state.lastMove.to] : null
    return <div> 
        <GlobalHeader/>
        <Container>
          <Row><Col><Chessground
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
    /></Col><Col sm="6"><ControlsContainer 
                gamesProcessed={this.state.gamesProcessed} 
                updateProcessedGames={this.updateProcessedGames.bind(this)}
                settingsChange={this.settingsChange.bind(this)}
                settings={this.state.settings}
                reset={this.reset.bind(this)}
                clear={this.clear.bind(this)}/></Col>
    </Row><Row><Col><Navigator fen = {this.state.fen} move={this.state.lastMove} onChange ={this.navigateTo.bind(this)}/></Col></Row></Container>
    </div>
  }
}
