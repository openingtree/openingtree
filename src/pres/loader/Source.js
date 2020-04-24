import React from 'react'
import {getNumberIcon} from './Common'
import { Radio, FormControlLabel, RadioGroup } from '@material-ui/core';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import {ExpansionPanel} from './Common'
import * as Constants from '../../app/Constants'
import Backup from '@material-ui/icons/Backup';
import Public from '@material-ui/icons/Public';
import People from '@material-ui/icons/People';
import Save from '@material-ui/icons/Save';
import Divider from '@material-ui/core/Divider';

export default class Source extends React.Component {
    getSourceOption(source, addNumber) {
        if (source === Constants.SITE_LICHESS) {
            return <span>{addNumber?getNumberIcon('done', addNumber):null}<img alt="lichess" className="siteimage" src="./lichesslogo.png" /><span className="sourceName"> lichess.org </span></span>
        } else if (source === Constants.SITE_CHESS_DOT_COM) {
            return <span>{addNumber?getNumberIcon('done', addNumber):null}<img alt="chess.com" className="siteimage" src="./chesscomlogo.png" /></span>
        } else if (source === Constants.SITE_PGN_FILE) {
            return <span>{addNumber?getNumberIcon('done', addNumber):null}<Backup className="lowOpacity"/><span className="sourceName"> Upload PGN file</span></span>
        } else if (source === Constants.SITE_PGN_URL) {
            return <span>{addNumber?getNumberIcon('done', addNumber):null}<Public className="lowOpacity"/><span className="sourceName"> Download PGN from url</span></span>
        } else if (source === Constants.SITE_PLAYER_DB) {
            return <span>{addNumber?getNumberIcon('done', addNumber):null}<People className="lowOpacity"/><span className="sourceName"> Notable chess players</span></span>
        }  else if (source === Constants.SITE_OPENING_TREE_FILE) {
            return <span>{addNumber?getNumberIcon('done', addNumber):null}<Save className="lowOpacity"/><span className="sourceName"> Openingtree save file</span></span>
        }
        return <span>{getNumberIcon(1, addNumber)}Select a source</span>
    }

    render() {
        return <ExpansionPanel TransitionComponent={Collapse}
            TransitionProps={{timeout:Constants.LOADER_ANIMATION_DURATION_MS}}
            expanded={this.props.expandedPanel === 'source'}
            onChange={this.props.handleExpansionChange}>
            <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1c-content"
                id="panel1c-header"
            >
                <div>
                    {this.getSourceOption(this.props.site, true)}
                </div>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <RadioGroup onChange={this.props.siteChange}>
                    <FormControlLabel className="sitelabel" value={Constants.SITE_PLAYER_DB} control={<Radio color="primary" />} label={this.getSourceOption(Constants.SITE_PLAYER_DB)} />
                    <FormControlLabel className="sitelabel" value={Constants.SITE_LICHESS} control={<Radio color="primary" />} label={this.getSourceOption(Constants.SITE_LICHESS)} />
                    <FormControlLabel className="sitelabel" value={Constants.SITE_CHESS_DOT_COM} control={<Radio color="primary" />} label={this.getSourceOption(Constants.SITE_CHESS_DOT_COM)} />
                    <Divider className="dividerMargin"/>
                    <FormControlLabel className="sitelabel" value={Constants.SITE_PGN_FILE} control={<Radio color="primary" />} label={this.getSourceOption(Constants.SITE_PGN_FILE)} />
                    <FormControlLabel className="sitelabel" value={Constants.SITE_OPENING_TREE_FILE} control={<Radio color="primary" />} label={this.getSourceOption(Constants.SITE_OPENING_TREE_FILE)} />
               </RadioGroup>
            </ExpansionPanelDetails>
        </ExpansionPanel>
        
    }
}