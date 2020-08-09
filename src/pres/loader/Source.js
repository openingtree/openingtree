import React from 'react'
import {getNumberIcon} from './Common'
import { Radio, FormControlLabel, RadioGroup } from '@material-ui/core';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import {Accordion} from './Common'
import * as Constants from '../../app/Constants'
import Backup from '@material-ui/icons/Backup';
import People from '@material-ui/icons/People';
import Save from '@material-ui/icons/Save';
import Divider from '@material-ui/core/Divider';
import DateRange from '@material-ui/icons/DateRange';
import {Badge} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChessRook } from '@fortawesome/free-solid-svg-icons'


const SOURCE_VARIANT_COMBINATION = {
    [Constants.VARIANT_RACING_KINGS]:[Constants.SITE_LICHESS, Constants.SITE_ONLINE_TOURNAMENTS, Constants.SITE_OPENING_TREE_FILE]
}

export default class Source extends React.Component {
    getSourceOption(source, addNumber) {
        if (source === Constants.SITE_LICHESS) {
            return <span>{addNumber?getNumberIcon('done', addNumber):null}<img alt="lichess" className="siteimage" src="./lichesslogo.png" /><span className="sourceName"> lichess.org </span></span>
        } else if (source === Constants.SITE_CHESS_DOT_COM) {
            return <span>{addNumber?getNumberIcon('done', addNumber):null}<img alt="chess.com" className="siteimage" src="./chesscomlogo.png" /></span>
        } else if (source === Constants.SITE_PGN_FILE) {
            return <span>{addNumber?getNumberIcon('done', addNumber):null}<Backup className="lowOpacity"/><span className="sourceName"> Load <i>PGN</i> file</span></span>
        } else if (source === Constants.SITE_EVENT_DB) {
            return <span>{addNumber?getNumberIcon('done', addNumber):null}<DateRange className="lowOpacity"/><span className="sourceName"> Notable chess events</span></span>
        } else if (source === Constants.SITE_PLAYER_DB) {
            return <span>{addNumber?getNumberIcon('done', addNumber):null}<People className="lowOpacity"/><span className="sourceName"> Notable chess players</span></span>
        }  else if (source === Constants.SITE_OPENING_TREE_FILE) {
            return <span>{addNumber?getNumberIcon('done', addNumber):null}<Save className="lowOpacity"/><span className="sourceName"> Load <b>.tree</b> file</span></span>
        } else if (source === Constants.SITE_ONLINE_TOURNAMENTS) {
            return <span>{addNumber?getNumberIcon('done', addNumber):null}{addNumber?<FontAwesomeIcon icon={faChessRook} className="lowOpacity" />:<Badge className="sourceName" color="info">New!</Badge>}<span className="sourceName"> Lichess tournaments</span></span>
        }
        return <span>{getNumberIcon(1, addNumber)}Select a source</span>
    }

    isSourceAvailable(source, variant) {
        let supportedSources = SOURCE_VARIANT_COMBINATION[variant]
        if(!supportedSources) {
            return true
        }
        return supportedSources.includes(source)
    }
    render() {
        return <Accordion TransitionComponent={Collapse}
            TransitionProps={{timeout:Constants.LOADER_ANIMATION_DURATION_MS}}
            expanded={this.props.expandedPanel === 'source'}
            onChange={this.props.handleExpansionChange}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1c-content"
                id="panel1c-header"
            >
                <div>
                    {this.getSourceOption(this.props.site, true)}
                </div>
            </AccordionSummary>
            <AccordionDetails>
                <RadioGroup onChange={this.props.siteChange} value={this.props.site}>
                {this.getSourceRadio(Constants.SITE_LICHESS)}
                {this.getSourceRadio(Constants.SITE_CHESS_DOT_COM)}
                {this.getSourceRadio(Constants.SITE_ONLINE_TOURNAMENTS)}
                {this.getSourceRadio(Constants.SITE_OPENING_TREE_FILE)}
                {this.props.variant === Constants.VARIANT_STANDARD?<Divider className="dividerMargin"/>:null}
                {this.getSourceRadio(Constants.SITE_PLAYER_DB)}
                {this.getSourceRadio(Constants.SITE_EVENT_DB)}
                {this.getSourceRadio(Constants.SITE_PGN_FILE)}
               </RadioGroup>
            </AccordionDetails>
        </Accordion>
        
    }

    getSourceRadio(source) {
        if(!this.isSourceAvailable(source,this.props.variant)) {
            return null
        }
        return <FormControlLabel 
                className="sitelabel" 
                value={source} 
                control={<Radio color="primary" />} 
                label={this.getSourceOption(source)} />
    }
}