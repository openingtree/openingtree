import { withStyles } from '@material-ui/core/styles';
import MUIAccordion from '@material-ui/core/Accordion';
import React from 'react'
import { createSubObjectWithProperties } from '../../app/util'
import * as Constants from '../../app/Constants'

export const Accordion = withStyles({
    root: {
        border: '1px solid rgba(0, 0, 0, .125)',
        boxShadow: 'none',
        '&:not(:last-child)': {
            borderBottom: 0,
        },
        '&:before': {
            display: 'none',
        },
        '&$expanded': {
            margin: 'auto',
        },
    },
    expanded: {},
})(MUIAccordion);

export function getNumberIcon(n) {
    return <img alt={`step ${n}`} className = 'lowOpacity styledNumbers' src={`/images/styled-${n}.png`} height={24}/>
}

export function advancedFilters(state) {
    return createSubObjectWithProperties(state,
        [Constants.TIME_CONTROL_ULTRA_BULLET, Constants.TIME_CONTROL_BULLET,
        Constants.TIME_CONTROL_BLITZ, Constants.TIME_CONTROL_RAPID,
        Constants.TIME_CONTROL_CORRESPONDENCE, Constants.TIME_CONTROL_DAILY,
        Constants.TIME_CONTROL_CLASSICAL, Constants.FILTER_NAME_RATED,
        Constants.FILTER_NAME_DOWNLOAD_LIMIT,
        Constants.FILTER_NAME_ELO_RANGE, Constants.FILTER_NAME_OPPONENT,
        Constants.FILTER_NAME_FROM_DATE, Constants.FILTER_NAME_TO_DATE])
}

export function copyText(elementId) {
    /* Get the text field */
    var copyText = document.getElementById(elementId);
    try {
        /* Select the text field */
        copyText.select();
        copyText.setSelectionRange(0, 99999); /*For mobile devices*/

        /* Copy the text inside the text field */
        document.execCommand("copy");
        return true
    } catch(e) {
        return false
    }
}