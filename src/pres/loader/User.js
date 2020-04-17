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
import FileUpload from './Dropzone'
export default class User extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            playerName:''
        }
    }

    editPlayerName(event) {
        this.setState({
            playerName: event.target.value,
            playerNameError:''
        })
    }

    setPlayername() {
        if(!this.state.playerName){
            this.setState({
                playerNameError:'Please enter a username'
            })
        } else {
            this.props.playerDetailsChange(this.state.playerName)
        }
    }
    getSummary() {
        if(this.props.playerName) {
            return <span>{getNumberIcon('done')}User: <b>{this.props.playerName}</b></span>
        }
        return <span>{getNumberIcon(2)}Player details</span>
    }

    render() {
        return <ExpansionPanel expanded={this.props.expandedPanel === 'user'}
                TransitionComponent={Collapse}
                TransitionProps={{timeout:Constants.LOADER_ANIMATION_DURATION_MS}}
                onChange={this.props.handleExpansionChange} 
                disabled={this.props.site===''}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>{this.getSummary()}</ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <div>
                        <FileUpload/>
                        <TextField
                            className="playernameField" name="playerName" id="playerNameTextBox" variant="outlined"
                            margin="dense" onChange={this.editPlayerName.bind(this)}
                            label={`${this.props.site === Constants.SITE_LICHESS ? "lichess" : "chess.com"} username`} 
                            helperText={this.state.playerNameError}
                            error={this.state.playerNameError?true:false}/>
                    </div>
                </ExpansionPanelDetails>
                <Divider />
                <ExpansionPanelActions>
                    <MaterialUIButton size="small">Random</MaterialUIButton>
                    <MaterialUIButton size="small" color="primary" onClick={this.setPlayername.bind(this)}>Save</MaterialUIButton>
                </ExpansionPanelActions></ExpansionPanel>
            
    }
}