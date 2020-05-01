import { withStyles } from '@material-ui/core/styles';
import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import React from 'react'
import { createSubObjectWithProperties } from '../../app/util'
import * as Constants from '../../app/Constants'

export const ExpansionPanel = withStyles({
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
})(MuiExpansionPanel);

export function getNumberIcon(n) {
    return <img alt={`step ${n}`} className = 'lowOpacity styledNumbers' src={`/images/styled-${n}.png`} height={24}/>
}

export function advancedFilters(state) {
    return createSubObjectWithProperties(state,
        [Constants.TIME_CONTROL_ULTRA_BULLET, Constants.TIME_CONTROL_BULLET,
        Constants.TIME_CONTROL_BLITZ, Constants.TIME_CONTROL_RAPID,
        Constants.TIME_CONTROL_CORRESPONDENCE, Constants.TIME_CONTROL_DAILY,
        Constants.TIME_CONTROL_CLASSICAL, Constants.FILTER_NAME_RATED,
        Constants.FILTER_NAME_SELECTED_TIMEFRAME, Constants.FILTER_NAME_DOWNLOAD_LIMIT,
        Constants.FILTER_NAME_ELO_RANGE])
}