import React from 'react'
import {getNumberIcon} from './Common'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import {ExpansionPanel} from './Common'
import * as Constants from '../../app/Constants'
import { Button, Collapse } from 'reactstrap'
import { trackEvent } from '../../app/Analytics'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button as MaterialUIButton } from '@material-ui/core'
import { faCaretDown, faCaretUp} from '@fortawesome/free-solid-svg-icons'
import AdvancedFilters from './AdvancedFilters'
import {advancedFilters} from './Common'
import MuiCollapse from '@material-ui/core/Collapse';
import * as SitePolicy from '../../app/SitePolicy'
import { Radio, FormControlLabel, RadioGroup, FormHelperText, FormControl, FormLabel} from '@material-ui/core';
import deepEqual from 'deep-equal'

export default class User extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            playerColor: this.props.playerColor,
            isAdvancedFiltersOpen: false
        }
        this.timeframeSteps=this.props.timeframeSteps
        Object.assign(this.state, this.props.advancedFilters)
        this.defaultAdvancedFilters = this.props.advancedFilters
    }

    toggleRated() {
        if (this.state.rated === 'all') {
            this.setState({ rated: 'rated' })
        } else if (this.state.rated === 'rated') {
            this.setState({ rated: 'casual' })
        } else {
            this.setState({ rated: 'all' })
        }
        trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "AdvancedFilterChange", "rated")
    }
    toggleState(property) {
        return () => {
            let newState = {}
            newState[property] = !this.state[property]
            this.setState(newState)
            trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "ToggleAdvancedFilters", this.state.site)
        }
    }
    playerColorChange(event) {
        let playerColor = event.target.value
        this.setState({ playerColor: playerColor })
        trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "ColorChange", playerColor)
        if(!SitePolicy.isAdvancedFiltersEnabled(this.props.site)) {
            setImmediate(this.setFilters.bind(this))
        }
}
    handleTimeControlChange(event) {
        this.setState({ [event.target.name]: event.target.checked });
    }
    handleTimeframeChange(event, newValue) {
        this.setState({ [Constants.FILTER_NAME_SELECTED_TIMEFRAME]: newValue });
    }
    handleEloRangeChange(event, newValue) {
        this.setState({ [Constants.FILTER_NAME_ELO_RANGE]: newValue });
    }
    handleDownloadLimitChange(event, newValue) {
        this.setState({ [Constants.FILTER_NAME_DOWNLOAD_LIMIT]: newValue });
    }

    setFilters(){
        if(!this.state.playerColor) {
            this.setState({colorError:"Please select a color"})
            return
        }
        this.props.filtersChange(this.state)
    }
    getSummary(isDisabled) {
        if(this.props.playerColor && !isDisabled) {
            return <span>
                {getNumberIcon('done')}
                Color: <b>{this.props.playerColor===Constants.PLAYER_COLOR_WHITE?"White":"Black"} </b>
                {this.areAdvancedFiltersApplied()?<span className="smallText">(Filters applied)</span>:null}</span>

        }
        return <span>{getNumberIcon(3)} Color and filters</span>
    }
    componentWillReceiveProps(newProps) {
        this.setState({...newProps.advancedFilters, playerColor:newProps.playerColor})
    }

    areAdvancedFiltersApplied(){
        for (let [key, value] of Object.entries(this.defaultAdvancedFilters)) {
            if(this.props.advancedFilters[key]===value) {
                continue
            }
            if(!deepEqual(this.props.advancedFilters[key], value)) {
                return true
            } 
        }
        return false
    }

    
    render(){
        let isDisabled = !SitePolicy.isFilterPanelEnabled(this.props.site, this.props.playerName, this.props.selectedNotablePlayer)
        return <ExpansionPanel expanded={this.props.expandedPanel === 'filters'}
                    TransitionComponent={MuiCollapse}
                    TransitionProps={{timeout:Constants.LOADER_ANIMATION_DURATION_MS}}
            onChange={this.props.handleExpansionChange}
            disabled={isDisabled}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>{this.getSummary(isDisabled)}</ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <div className="pgnloaderfirstsection">
                <FormControl component="fieldset" error={!!this.state.colorError}>
                    <FormLabel component="legend">Games where <b>{this.props.playerName}</b> is playing as:</FormLabel>
                    <RadioGroup onChange={this.playerColorChange.bind(this)} value={this.state.playerColor}>
                        <FormControlLabel className="whitelabel" control={<Radio color="primary" />} value={Constants.PLAYER_COLOR_WHITE} label={this.state.playerColor === Constants.PLAYER_COLOR_WHITE?<b>White</b>:"White"}/>
                        <FormControlLabel className="blacklabel" control={<Radio color="primary" />} value={Constants.PLAYER_COLOR_BLACK} label={this.state.playerColor === Constants.PLAYER_COLOR_BLACK?<b>Black</b>:"Black"}/>
                    </RadioGroup>
                    <FormHelperText>{this.state.colorError}</FormHelperText>
                </FormControl>
                </div>
                {SitePolicy.isAdvancedFiltersEnabled(this.props.site)?<div className="pgnloadersection"><span className="linkStyle" onClick={this.toggleState('isAdvancedFiltersOpen').bind(this)}>Advanced filters <FontAwesomeIcon icon={this.state.isAdvancedFiltersOpen ? faCaretUp : faCaretDown} /></span>
                    <Collapse isOpen={this.state.isAdvancedFiltersOpen}>
                            <AdvancedFilters
                                site={this.props.site}
                                toggleRated={this.toggleRated.bind(this)}
                                handleTimeControlChange={this.handleTimeControlChange.bind(this)}
                                handleTimeframeChange={this.handleTimeframeChange.bind(this)}
                                handleEloRangeChange={this.handleEloRangeChange.bind(this)}
                                timeframeSteps={this.timeframeSteps}
                                handleDownloadLimitChange={this.handleDownloadLimitChange.bind(this)}
                                advancedFilters={advancedFilters(this.state)}
                            />
                    </Collapse>
                </div>:null}
                </ExpansionPanelDetails>
                <Divider />
                <ExpansionPanelActions>
                    <MaterialUIButton size="small" color="primary" onClick={this.setFilters.bind(this)}>Continue</MaterialUIButton>
                </ExpansionPanelActions></ExpansionPanel>
    
    }
}