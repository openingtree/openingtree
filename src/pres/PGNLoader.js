import React from 'react'
import PGNReader from '../app/PGNReader'
import {Button, Collapse, Card, Container, Row, Col} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faList, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { Radio,FormControlLabel,RadioGroup } from '@material-ui/core';
import AdvancedFilters from './AdvancedFilters'
import {createSubObjectWithProperties} from '../app/util'

export default class PGNLoader extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            playerName:'',
            site:'lichess',
            playerColor:this.props.settings.playerColor,

            isAdvancedFiltersOpen:false,

            ultrabullet:true,
            bullet:true,
            blitz:true,
            rapid:true,
            classical:true,
            correspondence:true,
            daily:true,

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
    toggleState(property) { 
        return () => {
            let newState = {}
            newState[property] = !this.state[property]
            this.setState(newState)
        }
    }

    playerNameChange(event) {
        this.setState({
            playerName:event.target.value
        })
    }
    playerColorChange(playerColor) {
        return () =>
            this.setState({playerColor:playerColor})
    }
    load() {
        this.props.clear()
        // set the player name and color in the global state
        this.props.onChange("playerName", this.state.playerName)
        this.props.onChange("playerColor", this.state.playerColor)
        this.setState({isAdvancedFiltersOpen:false})
        new PGNReader().parsePGN(this.state.playerName, this.state.playerColor, this.state.site, this.props.notify, this.props.showError, this.stopDownloading.bind(this))
        this.props.setDownloading(true)
    }
    stopDownloading() {
        this.props.setDownloading(false)
    }
    siteChange(event) {
        this.setState({site:event.target.value})
    }

    handleTimeControlChange(event) {
        this.setState({ ...this.state, [event.target.name]: event.target.checked });
    }


    render() {
        let selectedTimeControls = createSubObjectWithProperties(this.state, 
            ['ultrabullet', 'bullet', 'blitz', 'rapid', 'classical','correspondence', 'daily'])
        return <div>
            <div className = "pgnloadersection">
                <RadioGroup defaultValue="lichess" onChange={this.siteChange.bind(this)}>
                    <FormControlLabel className = "sitelabel" value="lichess" control={<Radio color="primary"/>} label={<span><img alt="lichess" className="siteimage" src="/lichesslogo.png"/> lichess.org</span>} />
                    <FormControlLabel className = "sitelabel" value="chesscom" control={<Radio color="primary"/>} label={<img alt="chess.com" className="siteimage" src="/chesscomlogo.png"/>} />
                </RadioGroup>
            </div>
            <div  className="pgnloadersection">Games played as: 
                <div>
                <Button onClick = {this.playerColorChange('white')} color = {this.state.playerColor === 'white'?'secondary':'link'}>White</Button>
                <Button onClick = {this.playerColorChange('black')} color = {this.state.playerColor === 'black'?'secondary':'link'}>Black</Button>
                </div>
            </div>
    <div className="pgnloadersection"><a href="#" onClick ={this.toggleState('isAdvancedFiltersOpen').bind(this)}>Advanced filters <FontAwesomeIcon icon={this.state.isAdvancedFiltersOpen?faCaretUp:faCaretDown}/></a>
            <Collapse isOpen={this.state.isAdvancedFiltersOpen}>
            <Card>
                <AdvancedFilters 
                    site={this.state.site} 
                    rated={this.state.rated}
                    toggleRated={this.toggleRated.bind(this)}
                    handleTimeControlChange={this.handleTimeControlChange.bind(this)}
                    selectedTimeControls={selectedTimeControls}
                />
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

}