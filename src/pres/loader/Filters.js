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

export default class User extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            playerColor: this.props.playerColor,
            isAdvancedFiltersOpen: false,
            filtersSet:false,
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
    playerColorChange(playerColor) {
        return () => {
            this.setState({ playerColor: playerColor })
            trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "ColorChange", playerColor)
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
        this.setState({filtersSet:true})
        this.props.filtersChange(this.state)
    }
    getSummary() {
        if(this.state.filtersSet) {
            return <span>{getNumberIcon('done')} Color: <b>{this.props.playerColor}</b></span>

        }
        return <span>{getNumberIcon(3)} Color and filters</span>
    }
    render(){
        return <ExpansionPanel expanded={this.props.expandedPanel === 'filters'}
            onChange={this.props.handleExpansionChange}
            disabled={!this.state.filtersSet && this.props.expandedPanel!=='filters'}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>{this.getSummary()}</ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <div className="pgnloadersection">
                    <div>
                        <Button onClick={this.playerColorChange(Constants.PLAYER_COLOR_WHITE)} color={this.state.playerColor === Constants.PLAYER_COLOR_WHITE ? 'secondary' : 'link'}>White</Button>
                        <Button onClick={this.playerColorChange(Constants.PLAYER_COLOR_BLACK)} color={this.state.playerColor === Constants.PLAYER_COLOR_BLACK ? 'secondary' : 'link'}>Black</Button>
                    </div>
                </div>
                <div className="pgnloadersection"><span className="linkStyle" onClick={this.toggleState('isAdvancedFiltersOpen').bind(this)}>Advanced filters <FontAwesomeIcon icon={this.state.isAdvancedFiltersOpen ? faCaretUp : faCaretDown} /></span>
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
                    </Collapse></div></ExpansionPanelDetails>
                    <Divider />
                <ExpansionPanelActions>
                    <MaterialUIButton size="small" color="primary" onClick={this.setFilters.bind(this)}>Save</MaterialUIButton>
                </ExpansionPanelActions></ExpansionPanel>
    
    }
}