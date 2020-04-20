import React from 'react'
import { createSubObjectWithProperties, getTimeframeSteps } from '../../app/util'
import * as Constants from '../../app/Constants'
import { trackEvent } from '../../app/Analytics'
import Source from './Source'
import User from './User'
import Filters from './Filters'
import Actions from './Actions'

export default class PGNLoader extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            playerName: '',
            site: '',
            playerColor: this.props.settings.playerColor,
            isAdvancedFiltersOpen: false,
            isGamesSubsectionOpen: false,
            expandedPanel: 'source',
            notablePlayers:null,
            files:[]
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


    advancedFilters() {
        return createSubObjectWithProperties(this.state,
            [Constants.TIME_CONTROL_ULTRA_BULLET, Constants.TIME_CONTROL_BULLET,
            Constants.TIME_CONTROL_BLITZ, Constants.TIME_CONTROL_RAPID,
            Constants.TIME_CONTROL_CORRESPONDENCE, Constants.TIME_CONTROL_DAILY,
            Constants.TIME_CONTROL_CLASSICAL, Constants.FILTER_NAME_RATED,
            Constants.FILTER_NAME_SELECTED_TIMEFRAME, Constants.FILTER_NAME_DOWNLOAD_LIMIT,
            Constants.FILTER_NAME_ELO_RANGE])
    }


    handleExpansionChange(panel) {
        return (event, newExpanded) => {
            this.setState({ expandedPanel: newExpanded ? panel : false });
        };
    }

    playerDetailsChange(playerName, files) {
        this.setState({
            playerName: playerName,
            expandedPanel:'filters',
            files:files
        })
        trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "PlayerNameSaved")
    }


    siteChange(event) {
        let newSite = event.target.value
        if(newSite === Constants.SITE_GOAT_DB && !this.state.notablePlayers) {
            setTimeout((()=>this.setState({notablePlayers:[
                { name: 'Annie Cruz', value: 'annie.cruz', photo: 'https://randomuser.me/api/portraits/women/60.jpg' },
                { name: 'Eli Shelton', disabled: true, value: 'eli.shelton', photo: 'https://randomuser.me/api/portraits/men/7.jpg' },
                { name: 'Loretta Rogers', value: 'loretta.rogers', photo: 'https://randomuser.me/api/portraits/women/51.jpg' },
                { name: 'Lloyd Fisher', value: 'lloyd.fisher', photo: 'https://randomuser.me/api/portraits/men/34.jpg' },
                { name: 'Tiffany Gonzales', value: 'tiffany.gonzales', photo: 'https://randomuser.me/api/portraits/women/71.jpg' },
                { name: 'Charles Hardy', value: 'charles.hardy', photo: 'https://randomuser.me/api/portraits/men/12.jpg' },
                { name: 'Rudolf Wilson', value: 'rudolf.wilson', photo: 'https://randomuser.me/api/portraits/men/40.jpg' },
                { name: 'Emerald Hensley', value: 'emerald.hensley', photo: 'https://randomuser.me/api/portraits/women/1.jpg' },
                { name: 'Lorena McCoy', value: 'lorena.mccoy', photo: 'https://randomuser.me/api/portraits/women/70.jpg' },
                { name: 'Alicia Lamb', value: 'alicia.lamb', photo: 'https://randomuser.me/api/portraits/women/22.jpg' },
                { name: 'Maria Waters', value: 'maria.waters', photo: 'https://randomuser.me/api/portraits/women/82.jpg' },
            ]})).bind(this), 5000)
        }
        this.setState({ site: newSite, expandedPanel:'user'})
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
                showError={this.props.showError} files={this.state.files} players={this.state.notablePlayers}
                site={this.state.site} playerDetailsChange={this.playerDetailsChange.bind(this)}/>
            <Filters expandedPanel={this.state.expandedPanel} playerColor={this.state.playerColor}
                handleExpansionChange={this.handleExpansionChange('filters').bind(this)}
                site={this.state.site} advancedFilters={this.advancedFilters()}
                timeframeSteps={this.timeframeSteps} filtersChange={this.filtersChange.bind(this)}/>
            </div>
            <Actions expandedPanel={this.state.expandedPanel} playerColor={this.state.playerColor} files={this.state.files}
                playerName={this.state.playerName} site={this.state.site} advancedFilters={this.advancedFilters()}
                notify={this.props.notify} showError={this.props.showError} onChange={this.props.onChange}
                setDownloading={this.props.setDownloading} clear={this.props.clear} isDownloading={this.props.isDownloading}
                switchToMovesTab={this.props.switchToMovesTab} gamesProcessed={this.props.gamesProcessed}/>

        </div>
    }

}