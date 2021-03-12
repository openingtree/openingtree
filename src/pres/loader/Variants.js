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

import { ExpandMore } from '@material-ui/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlagCheckered, faChessKing, faDiceThree, faMountain, faHouseDamage } from '@fortawesome/free-solid-svg-icons';

export default class Variants extends React.Component {


    getVariantOption(variant, addNumber) {
        return <span>
            {addNumber?getNumberIcon('done', addNumber):null}
            <FontAwesomeIcon icon={this.getVariantIcon(variant)} /> <span> {this.getVariantText(variant)} </span>
        </span>
    }

    getVariantText(variant) {
        if (variant === Constants.VARIANT_RACING_KINGS) {
            return "Racing kings"
        } else if (variant === Constants.VARIANT_THREE_CHECK) {
            return "Three check"
        } else if (variant === Constants.VARIANT_KING_OF_THE_HILL) {
            return "King of the hill"
        } else if (variant === Constants.VARIANT_CRAZYHOUSE) {
            return "Crazyhouse"
        }
        return "Standard rules"
    }

    getVariantIcon(variant) {
        if (variant === Constants.VARIANT_RACING_KINGS) {
            return faFlagCheckered
        } else if (variant === Constants.VARIANT_THREE_CHECK) {
            return faDiceThree
        } else if (variant === Constants.VARIANT_KING_OF_THE_HILL) {
            return faMountain
        } else if (variant === Constants.VARIANT_CRAZYHOUSE) {
            return faHouseDamage
        }
        return faChessKing
    }
    changeLink(){
        return this.props.expandedPanel === 'variant'?null:<span className="smallText" style={{"verticalAlign":"text-bottom"}}>&nbsp;[<span className="linkStyle">change</span>]</span>
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
                expandIcon={<ExpandMore />}
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
                    {this.getVariantRadio(Constants.VARIANT_CRAZYHOUSE)}
                    {this.getVariantRadio(Constants.VARIANT_THREE_CHECK)}
                    {this.getVariantRadio(Constants.VARIANT_KING_OF_THE_HILL)}
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
