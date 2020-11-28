import React from 'react'
import * as Constants from '../../app/Constants'
import { trackEvent } from '../../app/Analytics'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button as MaterialUIButton } from '@material-ui/core'
import PGNReader from '../../app/PGNReaderWorker'
import { faList} from '@fortawesome/free-solid-svg-icons'
import GetApp from '@material-ui/icons/GetApp'
import Equalizer from '@material-ui/icons/Equalizer'
import Fade from '@material-ui/core/Fade'
import Save from '@material-ui/icons/Save';
import * as SitePolicy from '../../app/SitePolicy'
import {Tooltip} from '@material-ui/core'
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import {serializeOpeningTree, deserializeOpeningTree} from '../../app/OpeningTreeSerializer'
import {proxy} from 'comlink'
import streamsaver from 'streamsaver'
import cookieManager from '../../app/CookieManager'

export default class Actions extends React.Component {
    constructor(props) {
        super(props) 
        this.state = {
            isGamesSubsectionOpen : false,
            exportingInProgress : false
        }
        streamsaver.mitm = "download/download-mitm.html"
        this.encoder = new TextEncoder()

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
    importTreeClicked() {
        this.setState({exportingInProgress:true})
        trackEvent(Constants.EVENT_CATEGORY_MAIN_ACTION, "LoadTree", this.props.site, this.props.playerColor === Constants.PLAYER_COLOR_WHITE ? 1 : 0)
        setImmediate(this.importOpeningTree.bind(this))
    }
    importOpeningTree() {
        deserializeOpeningTree(this.props.files[0], 
            (err,data, subMesage)=> {
                if(err) {
                    this.props.showError(err, null, subMesage)
                    this.setState({exportingInProgress:false})
                    return
                }
                let success = this.props.importOpeningTreeObject(data)
                this.setState({exportingInProgress:false})
                if(success) {
                    this.props.showInfo("Successfuly loaded openingtree")                
                }
            })
    }
    exportTreeClicked() {
        this.setState({exportingInProgress:true})
        trackEvent(Constants.EVENT_CATEGORY_MAIN_ACTION, "SaveTree", this.props.site, this.props.playerColor === Constants.PLAYER_COLOR_WHITE ? 1 : 0)
        setImmediate(this.exportOpeningTree.bind(this))
    }
    exportOpeningTree() {
        serializeOpeningTree(this.props.exportOpeningTreeObject(), 
            SitePolicy.exportFileName(this.props.site, this.props.playerName, this.props.playerColor, null, "tree"), 
            (err, info) => {
                if(err) {
                    this.props.showError(err)                    
                } else {
                    this.props.showInfo(info)
                }
                this.setState({exportingInProgress:false})
            })
    }
    abortDownloading() {
        if(this.fileWriter) {
            this.fileWriter.close()
            this.fileWriter = null
        }
    }

    getPgnString(game){
        return `${Object.entries(game.headers).map(header=>`[${header[0]} "${header[1]}"]`).join("\n")}
                \n${game.moves.map((moveObject, index)=>{
                    return `${index%2!==0?'':index/2+1+"."} ${moveObject.move}`
                }).join(' ')} ${game.result}\n\n\n`
    }
    downloadResponse(result, pendingDownloads) {
        this.fileWriter.write(this.encoder.encode(result.map(game=>this.getPgnString(game)).join(""))).then(()=>{
            if(!pendingDownloads) {
                this.abortDownloading()
                return false
            }
        })
        return true
    }

    readPgn(shouldDownloadToFile) {
        if(shouldDownloadToFile) {
            let fileStream =  streamsaver.createWriteStream(
                SitePolicy.exportFileName(
                    this.props.site, this.props.playerName, 
                    this.props.playerColor, this.props.selectedNotableEvent, "pgn"))
            this.fileWriter = fileStream.getWriter()
        }

        new PGNReader(this.props.variant).then((readerInstance) => {
            this.pgnReader = readerInstance
            this.pgnReader.fetchPGNFromSite(this.props.playerName,
                this.props.playerColor,
                this.props.site,
                this.props.selectedNotablePlayer,
                this.props.selectedNotableEvent,
                this.props.selectedOnlineTournament,
                shouldDownloadToFile,
                this.props.advancedFilters,
                proxy(this.props.notify),
                proxy(this.props.showError),
                proxy(this.stopDownloading.bind(this)),
                this.props.files,
                proxy(this.downloadResponse.bind(this)),
                this.getTokens())
        })
    }
    
    getTokens(){
        return {
            lichess:cookieManager.getLichessAccessToken()
        }
    }
    download() {
        this.readPgn(true)
        trackEvent(Constants.EVENT_CATEGORY_MAIN_ACTION, "Download", this.props.site, this.props.playerColor === Constants.PLAYER_COLOR_WHITE ? 1 : 0)

    }

    getPlayerName() {
        if(this.props.site === Constants.SITE_PLAYER_DB) {
            return this.props.selectedNotablePlayer.name
        }
        return this.props.playerName
    }
    componentWillReceiveProps(newProps) {
        if(newProps.gamesProcessed>0) {
            this.setState({isGamesSubsectionOpen:true})
        }
    }

    load() {
        this.props.clear()
        this.setState({ isGamesSubsectionOpen: true, loadedSite:this.props.site })
        // set the player name and color in the global state
        this.props.onChange("playerName", this.props.playerName)
        this.props.onChange("playerColor", this.props.playerColor)
        this.readPgn(false)
        this.props.setDownloading(true)
        trackEvent(Constants.EVENT_CATEGORY_MAIN_ACTION, "Load", this.props.site, this.props.playerColor === Constants.PLAYER_COLOR_WHITE ? 1 : 0)
    }
    stopDownloading() {
        this.props.setDownloading(false)
    }
    stopDownloadingAction() {
        this.stopDownloading()
        trackEvent(Constants.EVENT_CATEGORY_MAIN_ACTION, "StopDownloading", this.props.site)
    }
    openingTreeLoadActions() {
        return <div className="pgnloadersection">
            <MaterialUIButton
            onClick={this.importTreeClicked.bind(this)}
            variant="contained"
            color="primary"
            startIcon={this.state.exportingInProgress?<HourglassEmptyIcon/>:<GetApp/>}
            className="mainButton" disableElevation
            disabled={this.state.exportingInProgress}
            >
                {this.state.exportingInProgress?"Loading from file":"Load openingtree"}
        </MaterialUIButton></div>
    }
    regularActions() {
        let downloadDisabledReason = SitePolicy.treeSaveDisabledReason(
                                        this.state.loadedSite, 
                                        this.props.site,
                                        this.props.gamesProcessed, 
                                        this.props.isDownloading)
        return <div>
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
            <div className="pgnloadersection"><Tooltip placement="top" title={downloadDisabledReason||"Save a .tree file locally for faster reload later"}>
                <span><MaterialUIButton
                onClick={this.exportTreeClicked.bind(this)}
                variant="contained"
                color="default"
                startIcon={this.state.exportingInProgress?<HourglassEmptyIcon/>:<Save/>}
                className="mainButton" disableElevation
                disabled={!!downloadDisabledReason || this.state.exportingInProgress}
                >
                    {this.state.exportingInProgress?"Saving to file":"Save .tree file"}
                </MaterialUIButton></span></Tooltip></div>
            }
        {
            this.state.isGamesSubsectionOpen ?
                <div>
                    <div className="pgnloadersection">
                        {!this.props.playerColor?"Games":this.props.playerColor === Constants.PLAYER_COLOR_WHITE?"White games":"Black games"}{` loaded: ${this.props.gamesProcessed} `}{this.props.isDownloading ? <span className="stopDownloading">[<span className="linkStyle" onClick={this.stopDownloadingAction.bind(this)}><img alt="loading spinner" src="./spinner.gif" height="15" />stop</span>]</span> : ""}
                    </div>
                    <div onClick={() => this.props.switchToMovesTab()} className="navLinkButton pgnloadersection">
                        <FontAwesomeIcon icon={faList} /> View Moves&gt;&gt;
                </div>
                </div>
                : ""
        }
        </div>
    }
    mainComponent() {
        if(this.props.site === Constants.SITE_OPENING_TREE_FILE) {
            return this.openingTreeLoadActions()
        }
        return this.regularActions()
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