import React from 'react'
import PGNReader from '../app/PGNReader'
import {Button} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faList } from '@fortawesome/free-solid-svg-icons'
import { Radio,FormControlLabel,RadioGroup } from '@material-ui/core';

export default class PGNLoader extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            playerName:'',
            site:'lichess'
        }
    }
    playerNameChange(event) {
        this.setState({
            playerName:event.target.value
        })
    }
    load() {
        this.props.clear()
        new PGNReader().parsePGN(this.state.playerName, this.state.site, this.props.notify, this.showError, this.stopDownloading.bind(this))
        this.props.setDownloading(true)
        this.props.onChange("playerName", this.state.playerName)
    }
    stopDownloading() {
        this.props.setDownloading(false)
    }
    siteChange(event) {
        this.setState({site:event.target.value})
    }
    handleChange(playerColor){
        return (()=>{
                this.props.onChange("playerColor", playerColor)
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
            <div className = "pgnloadersection">
                <input type="text" 
                        onChange= {this.playerNameChange.bind(this)} 
                        name="playerName" 
                        id="playerNameTextBox"
                        placeholder={`${this.state.site==="lichess"?"lichess":"chess.com"} username`}/>
                <button onClick = {this.load.bind(this)}>Load</button> </div>
                <div className="pgnloadersection">playing as: 
                    <div>
                    <Button onClick = {this.handleChange('white')} color = {this.props.settings.playerColor === 'white'?'secondary':'link'}>White</Button>
                    <Button onClick = {this.handleChange('black')} color = {this.props.settings.playerColor === 'black'?'secondary':'link'}>Black</Button>
                  </div>
                </div>
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