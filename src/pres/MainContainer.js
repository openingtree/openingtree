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
        message:'',
        downloadingGames:false
      }
    this.forBrushes = ['paleGrey', 'paleGreen', 'green']
    this.againstBrushes = ['paleRed', 'paleRed', 'red']
  }
  getChessboardWidth(){
    // have to manually set the width to pixels instead of "vw" value
    // this is because chessground component does not behave well with "vw" values
    if (window.innerWidth<=768) {
      return `${Math.round(window.innerWidth*95/100)}px` //95vw
    } else if ((window.innerWidth<=1024)) {
      return `${Math.round(window.innerWidth*40/100)}px` // 40vw
    } else {
      return "512px"
    }

  }


  render() {
    let lastMoveArray = this.state.lastMove ? [this.state.lastMove.from, this.state.lastMove.to] : null
    let snackBarOpen = this.state.message?true:false
    let chessboardWidth = this.getChessboardWidth()
    return <div className="rootView"> 
        <GlobalHeader/>
        <Container className="mainContainer">
          <Row><Col lg={{order:0, size:2}} xs={{order:2}}><Navigator fen = {this.state.fen} move={this.state.lastMove} onChange ={this.navigateTo.bind(this)}/>
    </Col><Col lg="6"><Chessground
      height={chessboardWidth}
      width={chessboardWidth}
      orientation={this.orientation()}
      turnColor={this.turnColor()}
      movable={this.calcMovable()}
      
      lastMove={lastMoveArray}
      fen={this.state.fen}
      onMove={this.onMoveAction.bind(this)}
      drawable ={{
        enabled: true,
        visible: true,
        autoShapes: this.autoShapes()
      }}
      style={{ margin: 'auto' }}
    />
    </Col><Col lg="4" className="paddingTop"><ControlsContainer fen={this.state.fen}
                gamesProcessed={this.state.gamesProcessed} 
                updateProcessedGames={this.updateProcessedGames.bind(this)}
                settingsChange={this.settingsChange.bind(this)}
                settings={this.state.settings}
                reset={this.reset.bind(this)}
                clear={this.clear.bind(this)}
                movesToShow={this.movesToShow()}
                gameResults={this.gameResults()}
                onMove={this.onMove.bind(this)}
                turnColor={this.turnColor()}
                showError={this.showError.bind(this)}
                showInfo={this.showInfo.bind(this)}
                setDownloading={this.setDownloading.bind(this)}
                isDownloading={this.state.downloadingGames}
                openingGraph={this.state.openingGraph}
                /></Col>
    </Row></Container>
    <Snackbar anchorOrigin={{ vertical:'top', horizontal:"center" }} open={snackBarOpen} autoHideDuration={6000} onClose={this.closeError.bind(this)}>
    <Alert onClose={this.closeError.bind(this)} severity={this.state.messageSeverity}>
      {this.state.message}
    </Alert>
    </Snackbar>
    </div>
  }
}
