import React from 'react'
import {getNumberIcon} from './Common'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import { Button as MaterialUIButton, TextField } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import {ExpansionPanel} from './Common'
import * as Constants from '../../app/Constants'
import Collapse from '@material-ui/core/Collapse';
import Dropzone from './Dropzone'
import InputAdornment from '@material-ui/core/InputAdornment'
import InsertLink from '@material-ui/icons/InsertLink'
import NotableChessPlayers from './NotableChessPlayers';

export default class User extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            playerName:'',
            files:[],
            pgnUrl:'',
            selectedPlayer:{}
        }
    }

    editPlayerName(event) {
        this.setState({
            playerName: event.target.value,
            playerNameError:''
        })
    }

    editPGNUrl(event) {
        this.setState({
            pgnUrl: event.target.value,
            pgnUrlError: ''
        })
    }
    
    filesChange(files) {
        this.setState({files:files})
    }

    notablePlayerChange(player) {
        this.setState({
            selectedPlayer:player})
    }

    validateInputDetailsSet() {
        if(this.props.site === Constants.SITE_PLAYER_DB){
            if(!this.state.selectedPlayer.name){
                this.props.showError("Please select a player")
                return false
            } 
        } if(this.props.site === Constants.SITE_LICHESS ||
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
        } else if(this.props.site === Constants.SITE_PGN_URL) {
            if(!this.state.pgnUrl) {
                this.setState({
                    pgnUrlError:'Please enter a pgn url'
                })
                return false
            }
        }
        return true
    }

    setPlayerDetails() {
         if(this.validateInputDetailsSet()) {
            this.props.playerDetailsChange(this.state.playerName, 
                this.state.files, 
                this.state.pgnUrl, 
                this.state.selectedPlayer)
        }
    }
    
    getSummary() {
        if(this.props.site === Constants.SITE_PLAYER_DB){
            if(this.props.selectedPlayer.name) {
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
        } else if(this.props.site === Constants.SITE_PGN_URL) {
            if(this.props.pgnUrl) {
                return <span>{getNumberIcon('done')}{this.props.pgnUrl}</span>
            }
        }
        return <span>{getNumberIcon(2)}Player details</span>
    }

    getPlayerNameInput(label) {
        return <TextField
            className="playernameField" name="playerName" id="playerNameTextBox" 
            margin="dense" onChange={this.editPlayerName.bind(this)}
            label={label} variant="outlined"
            helperText={this.state.playerNameError}
            error={this.state.playerNameError?true:false}/>
    }
    getGoatDBSelection(){
        return <NotableChessPlayers 
            players={this.props.players} 
            onChange={this.notablePlayerChange.bind(this)}
            selectedPlayer={this.state.selectedPlayer}/>
    }
    getPGNUrl(){
        //return <input type="url" inputProps={{ 'aria-label': 'description' }} />
        return <TextField id="input-with-icon-textfield" label="PGN url"
            variant="outlined" rowsMax={8} className="fullWidth"
            multiline placeholder="https://example.com/sample.pgn"
            helperText={this.state.pgnUrlError}
            error={this.state.pgnUrlError?true:false}
            onChange={this.editPGNUrl.bind(this)}
            InputProps={{
                startAdornment: 
                    <InputAdornment position="start">
                    <InsertLink />
                    </InputAdornment>
                
            }}
        />
    }

    getInputsToShow() {
        if(this.props.site === Constants.SITE_PGN_FILE) {
            return <Dropzone filesChange={this.filesChange.bind(this)} filesLimit={10}
                    dropzoneText="Drag and drop up to 10 pgn files here or click here to select files"
                />
        } else if (this.props.site === Constants.SITE_LICHESS) {
            return this.getPlayerNameInput('lichess username')
        } else if (this.props.site === Constants.SITE_CHESS_DOT_COM) {
            return this.getPlayerNameInput('chess.com username')
        } else if (this.props.site === Constants.SITE_PGN_URL) {
            return this.getPGNUrl()
        } else if (this.props.site === Constants.SITE_PLAYER_DB) {
            return this.getGoatDBSelection()
        } else if(this.props.site === Constants.SITE_OPENING_TREE_FILE) {
            return <Dropzone filesChange={this.filesChange.bind(this)} filesLimit={1}
                    dropzoneText="Drag and drop openingtree save file here or click here to select a file"
                />
        }
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
                    <MaterialUIButton size="small">Random</MaterialUIButton>
                    <MaterialUIButton size="small" color="primary" onClick={this.setPlayerDetails.bind(this)}>Save</MaterialUIButton>
                </ExpansionPanelActions></ExpansionPanel>
            
    }
}