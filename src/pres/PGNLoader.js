import React from 'react'
import PGNReader from '../app/PGNReader'
import {Button, Collapse, Card, CardBody} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faList, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { Radio,FormControlLabel,RadioGroup } from '@material-ui/core';

export default class PGNLoader extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            playerName:'',
            site:'lichess',
            playerColor:this.props.settings.playerColor,
            isAdvancedFiltersOpen:false,
            ultraBullet:true,
            bullet:true,
            blitz:true,
            rapid:true,
            classical:true,
            correspondence:true,

            fromDate:'1970/01',
            toDate:'2100/12',
            maxGames:10000,
            rated:'all'
        }
      
    }
    toggleRated() {
        if(this.state.rated === 'all') {
            this.setState({rated:'rated'})
        } else if (this.state.rated === 'rated') {
            this.setState({rated:'casual'})
        } else {
            this.setState({rated:'all'})
        }
    }
    toggleAdvancedFilters(){
        this.setState({
            isAdvancedFiltersOpen:!this.state.isAdvancedFiltersOpen
        })
    }
    playerNameChange(event) {
        this.setState({
            playerName:event.target.value
        })
    }
    load() {
        this.props.clear()
        this.props.onChange("playerName", this.state.playerName)
        this.props.onChange("playerColor", this.state.playerColor)
        new PGNReader().parsePGN(this.state.playerName, this.state.playerColor, this.state.site, this.props.notify, this.props.showError, this.stopDownloading.bind(this))
        this.props.setDownloading(true)
    }
    stopDownloading() {
        this.props.setDownloading(false)
    }
    siteChange(event) {
        this.setState({site:event.target.value})
    }
    handleChange(playerColor){
        return (()=>{
            this.setState({
                playerColor:playerColor
            })
        })
    }
    render() {
        return <div>
            <div className = "pgnloadersection">
                <RadioGroup defaultValue="lichess" onChange={this.siteChange.bind(this)}>
                    <FormControlLabel className = "sitelabel" value="lichess" control={<Radio color="primary"/>} label={<span><img alt="lichess" className="siteimage" src="/lichesslogo.png"/> lichess.org</span>} />
                    <FormControlLabel className = "sitelabel" value="chesscom" control={<Radio color="primary"/>} label={<img alt="chess.com" className="siteimage" src="/chesscomlogo.png"/>} />
                </RadioGroup>
            </div>
            <div  className="pgnloadersection">Games played as: 
                <div>
                <Button onClick = {this.handleChange('white')} color = {this.state.playerColor === 'white'?'secondary':'link'}>White</Button>
                <Button onClick = {this.handleChange('black')} color = {this.state.playerColor === 'black'?'secondary':'link'}>Black</Button>
                </div>
            </div>
    <div className="pgnloadersection"><a href="#" onClick ={this.toggleAdvancedFilters.bind(this)}>Advanced filters <FontAwesomeIcon icon={this.state.isAdvancedFiltersOpen?faCaretUp:faCaretDown}/></a>
            <Collapse isOpen={this.state.isAdvancedFiltersOpen}>
            <Card>
                {this.getFilters(this.state.site)}
            </Card>
            </Collapse></div>
            <div className = "pgnloadersection">
                <input type="text" 
                        onChange= {this.playerNameChange.bind(this)} 
                        name="playerName" 
                        id="playerNameTextBox"
                        placeholder={`${this.state.site==="lichess"?"lichess":"chess.com"} username`}/>
                <button onClick = {this.load.bind(this)}>Load</button> </div>
                {
                    this.props.gamesProcessed>0?
                    <div>
                        <div className="pgnloadersection">
                            {`Games Loaded: ${this.props.gamesProcessed} `}{this.props.isDownloading?<span className="stopDownloading">[<a href="#" onClick={this.stopDownloading.bind(this)}>stop</a>]</span>:""}
                        </div>
                        <div onClick = {()=>this.props.switchToMovesTab()} className="navLinkButton pgnloadersection">
                            <FontAwesomeIcon icon={faList} /> View Moves>>
                        </div>
                    </div>
                        :""
                }

        </div>
    }

    ratedLabel() {
        if(this.state.rated === 'all') {
            return "Rated and casual"
        } else if (this.state.rated === 'rated') {
            return "Rated only"
        } else if (this.state.rated === 'casual') {
            return "Casual only"
        }
    }
    
    selectedTimeControls() {
        return "All time controls"
    }
    whenPlayed() {
        return "Anytime"
    }
    downloadLimit () {
        return "No limit"
    }

    getFilters(site){
        return <div>
            {this.subSectionComponent('Rated', this.ratedLabel(), this.toggleRated.bind(this))}
            {this.subSectionComponent('Time control', this.selectedTimeControls(), this.toggleRated.bind(this))}
            {this.subSectionComponent('When played', this.whenPlayed(), this.toggleRated.bind(this))}
            {this.subSectionComponent('Download limit', this.downloadLimit(), this.toggleRated.bind(this))}
      </div>
    }

    subSectionComponent(title, label, changeCallback) {
        return <div className="pgnloadersection">{title}: <span className="smallText">[<a href="#" onClick={changeCallback}>change</a>]</span>
        <div><b>{label}</b></div>
        </div>
    }
}