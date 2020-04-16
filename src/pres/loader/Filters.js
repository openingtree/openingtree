import React from 'react'
import {getNumberIcon} from './Common'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import {ExpansionPanel} from './Common'
import * as Constants from '../../app/Constants'
import { Button, Collapse, Card } from 'reactstrap'
import { trackEvent } from '../../app/Analytics'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button as MaterialUIButton } from '@material-ui/core'
import { faCaretDown, faCaretUp} from '@fortawesome/free-solid-svg-icons'
import AdvancedFilters from './AdvancedFilters'
import { createSubObjectWithProperties, getTimeframeSteps } from '../../app/util'

export default class User extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            playerColor: this.props.playerColor,
            isAdvancedFiltersOpen: false,
        }
        this.timeframeSteps = getTimeframeSteps()
        this.state[Constants.FILTER_NAME_SELECTED_TIMEFRAME] = [0, this.timeframeSteps.length - 1]
        this.state[Constants.FILTER_NAME_DOWNLOAD_LIMIT] = Constants.MAX_DOWNLOAD_LIMIT
        this.state[Constants.TIME_CONTROL_ULTRA_BULLET] = true
        this.state[Constants.TIME_CONTROL_BULLET] = true
        this.state[Constants.TIME_CONTROL_BLITZ] = true
        this.state[Constants.TIME_CONTROL_RAPID] = true
        this.state[Constants.TIME_CONTROL_CLASSICAL] = true
        this.state[Constants.TIME_CONTROL_CORRESPONDENCE] = true
        this.state[Constants.TIME_CONTROL_DAILY] = true
        this.state[Constants.FILTER_NAME_RATED] = "all"
        this.state[Constants.FILTER_NAME_ELO_RANGE] = [0, Constants.MAX_ELO_RATING]
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


    advancedFilters() {
        return createSubObjectWithProperties(this.state,
            [Constants.TIME_CONTROL_ULTRA_BULLET, Constants.TIME_CONTROL_BULLET,
            Constants.TIME_CONTROL_BLITZ, Constants.TIME_CONTROL_RAPID,
            Constants.TIME_CONTROL_CORRESPONDENCE, Constants.TIME_CONTROL_DAILY,
            Constants.TIME_CONTROL_CLASSICAL, Constants.FILTER_NAME_RATED,
            Constants.FILTER_NAME_SELECTED_TIMEFRAME, Constants.FILTER_NAME_DOWNLOAD_LIMIT,
            Constants.FILTER_NAME_ELO_RANGE])
    }

    render(){
        return <ExpansionPanel expanded={this.props.expandedPanel === 'filters'}
            onChange={this.props.handleExpansionChange}
            disabled={this.props.site===''}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}><span>{getNumberIcon(3)} Color and filters</span></ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <div className="pgnloadersection">
                    <div>
                        <Button onClick={this.playerColorChange('white')} color={this.state.playerColor === 'white' ? 'secondary' : 'link'}>White</Button>
                        <Button onClick={this.playerColorChange('black')} color={this.state.playerColor === 'black' ? 'secondary' : 'link'}>Black</Button>
                    </div>
                </div>
                <div className="pgnloadersection"><span className="linkStyle" onClick={this.toggleState('isAdvancedFiltersOpen').bind(this)}>Advanced filters <FontAwesomeIcon icon={this.state.isAdvancedFiltersOpen ? faCaretUp : faCaretDown} /></span>
                    <Collapse isOpen={this.state.isAdvancedFiltersOpen}>
                        <Card>
                            <AdvancedFilters
                                site={this.props.site}
                                toggleRated={this.toggleRated.bind(this)}
                                handleTimeControlChange={this.handleTimeControlChange.bind(this)}
                                handleTimeframeChange={this.handleTimeframeChange.bind(this)}
                                handleEloRangeChange={this.handleEloRangeChange.bind(this)}
                                timeframeSteps={this.timeframeSteps}
                                handleDownloadLimitChange={this.handleDownloadLimitChange.bind(this)}
                                advancedFilters={this.advancedFilters()}
                            />
                        </Card>
                    </Collapse></div></ExpansionPanelDetails>
            </ExpansionPanel>
    
    }
}