import React from 'react'
import {Button} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRetweet, faTrashAlt, faRandom, faFastBackward } from '@fortawesome/free-solid-svg-icons'
import {Container, Row, Col} from 'reactstrap'

export default class SettingsView extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            settings:this.props.settings,

        }
    }

    toggle(eventName){
        return (()=> {this.setState({ settings: {
                [eventName]: this.state.settings[eventName] === 'white' ? 'black':'white'
                }
            }, ()=> {
                this.props.onChange(this.state.settings)
            })
        }).bind(this)
    }
    render() {
        return <div>
                <Container><Row><Col>
        <Button className="settingButton" onClick = {this.toggle('orientation')} color=""><h3><FontAwesomeIcon icon={faRetweet} /></h3> Flip board</Button>
        </Col><Col><Button className="settingButton" onClick = {this.toggle('playerColor')} color=""><h3><FontAwesomeIcon icon={faRandom} /></h3> Player color</Button>
        </Col></Row><Row><Col>
        <Button className="settingButton" onClick = {this.props.clear} color=""><h3><FontAwesomeIcon icon={faTrashAlt} /></h3> Clear games</Button>
        </Col><Col><Button className="settingButton" onClick = {this.props.reset} color=""><h3><FontAwesomeIcon icon={faFastBackward} /></h3> Starting position</Button>
        </Col></Row></Container>
        </div>
    }
}