import React from 'react'
import PGNReader from '../app/PGNReader'
import {Button, Collapse, Card} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faList, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { Radio,FormControlLabel,RadioGroup } from '@material-ui/core';
import AdvancedFilters from './AdvancedFilters'
import {createSubObjectWithProperties, getTimeframeSteps} from '../app/util'
import * as Constants from '../app/Constants'
import {trackEvent} from '../app/Analytics'

export default class PGNLoader extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            playerName:'',
            site:'lichess',
            playerColor:this.props.settings.playerColor,
            isAdvancedFiltersOpen:false,
            isGamesSubsectionOpen:false
        }
        this.timeframeSteps = getTimeframeSteps()
        this.state[Constants.FILTER_NAME_SELECTED_TIMEFRAME] = [0,this.timeframeSteps.length-1]
        this.state[Constants.FILTER_NAME_DOWNLOAD_LIMIT] = Constants.MAX_DOWNLOAD_LIMIT
        this.state[Constants.TIME_CONTROL_ULTRA_BULLET] = true
        this.state[Constants.TIME_CONTROL_BULLET] = true
        this.state[Constants.TIME_CONTROL_BLITZ] = true
        this.state[Constants.TIME_CONTROL_RAPID] = true
        this.state[Constants.TIME_CONTROL_CLASSICAL] = true
        this.state[Constants.TIME_CONTROL_CORRESPONDENCE] = true
        this.state[Constants.TIME_CONTROL_DAILY] = true
        this.state[Constants.FILTER_NAME_RATED] = "all"
        this.state[Constants.FILTER_NAME_ELO_RANGE] = [0,Constants.MAX_ELO_RATING]
    }
    toggleRated() {
        if(this.state.rated === 'all') {
            this.setState({rated:'rated'})
        } else if (this.state.rated === 'rated') {
            this.setState({rated:'casual'})
        } else {
            this.setState({rated:'all'})
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
            playerName:event.target.value
        })
    }
    playerColorChange(playerColor) {
        return () => {
            this.setState({playerColor:playerColor})
            trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "ColorChange", playerColor)
        }
    }
    load() {
        this.props.clear()
        // set the player name and color in the global state
        this.props.onChange("playerName", this.state.playerName)
        this.props.onChange("playerColor", this.state.playerColor)
        this.setState({isAdvancedFiltersOpen:false,isGamesSubsectionOpen:true})
        new PGNReader().parsePGN(this.state.playerName, 
            this.state.playerColor, 
            this.state.site,
            this.advancedFilters(),
            this.props.notify, 
            this.props.showError, 
            this.stopDownloading.bind(this))
        this.props.setDownloading(true)
        trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "Load", this.state.site, this.state.playerColor==='white'?1:0)
    }
    stopDownloading() {
        this.props.setDownloading(false)
    }
    stopDownloadingAction() {
        this.stopDownloading()
        trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "StopDownloading", this.state.site)
    }
    siteChange(event) {
        this.setState({site:event.target.value})
        trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "ChangeSite", this.state.site)
    }

    handleTimeControlChange(event) {
        this.setState({[event.target.name]: event.target.checked });
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

    render() {
        return <div>
            <div className = "pgnloadersection">
                <RadioGroup defaultValue={Constants.SITE_LICHESS} onChange={this.siteChange.bind(this)}>
                    <FormControlLabel className = "sitelabel" value={Constants.SITE_LICHESS} control={<Radio color="primary"/>} label={<span><img alt="lichess" className="siteimage" src="./lichesslogo.png"/> lichess.org</span>} />
                    <FormControlLabel className = "sitelabel" value={Constants.SITE_CHESS_DOT_COM} control={<Radio color="primary"/>} label={<img alt="chess.com" className="siteimage" src="./chesscomlogo.png"/>} />
                </RadioGroup>
            </div>
            <div  className="pgnloadersection">Games played as: 
                <div>
                <Button onClick = {this.playerColorChange('white')} color = {this.state.playerColor === 'white'?'secondary':'link'}>White</Button>
                <Button onClick = {this.playerColorChange('black')} color = {this.state.playerColor === 'black'?'secondary':'link'}>Black</Button>
                </div>
            </div>
    <div className="pgnloadersection"><span className="linkStyle" onClick ={this.toggleState('isAdvancedFiltersOpen').bind(this)}>Advanced filters <FontAwesomeIcon icon={this.state.isAdvancedFiltersOpen?faCaretUp:faCaretDown}/></span>
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
            </Collapse></div>
            <div className = "pgnloadersection">
                <input type="text" 
                        onChange= {this.playerNameChange.bind(this)} 
                        name="playerName" 
                        id="playerNameTextBox"
                        placeholder={`${this.state.site===Constants.SITE_LICHESS?"lichess":"chess.com"} username`}/>
                <button onClick = {this.load.bind(this)}>Load</button> </div>
                {
                    this.state.isGamesSubsectionOpen?
                    <div>
                        <div className="pgnloadersection">
                            {`Games Loaded: ${this.props.gamesProcessed} `}{this.props.isDownloading?<span className="stopDownloading">[<span className="linkStyle" onClick={this.stopDownloadingAction.bind(this)}><img src="./spinner.gif" height="15"/>stop</span>]</span>:""}
                        </div>
                        <div onClick = {()=>this.props.switchToMovesTab()} className="navLinkButton pgnloadersection">
                            <FontAwesomeIcon icon={faList} /> View Moves>>
                        </div>
                    </div>
                        :""
                }

        </div>
    }

}