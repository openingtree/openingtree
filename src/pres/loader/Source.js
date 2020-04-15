import React from 'react'
import {getNumberIcon} from './Common'
import { Radio, FormControlLabel, RadioGroup } from '@material-ui/core';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {ExpansionPanel} from './Common'
import * as Constants from '../../app/Constants'

export default class Source extends React.Component {
    getSourceOption(source) {
        if (source === Constants.SITE_LICHESS) {
            return <span><img alt="lichess" className="siteimage" src="./lichesslogo.png" /> lichess.org</span>
        } else if (source === Constants.SITE_CHESS_DOT_COM) {
            return <img alt="chess.com" className="siteimage" src="./chesscomlogo.png" />
        }
        return <span>{getNumberIcon(1)} Select a source</span>
    }

    render() {
        return <ExpansionPanel
            expanded={this.props.expandedPanel === 'source'}
            onChange={this.props.handleExpansionChange}>
            <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1c-content"
                id="panel1c-header"
            >
                <div>
                    {this.getSourceOption(this.props.site)}
                </div>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <RadioGroup onChange={this.props.siteChange}>
                    <FormControlLabel className="sitelabel" value={Constants.SITE_LICHESS} control={<Radio color="primary" />} label={this.getSourceOption(Constants.SITE_LICHESS)} />
                    <FormControlLabel className="sitelabel" value={Constants.SITE_CHESS_DOT_COM} control={<Radio color="primary" />} label={this.getSourceOption(Constants.SITE_CHESS_DOT_COM)} />
                </RadioGroup>
            </ExpansionPanelDetails>
        </ExpansionPanel>
        
    }
}