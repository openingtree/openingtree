import React from 'react'
import {getNumberIcon} from './Common'
import { Radio, FormControlLabel, RadioGroup } from '@material-ui/core';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionActions from '@material-ui/core/AccordionActions';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import {Accordion} from './Common'
import * as Constants from '../../app/Constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFlagCheckered, faChessKing } from '@fortawesome/free-solid-svg-icons'
import { Button as MaterialUIButton } from '@material-ui/core'
import Divider from '@material-ui/core/Divider';


export default class Source extends React.Component {
    getVariantOption(source, addNumber) {
        if (source === Constants.VARIANT_RACING_KINGS) {
            return <span>{addNumber?getNumberIcon('done', addNumber):null}<FontAwesomeIcon icon={faFlagCheckered} /> <span className="sourceName"> Racing kings </span></span>
        } else if (source === Constants.VARIANT_STANDARD) {
            return <span>{addNumber?getNumberIcon('done', addNumber):null}<FontAwesomeIcon icon={faChessKing} /> <span className="sourceName"> Standard variant </span></span>
        } 
    }
    changeLink(){
        return this.props.expandedPanel === 'variant'?null:<span className="smallText sourceName" /*style={{"vertical-align":"bottom"}}*/>&nbsp;[<span className="linkStyle">change</span>]</span>
    }
    getVariantRadio(source) {
        return <FormControlLabel 
                className="sitelabel" 
                value={source} 
                control={<Radio color="primary" />} 
                label={this.getVariantOption(source)} />
    }
    continue(){
        this.props.variantChange(this.props.variant)
    }
    setVariant(event){
        let newVariant = event.target.value
        this.props.variantChange(newVariant)
    }

    render() {
        return <Accordion TransitionComponent={Collapse}
            TransitionProps={{timeout:Constants.LOADER_ANIMATION_DURATION_MS}}
            expanded={this.props.expandedPanel === 'variant'}
            onChange={this.props.handleExpansionChange}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1c-content"
                id="panel1c-header"
            >
                <div>
                    {this.getVariantOption(this.props.variant, true)}
                </div>
                <div>
             {this.changeLink()}
            </div>
            </AccordionSummary>
            <AccordionDetails>
                <RadioGroup onChange={this.setVariant.bind(this)} value={this.props.variant}>
                {this.getVariantRadio(Constants.VARIANT_STANDARD)}
                {this.getVariantRadio(Constants.VARIANT_RACING_KINGS)}
               </RadioGroup>
            </AccordionDetails>
            <Divider />

            <AccordionActions>
                    <MaterialUIButton size="small" color="primary" onClick={this.continue.bind(this)}>Continue</MaterialUIButton>
                </AccordionActions>
        </Accordion>
        
    }
}