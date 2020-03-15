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
import {Snackbar} from '@material-ui/core'
import Alert from '@material-ui/lab/Alert';

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
        settings:{
          playerName:'',
          orientation:'white',
          playerColor:'white'
        },
        errorMessage:''
      }
    this.forBrushes = ['paleGrey', 'paleGreen', 'green']
    this.againstBrushes = ['paleRed', 'paleRed', 'red']
  }



  render() {
    let lastMoveArray = this.state.lastMove ? [this.state.lastMove.from, this.state.lastMove.to] : null
    return <div> 
        <GlobalHeader/>
        <Container className="mainContainer">
          <Row><Col lg="2"><Navigator fen = {this.state.fen} move={this.state.lastMove} onChange ={this.navigateTo.bind(this)}/>
    </Col><Col lg="6"><Chessground
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
    />
    </Col><Col lg="4"><ControlsContainer fen={this.state.fen}
                gamesProcessed={this.state.gamesProcessed} 
                updateProcessedGames={this.updateProcessedGames.bind(this)}
                settingsChange={this.settingsChange.bind(this)}
                settings={this.state.settings}
                reset={this.reset.bind(this)}
                clear={this.clear.bind(this)}
                movesToShow={this.movesToShow()}
                onMove={this.onMove.bind(this)}
                turnColor={this.turnColor()}
                showError={this.showError.bind(this)}
                /></Col>
    </Row></Container>
    <Snackbar anchorOrigin={{ vertical:'top', horizontal:"center" }} open={this.state.errorMessage} autoHideDuration={6000} onClose={this.closeError.bind(this)}>
    <Alert onClose={this.closeError.bind(this)} severity="warning">
      {this.state.errorMessage}
    </Alert>
  </Snackbar>
    </div>
  }
}
