import React from 'react'
import PGNReader from '../app/PGNReader'
import { Button, Collapse, Card } from 'reactstrap'
import { Button as MaterialUIButton, TextField } from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faList, faCaretDown, faCaretUp, faChevronDown} from '@fortawesome/free-solid-svg-icons'
import { faCircle} from '@fortawesome/free-regular-svg-icons'
import { Radio, FormControlLabel, RadioGroup } from '@material-ui/core';
import AdvancedFilters from './AdvancedFilters'
import { createSubObjectWithProperties, getTimeframeSteps } from '../app/util'
import * as Constants from '../app/Constants'
import { trackEvent } from '../app/Analytics'
import GetApp from '@material-ui/icons/GetApp';
import Equalizer from '@material-ui/icons/Equalizer';
import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';


const ExpansionPanel = withStyles({
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

    playerNameChange(event) {
        this.setState({
            playerName: event.target.value
        })
    }
    playerColorChange(playerColor) {
        return () => {
            this.setState({ playerColor: playerColor })
            trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "ColorChange", playerColor)
        }
    }

    readPgn(shouldDownloadToFile) {
        this.pgnReader = new PGNReader()
        this.pgnReader.fetchPGNFromSite(this.state.playerName,
            this.state.playerColor,
            this.state.site,
            shouldDownloadToFile,
            this.advancedFilters(),
            this.props.notify,
            this.props.showError,
            this.stopDownloading.bind(this))
    }

    download() {
        if (!this.state.playerName) {
            this.props.showError("Please enter a username")
            return
        }
        this.readPgn(true)
        trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "Download", this.state.site, this.state.playerColor === 'white' ? 1 : 0)

    }

    load() {
        if (!this.state.playerName) {
            this.props.showError("Please enter a username")
            return
        }
        this.props.clear()
        // set the player name and color in the global state
        this.props.onChange("playerName", this.state.playerName)
        this.props.onChange("playerColor", this.state.playerColor)
        this.setState({ isAdvancedFiltersOpen: false, isGamesSubsectionOpen: true })
        this.readPgn(false)
        this.props.setDownloading(true)
        trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "Load", this.state.site, this.state.playerColor === 'white' ? 1 : 0)
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
    handleExpansionChange(panel) {
        return (event, newExpanded) => {
            this.setState({ expandedPanel: newExpanded ? panel : false });
        };
    }

    getNumberIcon(n) {
        return <img src={`/images/circled-${n}-100.png`} height={24}/>
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

    getSourceOption(source) {
        if (source === Constants.SITE_LICHESS) {
            return <span><img alt="lichess" className="siteimage" src="./lichesslogo.png" /> lichess.org</span>
        } else if (source === Constants.SITE_CHESS_DOT_COM) {
            return <img alt="chess.com" className="siteimage" src="./chesscomlogo.png" />
        }
        return <span>{this.getNumberIcon(1)} Select a source</span>
    }

    render() {
        return <div><div className="pgnloadersection">
            <ExpansionPanel
                expanded={this.state.expandedPanel === 'source'}
                onChange={this.handleExpansionChange('source').bind(this)}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1c-content"
                    id="panel1c-header"
                >
                    <div>
                        {this.getSourceOption(this.state.site)}
                    </div>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <RadioGroup onChange={this.siteChange.bind(this)}>
                        <FormControlLabel className="sitelabel" value={Constants.SITE_LICHESS} control={<Radio color="primary" />} label={this.getSourceOption(Constants.SITE_LICHESS)} />
                        <FormControlLabel className="sitelabel" value={Constants.SITE_CHESS_DOT_COM} control={<Radio color="primary" />} label={this.getSourceOption(Constants.SITE_CHESS_DOT_COM)} />
                    </RadioGroup>
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel expanded={this.state.expandedPanel === 'user'}
                onChange={this.handleExpansionChange('user').bind(this)} 
                disabled={this.state.site===''}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}><span>{this.getNumberIcon(2)} Enter username</span></ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <div>
                        <TextField
                            className="playernameField" name="playerName" id="playerNameTextBox" variant="outlined"
                            margin="dense" onChange={this.playerNameChange.bind(this)}
                            label={`${this.state.site === Constants.SITE_LICHESS ? "lichess" : "chess.com"} username`} />
                    </div>
                </ExpansionPanelDetails>
                <Divider />
                <ExpansionPanelActions>
                    <MaterialUIButton size="small">Random</MaterialUIButton>
                    <MaterialUIButton size="small" color="primary">
                        Save
          </MaterialUIButton>
                </ExpansionPanelActions></ExpansionPanel>
            <ExpansionPanel expanded={this.state.expandedPanel === 'filters'}
                onChange={this.handleExpansionChange('filters').bind(this)}
                disabled={this.state.site===''}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}><span>{this.getNumberIcon(3)} Color and filters</span></ExpansionPanelSummary>
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
                                    site={this.state.site}
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

            </ExpansionPanel></div>
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