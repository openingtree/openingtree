import React from 'react'
import {Button} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRetweet, faTrashAlt, faRandom, faFastBackward, faDesktop } from '@fortawesome/free-solid-svg-icons'
import {Container, Row, Col} from 'reactstrap'

export default class SettingsView extends React.Component {
    constructor(props){
        super(props)
    }

    toggle(eventName){
        return (()=> {
            let newValue = this.props.settings[eventName] === 'white' ? 'black':'white'
            this.props.onChange(eventName, newValue)
        }).bind(this)
    }
    analyse() {
        window.open(`https://www.lichess.org/analysis/${this.props.fen}`, '_blank');
    }
    render() {
        return <div>
                <Container><Row><Col xs="6">
        <Button className="settingButton" onClick = {this.toggle('orientation')} color=""><h3><FontAwesomeIcon icon={faRetweet} /></h3> Flip board</Button>
        </Col><Col xs="6"><Button className="settingButton" onClick = {this.toggle('playerColor')} color=""><h3><FontAwesomeIcon icon={faRandom} /></h3> Player color</Button>
        </Col></Row><Row><Col xs="6">
        <Button className="settingButton" onClick = {this.props.clear} color=""><h3><FontAwesomeIcon icon={faTrashAlt} /></h3> Clear games</Button>
        </Col><Col xs="6"><Button className="settingButton" onClick = {this.props.reset} color=""><h3><FontAwesomeIcon icon={faFastBackward} /></h3> Starting position</Button>
        </Col><Col xs="6"><Button className="settingButton" onClick = {this.analyse.bind(this)} color=""><h3><FontAwesomeIcon icon={faDesktop} /></h3> Computer analysis</Button>
        </Col></Row></Container>
        </div>
    }
}