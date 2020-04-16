import React from 'react'
import PGNReader from '../../app/PGNReader'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button as MaterialUIButton } from '@material-ui/core'
import { faList} from '@fortawesome/free-solid-svg-icons'
import { createSubObjectWithProperties, getTimeframeSteps } from '../../app/util'
import * as Constants from '../../app/Constants'
import { trackEvent } from '../../app/Analytics'
import GetApp from '@material-ui/icons/GetApp';
import Equalizer from '@material-ui/icons/Equalizer';
import Source from './Source'
import User from './User'
import Filters from './Filters'

export default class PGNLoader extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            playerName: '',
            site: '',
            playerColor: this.props.settings.playerColor,
            isAdvancedFiltersOpen: false,
            isGamesSubsectionOpen: false,
            expandedPanel: 'source'
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

    unload = () => {
        if (this.pgnReader) {
            this.pgnReader.stopDownloading()
        }
    }
    componentDidMount() {
        window.addEventListener("beforeunload", this.unload);
    }

    componentWillUnmount() {
        window.removeEventListener("beforeunload", this.unload);
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



    playerNameChange(playerName) {
        this.setState({
            playerName: playerName,
            expandedPanel:'filters'
        })
        trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "PlayerNameSaved")
    }

    readPgn(shouldDownloadToFile) {
        this.pgnReader = new PGNReader()
        this.pgnReader.fetchPGNFromSite(this.state.playerName,
            this.state.playerColor,
            this.state.site,
            shouldDownloadToFile,
            this.advancedFilters(this.state),
            this.props.notify,
            this.props.showError,
            this.stopDownloading.bind(this))
    }
    handleExpansionChange(panel) {
        return (event, newExpanded) => {
            this.setState({ expandedPanel: newExpanded ? panel : false });
        };
    }

    download() {
        if (!this.state.playerName) {
            this.props.showError("Please enter a username")
            return
        }
        this.readPgn(true)
        trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "Download", this.state.site, this.state.playerColor === Constants.PLAYER_COLOR_WHITE ? 1 : 0)

    }

    load() {
        if (!this.state.playerName) {
            this.props.showError("Please enter a username")
            return
        }
        this.props.clear()
        this.setState({ isGamesSubsectionOpen: true })
        // set the player name and color in the global state
        this.props.onChange("playerName", this.state.playerName)
        this.props.onChange("playerColor", this.state.playerColor)
        this.readPgn(false)
        this.props.setDownloading(true)
        trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "Load", this.state.site, this.state.playerColor === Constants.PLAYER_COLOR_WHITE ? 1 : 0)
    }
    stopDownloading() {
        this.props.setDownloading(false)
    }
    stopDownloadingAction() {
        this.stopDownloading()
        trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "StopDownloading", this.state.site)
    }
    siteChange(event) {
        this.setState({ site: event.target.value, expandedPanel:'user'})
        trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "ChangeSite", this.state.site)
    }

    filtersChange(filters) {
        this.setState({...filters, expandedPanel:''})
        trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "FitlersSaved", this.state.site)
    }

    render() {
        return <div><div className="pgnloadersection">
            <Source expandedPanel={this.state.expandedPanel}
                handleExpansionChange={this.handleExpansionChange('source').bind(this)}
                site={this.state.site} siteChange={this.siteChange.bind(this)}/>
            <User expandedPanel={this.state.expandedPanel} playerName={this.state.playerName}
                handleExpansionChange={this.handleExpansionChange('user').bind(this)}
                site={this.state.site} playerNameChange={this.playerNameChange.bind(this)}/>
            <Filters expandedPanel={this.state.expandedPanel} playerColor={this.state.playerColor}
                handleExpansionChange={this.handleExpansionChange('filters').bind(this)}
                site={this.state.site} advancedFilters={this.advancedFilters()}
                timeframeSteps={this.timeframeSteps} filtersChange={this.filtersChange.bind(this)}/>
            </div>
            <div style={this.state.site===''?{display:`none`}:{}}>
            <div className="pgnloadersection"><MaterialUIButton
                onClick={this.load.bind(this)}
                variant="contained"
                color="primary"
                startIcon={<Equalizer />}
                className="mainButton" disableElevation
            >
                Analyze games
            </MaterialUIButton></div>
            <div className="pgnloadersection"><MaterialUIButton
                onClick={this.download.bind(this)}
                variant="contained"
                color="default"
                startIcon={<GetApp />}
                className="mainButton" disableElevation
            >
                Export as PGN
            </MaterialUIButton></div>
            {
                this.state.isGamesSubsectionOpen ?
                    <div>
                        <div className="pgnloadersection">
                            {`Games Loaded: ${this.props.gamesProcessed} `}{this.props.isDownloading ? <span className="stopDownloading">[<span className="linkStyle" onClick={this.stopDownloadingAction.bind(this)}><img alt="loading spinner" src="./spinner.gif" height="15" />stop</span>]</span> : ""}
                        </div>
                        <div onClick={() => this.props.switchToMovesTab()} className="navLinkButton pgnloadersection">
                            <FontAwesomeIcon icon={faList} /> View Moves>>
                    </div>
                    </div>
                    : ""
            }
        </div>
        </div>
    }

}