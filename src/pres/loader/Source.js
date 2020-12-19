import { Accordion, getNumberIcon } from './Common';
import * as Constants from '../../app/Constants';

import React from 'react';

import {
    AccordionActions,
    AccordionDetails,
    AccordionSummary,
    Button as MaterialUIButton,
    Collapse,
    Divider,
    FormControlLabel,
    Radio,
    RadioGroup
} from '@material-ui/core';

import {
    Backup,
    DateRange,
    ExpandMore,
    People,
    Save
} from '@material-ui/icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChessRook } from '@fortawesome/free-solid-svg-icons';

const SOURCE_VARIANT_COMBINATION = {
    [Constants.VARIANT_RACING_KINGS]:[Constants.SITE_LICHESS, Constants.SITE_ONLINE_TOURNAMENTS, Constants.SITE_OPENING_TREE_FILE, Constants.SITE_PGN_FILE],
    [Constants.VARIANT_KING_OF_THE_HILL]:[Constants.SITE_CHESS_DOT_COM, Constants.SITE_LICHESS, Constants.SITE_ONLINE_TOURNAMENTS, Constants.SITE_OPENING_TREE_FILE, Constants.SITE_PGN_FILE],
    [Constants.VARIANT_THREE_CHECK]:[Constants.SITE_CHESS_DOT_COM, Constants.SITE_LICHESS, Constants.SITE_ONLINE_TOURNAMENTS, Constants.SITE_OPENING_TREE_FILE, Constants.SITE_PGN_FILE],
    [Constants.VARIANT_CRAZYHOUSE]:[Constants.SITE_CHESS_DOT_COM, Constants.SITE_LICHESS, Constants.SITE_ONLINE_TOURNAMENTS, Constants.SITE_OPENING_TREE_FILE, Constants.SITE_PGN_FILE]
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
            return <span>{addNumber?getNumberIcon('done', addNumber):null}<FontAwesomeIcon icon={faChessRook} className="lowOpacity" /><span className="sourceName"> Lichess tournaments</span></span>
        }
        return <span>{getNumberIcon(1, addNumber)}Select a source</span>
    }
    continue(){
        this.props.siteChange(this.props.site)
    }
    setSite(event) {
        let newSite = event.target.value
        this.props.siteChange(newSite)
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
                expandIcon={<ExpandMore />}
                aria-controls="panel1c-content"
                id="panel1c-header"
            >
                <div>
                    {this.getSourceOption(this.props.site, true)}
                </div>
            </AccordionSummary>
            <AccordionDetails>
                <RadioGroup onChange={this.setSite.bind(this)} value={this.props.site}>
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
            {this.props.site?
            <span>
            <Divider />

            <AccordionActions>
                    <MaterialUIButton size="small" color="primary" onClick={this.continue.bind(this)}>Continue</MaterialUIButton>
                </AccordionActions></span>:
                null
            }
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