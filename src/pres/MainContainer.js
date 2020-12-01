import React from 'react'
import Chessground from 'react-chessground'
import 'react-chessground/dist/styles/chessground.css'
import OpeningGraph from '../app/OpeningGraph'
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
import {chessLogic} from '../app/chess/ChessLogic'

import {FormControlLabel, Checkbox} from '@material-ui/core'
import cookieManager from '../app/CookieManager'
import UserProfile, { USER_PROFILE_NEW_USER } from '../app/UserProfile'
import {trackEvent} from '../app/Analytics'

export default class MainContainer extends React.Component {
  
  constructor(props){
    super(props)
    let userProfile = UserProfile.getUserProfile()
    trackEvent(Constants.EVENT_CATEGORY_SEGMENT, "UserType", `${userProfile.userType}`, userProfile.numVisits)
    
    let urlVariant = new URLSearchParams(window.location.search).get("variant")
    let selectedVariant = urlVariant?urlVariant:Constants.VARIANT_STANDARD
    this.chess = chessLogic(selectedVariant)
    addStateManagement(this)
    this.state = {
        resize:0,
        fen: this.chess.fen(),
        lastMove: null,
        gamesProcessed:0,
        openingGraph:new OpeningGraph(selectedVariant),
        settings:{
          playerName:'',
          orientation:Constants.PLAYER_COLOR_WHITE,
          playerColor:'',
          movesSettings:this.getMovesSettingsFromCookie()
        },
        message:'',
        downloadingGames:false,
        feedbackOpen:false,
        diagnosticsDataOpen:false,
        variant:selectedVariant,
        update:0,//increase count to force update the component
        highlightedMove:null
      }
    this.chessboardWidth = this.getChessboardWidth()

    this.forBrushes = ['blue','paleGrey', 'paleGreen', 'green']
    this.againstBrushes = ['blue','paleRed', 'paleRed', 'red']
    window.addEventListener('resize', this.handleResize.bind(this))
  }
  handleResize() {
    this.setState({resize:this.state.resize+1})
    this.chessboardWidth = this.getChessboardWidth()
  }


  getMovesSettingsFromCookie(){
    let settings = cookieManager.getSettingsCookie()
    if(!settings) {
      // default settings
      settings = {
        movesSettings: {
          openingBookType:Constants.OPENING_BOOK_TYPE_LICHESS,
          openingBookRating:Constants.ALL_BOOK_RATINGS,
          openingBookTimeControls:[Constants.TIME_CONTROL_BULLET,
                                  Constants.TIME_CONTROL_BLITZ,
                                  Constants.TIME_CONTROL_RAPID,
                                  Constants.TIME_CONTROL_CLASSICAL],
          openingBookScoreIndicator:false,
          openingBookWinsIndicator:UserProfile.getUserProfile().userType>USER_PROFILE_NEW_USER
        }
      }
    }
    trackEvent(Constants.EVENT_CATEGORY_SETTINGS, "winsIndicator", `${settings.movesSettings.openingBookWinsIndicator?"on":"off"}`)
    trackEvent(Constants.EVENT_CATEGORY_SETTINGS, "bookType", settings.movesSettings.openingBookType)

    return settings.movesSettings
  }

  render() {
    let lastMoveArray = this.state.lastMove ? [this.state.lastMove.from, this.state.lastMove.to] : null
    let snackBarOpen = this.state.message?true:false
    let playerMoves = this.getPlayerMoves()
    let bookMoves = this.getBookMoves()
    this.mergePlayerAndBookMoves(playerMoves, bookMoves)
    return <div className="rootView"> 
        <GlobalHeader toggleFeedback = {this.toggleFeedback(false)}/>
        <Container className="mainContainer">
          <Row><Col lg={{order:0, size:2}} xs={{order:2}}>
            <Navigator fen = {this.state.fen} move={this.state.lastMove} 
              onChange ={this.navigateTo.bind(this)}
              variant = {this.state.variant}
            />
    </Col><Col lg="6"><Chessground key={this.state.resize}
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
        autoShapes: this.autoShapes(playerMoves, this.state.highlightedMove)
      }}
      style={{ margin: 'auto' }}
    />
    </Col><Col lg="4" className="paddingTop"><ControlsContainer fen={this.state.fen}
                resize ={this.state.resize} 
                gamesProcessed={this.state.gamesProcessed} 
                updateProcessedGames={this.updateProcessedGames.bind(this)}
                settingsChange={this.settingsChange.bind(this)}
                settings={this.state.settings}
                reset={this.reset.bind(this)}
                clear={this.clear.bind(this)}
                playerMoves={playerMoves}
                bookMoves={bookMoves}
                gameResults={this.gameResults()}
                onMove={this.onMove.bind(this)}
                turnColor={this.turnColor()}
                showError={this.showError.bind(this)}
                showInfo={this.showInfo.bind(this)}
                setDownloading={this.setDownloading.bind(this)}
                isDownloading={this.state.downloadingGames}
                openingGraph={this.state.openingGraph}
                importCallback={this.importGameState.bind(this)}
                variant={this.state.variant}
                variantChange={this.variantChange.bind(this)}
                forceFetchBookMoves={this.forceFetchBookMoves.bind(this)}
                highlightArrow={this.highlightArrow.bind(this)}
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
                            action={this.state.errorAction}
                            actionText={this.state.errorActionText}
                        />
    </Snackbar>

    <Modal isOpen={this.state.feedbackOpen} toggle={this.toggleFeedback(false)}>
        <ModalHeader toggle={this.toggleFeedback(false)}>Feedback</ModalHeader>
        <ModalBody>
          Your feedback is greatly appreciated. Reach out to me for feedback, suggestions, bug report or just a game of chess.
          <ul>
            <li>Email me: <a rel="noopener noreferrer" href={this.getEmailLink()} target="_blank">{Constants.OPENING_TREE_EMAIL}</a></li>
            <li>Message me on reddit <a rel="noopener noreferrer" href={this.getRedditLink()} target="_blank">u/{Constants.OPENNIG_TREE_REDDIT}</a></li>
            <li>Message me on lichess: <a rel="noopener noreferrer" href={`https://lichess.org/inbox/${Constants.OPENING_TREE_LICHESS}`} target="_blank">{Constants.OPENING_TREE_LICHESS}</a></li>
            <li>Message me on chess.com: <a rel="noopener noreferrer" href={`https://www.chess.com/messages/compose/${Constants.OPENING_TREE_CHESS_COM}`} target="_blank">{Constants.OPENING_TREE_CHESS_COM}</a></li>
            <li>Join my <a rel="noopener noreferrer" href={Constants.OPENING_TREE_DISCORD}target="_blank">discord server</a> to chat</li>
          </ul>
          <FormControlLabel
        control={
          <Checkbox
            checked={this.state.diagnosticsDataOpen}
            onChange={this.toggleDiagnosticsData}
            name="diagnostics"
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
          <Button color="secondary" onClick={this.toggleFeedback(false)}>Done</Button>
        </ModalFooter>
      </Modal>
    </div>
  }
}
