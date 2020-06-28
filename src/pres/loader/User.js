import React from 'react'
import {getNumberIcon} from './Common'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import { Button as MaterialUIButton, TextField } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle} from '@fortawesome/free-solid-svg-icons'
import {faCheck, faSync} from '@fortawesome/free-solid-svg-icons'
import Divider from '@material-ui/core/Divider';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import {ExpansionPanel} from './Common'
import * as Constants from '../../app/Constants'
import Collapse from '@material-ui/core/Collapse';
import Dropzone from './Dropzone'
import NotableChessGames from './NotableChessGames';
import {Card, CardBody, CardText, CardTitle} from 'reactstrap'
import LockOpen from '@material-ui/icons/Lock'
import {Spinner} from 'reactstrap'

export default class User extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            playerName:'',
            files:[],
            selectedPlayer:{},
            selectedEvent:{}
        }
        
    }

    editPlayerName(event) {
        this.setState({
            playerName: event.target.value,
            playerNameError:''
        })
    }

    filesChange(files) {
        this.setState({files:files})
    }

    notablePlayerChange(player) {
        this.setState({
            selectedPlayer:player})
    }
    notableEventChange(event) {
        this.setState({
            selectedEvent:event})
    }

    componentWillReceiveProps(nextProps) {
        this.setState({playerNameError:''})
    }
    
    validateInputDetailsSet() {
        if(this.props.site === Constants.SITE_EVENT_DB){
            if(!this.state.selectedEvent){
                this.props.showError("Please select an event")
                return false
            } 
        } else if(this.props.site === Constants.SITE_PLAYER_DB){
            if(!this.state.selectedPlayer){
                this.props.showError("Please select a player")
                return false
            } 
        } else if(this.props.site === Constants.SITE_LICHESS ||
            this.props.site === Constants.SITE_CHESS_DOT_COM) {
                if(!this.state.playerName){
                    this.setState({
                        playerNameError:'Please enter a username'
                    })
                    return false
                } 
        } else if(this.props.site === Constants.SITE_PGN_FILE) {
            if(this.state.files.length === 0) {
                this.props.showError("Please upload a PGN file")
                return false
            }
        } else if(this.props.site === Constants.SITE_OPENING_TREE_FILE) {
            if(this.state.files.length === 0) {
                this.props.showError("Please upload an openingtree file")
                return false
            }
        } 
        return true
    }
    finalPlayerName(source, playerName, selectedNotablePlayer) {
        if(source === Constants.SITE_PLAYER_DB) {
            return selectedNotablePlayer.name
        }
        if(source === Constants.SITE_EVENT_DB) {
            return ''
        }
        return playerName
    }
    setPlayerDetails() {
         if(this.validateInputDetailsSet()) {
            this.props.playerDetailsChange(
                this.finalPlayerName(
                    this.props.site, 
                    this.state.playerName,
                    this.state.selectedPlayer), 
                this.state.files, 
                this.state.selectedEvent, 
                this.state.selectedPlayer)
        }
    }
    
    getSummary() {
        if(this.props.site === Constants.SITE_PLAYER_DB){
            if(this.props.selectedPlayer && this.props.selectedPlayer.name) {
                return <span>
                        {getNumberIcon('done')}
                        {this.props.selectedPlayer.profile.title}{'\u00A0'}
                        <b>{this.props.selectedPlayer.name}</b>
                    </span>
            }
        } else if(this.props.site === Constants.SITE_LICHESS || 
            this.props.site === Constants.SITE_CHESS_DOT_COM){
            if(this.props.playerName) {
                return <span>{getNumberIcon('done')}User: <b>{this.props.playerName}</b></span>
            }
        } else if(this.props.site === Constants.SITE_PGN_FILE || 
            this.props.site === Constants.SITE_OPENING_TREE_FILE){
            if(this.props.files.length===1) {
                return <span>{getNumberIcon('done')}File: <b>{this.props.files[0].name}</b></span>
            }
            if(this.props.files.length>1) {
                return <span>{getNumberIcon('done')}{this.props.files.length} PGN files uploaded</span>
            }
        } else if(this.props.site === Constants.SITE_EVENT_DB) {
            if(this.props.selectedEvent && this.props.selectedEvent.name) {
                return <span>{getNumberIcon('done')}{this.props.selectedEvent.name}</span>
            }
        }
        return <span>{getNumberIcon(2)}Player details</span>
    }
    launchLichessOauth() {
        window.location.href = 'https://oauth.lichess.org/oauth/authorize?response_type=code&client_id=EBXrB9R9OXpaRvOU&scope=preference:read&redirect_uri=https%3A%2F%2Flichesslogin.openingtree.com&state='+window.location.pathname
    }
    getLichessSelection() {
        return <div>
            {this.getLichessCardBody()}
            <br/>
            {this.getPlayerNameInput('lichess username')}
        </div>
    }

    getLichessCardBody() {
        if (this.props.lichessLoginState === Constants.LICHESS_STATE_PENDING) {
            return <Card>
                <div className="center">
                    <Spinner className="bigSpinner dividerMargin" /><br/>
                </div>
            </Card>
        } else if (this.props.lichessLoginState === Constants.LICHESS_LOGGED_IN && this.props.lichessLoginName) {
            return <Card>
                <CardBody className="singlePadding">
                    <CardTitle className="noBottomMargin">
                        <FontAwesomeIcon icon={faCheck} className="lowOpacity greenColor"/> Logged in as
                        <b> {this.props.lichessLoginName}</b>
                        
                    </CardTitle>
                    <CardTitle><FontAwesomeIcon icon={faSync} className="lowOpacity smallText leftMargin2"/>
                    <span onClick={this.props.refreshLichessStatus} className="smallText linkStyle leftMargin4"> Recheck login status</span>
                    </CardTitle>
                    <MaterialUIButton
                        onClick={this.props.logoutOfLichess}
                        variant="contained"
                        color="default"
                        className="mainButton" disableElevation
                        startIcon={<LockOpen />}
                        >
                            LOGOUT
                    </MaterialUIButton>
                </CardBody>
            </Card>
        }
        return <Card><CardBody className="singlePadding">
        <CardTitle className="smallBottomMargin"><FontAwesomeIcon icon={faInfoCircle} className="lowOpacity"/> Speed up tree building (optional)</CardTitle>
        <CardText className="smallText">
            Lichess allows much faster download of games if you login. You can learn more about this <a href = 'https://lichess.org/api#operation/apiGamesUser' rel="noopener noreferrer" target="_blank">here</a>. 
            Recommended for viewing your own games or when your opponent has lots of games.
        </CardText>
        <MaterialUIButton
                onClick={this.launchLichessOauth}
                variant="contained"
                color="default"
                className="mainButton" disableElevation
                startIcon={<LockOpen />}
                >
                    LOGIN TO LICHESS
                </MaterialUIButton>
        </CardBody>
        </Card>
    }

    getChessComSelection() {
        return this.getPlayerNameInput('chess.com username')
    }

    getPlayerNameInput(label, helperText) {
        return <TextField
            className="playernameField" name="playerName" id="playerNameTextBox" 
            margin="dense" onChange={this.editPlayerName.bind(this)}
            label={label} variant="outlined" value={this.state.playerName}
            helperText={this.state.playerNameError? this.state.playerNameError:helperText}
            error={this.state.playerNameError?true:false} onKeyUp={this.playerNameKeyUp.bind(this)}/>
    }



    playerNameKeyUp(evt) {
        if(evt.keyCode === 13) { // enter key pressed
            this.setPlayerDetails()
        }
    }
    getGoatDBSelection(){
        return <NotableChessGames 
            list={this.props.notablePlayers} 
            placeholder="Select a player"
            onChange={this.notablePlayerChange.bind(this)}
            selectedDetail={this.state.selectedPlayer}/>
    }
    getGoatDBEventSelection(){
        return <NotableChessGames 
            list={this.props.notableEvents} 
            placeholder="Select an event"
            onChange={this.notableEventChange.bind(this)}
            selectedDetail={this.state.selectedEvent}/>
    }

    getPgnFileSelection() {
        return <div><Dropzone filesChange={this.filesChange.bind(this)} filesLimit={10}
        dropzoneText="Drag and drop up to 10 pgn files here or click here to select files"
                />
                {this.getPlayerNameInput('player name in PGN', 'Leave blank to load all games')}
                </div>
    }

    getOpeningTreeSelection() {
        return <div>
            <Card>
                <CardBody className="singlePadding">
                <CardTitle className="smallBottomMargin"><FontAwesomeIcon icon={faInfoCircle} className="lowOpacity"/> How it works</CardTitle>
                <CardText className="smallText">
                    If you plan to revisit the same player, you can save a <b>.tree</b> file locally by loading a tree and then clicking <i>"Save Openingtree"</i>.
                    To reload the same tree, drop the <b>.tree</b> file in the dropzone below.
                </CardText>
                </CardBody>
                </Card><br/>
            <Dropzone filesChange={this.filesChange.bind(this)} filesLimit={1}
                    dropzoneText="Drag and drop openingtree save file here or click here to select a file"
                />
        </div>
    }

    getInputsToShow() {
        if(this.props.site === Constants.SITE_PGN_FILE) {
            return this.getPgnFileSelection()
        } else if (this.props.site === Constants.SITE_LICHESS) {
            return this.getLichessSelection()
        } else if (this.props.site === Constants.SITE_CHESS_DOT_COM) {
            return this.getChessComSelection()
        } else if (this.props.site === Constants.SITE_EVENT_DB) {
            return this.getGoatDBEventSelection()
        } else if (this.props.site === Constants.SITE_PLAYER_DB) {
            return this.getGoatDBSelection()
        } else if(this.props.site === Constants.SITE_OPENING_TREE_FILE) {
            return this.getOpeningTreeSelection()
        }
        return <div/>
    }

    render() {
        return <ExpansionPanel expanded={this.props.expandedPanel === 'user'}
                TransitionComponent={Collapse}
                TransitionProps={{timeout:Constants.LOADER_ANIMATION_DURATION_MS}}
                onChange={this.props.handleExpansionChange} 
                disabled={this.props.site===''}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>{this.getSummary()}</ExpansionPanelSummary>
                <ExpansionPanelDetails>
                        {this.getInputsToShow()}
                </ExpansionPanelDetails>
                <Divider />
                <ExpansionPanelActions>
                    <MaterialUIButton size="small" color="primary" onClick={this.setPlayerDetails.bind(this)}>Continue</MaterialUIButton>
                </ExpansionPanelActions></ExpansionPanel>
            
    }
}