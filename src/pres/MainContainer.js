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
import {Snackbar, TextField} from '@material-ui/core'
import SnackbarContentWrapper from './SnackbarContentWrapper'
import * as Constants from '../app/Constants'
import {  Modal, ModalBody,
  ModalHeader,
  ModalFooter,
  Button,Collapse
} from 'reactstrap'

import {FormControlLabel, Checkbox} from '@material-ui/core'

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
          orientation:Constants.PLAYER_COLOR_WHITE,
          playerColor:''
        },
        message:'',
        downloadingGames:false,
        feedbackOpen:false
      }
    this.chessboardWidth = this.getChessboardWidth()

    this.forBrushes = ['paleGrey', 'paleGreen', 'green']
    this.againstBrushes = ['paleRed', 'paleRed', 'red']

  }

  importGameState(importState) {
    this.setState({
      settings:importState.settings,
      openingGraph:importState.openingGraph,
      gamesProcessed:importState.gamesProcessed
    })
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

getDiagnosticsValue() {
  return `--------------------
  ${navigator.userAgent}
  -------------------
  ${JSON.stringify(this.state)}
  -------------------
  `
}

  render() {
    let lastMoveArray = this.state.lastMove ? [this.state.lastMove.from, this.state.lastMove.to] : null
    let snackBarOpen = this.state.message?true:false
    return <div className="rootView"> 
        <GlobalHeader toggleFeedback = {this.toggleFeedback}/>
        <Container className="mainContainer">
          <Row><Col lg={{order:0, size:2}} xs={{order:2}}><Navigator fen = {this.state.fen} move={this.state.lastMove} onChange ={this.navigateTo.bind(this)}/>
    </Col><Col lg="6"><Chessground
      height={this.chessboardWidth}
      width={this.chessboardWidth}
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
                importCallback={this.importGameState.bind(this)}
                /></Col>
    </Row></Container>
    <Snackbar anchorOrigin={{ vertical:'bottom', horizontal:"left" }} 
            open={snackBarOpen} autoHideDuration={6000} 
            onClose={this.closeError.bind(this)}
    >
    <SnackbarContentWrapper
                            onClose={this.closeError.bind(this)}
                            variant={this.state.messageSeverity}
                            message={this.state.message}
                            subMessage={this.state.subMessage}
                            showReportButton={this.state.messageSeverity==='error'}
                            onReport={this.toggleFeedback}
                        />
    </Snackbar>

    <Modal isOpen={this.state.feedbackOpen} toggle={this.toggleFeedback}>
        <ModalHeader toggle={this.toggleFeedback}>Feedback</ModalHeader>
        <ModalBody>
          Your feedback is greatly appreciated. Reach out to me for feedback, suggestions, bug report or just a game of chess.
          <ul>
            <li>Email me: <a rel="noopener noreferrer" href="mailto:feedback@openingtree.com" target="_blank">feedback@openingtree.com</a></li>
            <li>Message me on reddit <a rel="noopener noreferrer" href="https://www.reddit.com/message/compose/?to=opening_tree" target="_blank">u/opening_tree</a></li>
            <li>Message me on lichess: <a rel="noopener noreferrer" href="https://lichess.org/inbox/vannooz" target="_blank">vannooz</a></li>
            <li>Message me on chess.com: <a rel="noopener noreferrer" href="https://www.chess.com/messages/compose/vannooz" target="_blank">vannooz</a></li>
            <li>Join my <a rel="noopener noreferrer" href="https://discord.gg/hCwKkN8" target="_blank">discord server</a> to chat</li>
          </ul>
          <FormControlLabel
        control={
          <Checkbox
            checked={this.state.diagnosticsDataOpen}
            onChange={this.toggleDiagnosticsData}
            name="checkedB"
            color="primary"
          />
        }
        label="Add diagnostics data to message"
      />
          <Collapse isOpen={this.state.diagnosticsDataOpen}>
            <TextField id="diagnosticsText" label="Click to copy." variant="outlined" 
            className="fullWidth" value={this.getDiagnosticsValue()} 
            rowsMax={4} onClick={this.copyDiagnostics} multiline/>
            </Collapse>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={this.toggleFeedback}>Done</Button>
        </ModalFooter>
      </Modal>
    </div>
  }
}
