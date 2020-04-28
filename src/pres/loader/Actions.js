import React from 'react'
import * as Constants from '../../app/Constants'
import { trackEvent } from '../../app/Analytics'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button as MaterialUIButton } from '@material-ui/core'
import PGNReader from '../../app/PGNReader'
import { faList} from '@fortawesome/free-solid-svg-icons'
import GetApp from '@material-ui/icons/GetApp'
import Equalizer from '@material-ui/icons/Equalizer'
import Fade from '@material-ui/core/Fade'
import * as SitePolicy from '../../app/SitePolicy'

export default class Actions extends React.Component {
    constructor(props) {
        super(props) 
        this.state = {
            isGamesSubsectionOpen : false
        }
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

    readPgn(shouldDownloadToFile) {
        this.pgnReader = new PGNReader()
        this.pgnReader.fetchPGNFromSite(this.props.playerName,
            this.props.playerColor,
            this.props.site,
            this.props.selectedNotablePlayer,
            this.props.selectedNotableEvent,
            shouldDownloadToFile,
            this.props.advancedFilters,
            this.props.notify,
            this.props.showError,
            this.stopDownloading.bind(this),
            this.props.files)
    }

    download() {
        this.readPgn(true)
        trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "Download", this.props.site, this.props.playerColor === Constants.PLAYER_COLOR_WHITE ? 1 : 0)

    }

    getPlayerName() {
        if(this.props.site === Constants.SITE_PLAYER_DB) {
            return this.props.selectedNotablePlayer.name
        }
        return this.props.playerName
    }

    load() {
        this.props.clear()
        this.setState({ isGamesSubsectionOpen: true })
        // set the player name and color in the global state
        this.props.onChange("playerName", this.props.playerName)
        this.props.onChange("playerColor", this.props.playerColor)
        this.readPgn(false)
        this.props.setDownloading(true)
        trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "Load", this.props.site, this.props.playerColor === Constants.PLAYER_COLOR_WHITE ? 1 : 0)
    }
    stopDownloading() {
        this.props.setDownloading(false)
    }
    stopDownloadingAction() {
        this.stopDownloading()
        trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "StopDownloading", this.props.site)
    }
    mainComponent() {
        return <div style={{}}>
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
    }
    render(){
        if(this.props.expandedPanel) {
            return <Fade timeout={Constants.LOADER_ANIMATION_DURATION_MS*2}>
            {this.mainComponent()}
        </Fade>
        }
        return <Fade in timeout={Constants.LOADER_ANIMATION_DURATION_MS*3}>
            {this.mainComponent()}
        </Fade>
    }
}