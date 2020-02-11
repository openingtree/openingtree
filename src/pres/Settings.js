import React from 'react'
import {Button} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRetweet, faTrashAlt } from '@fortawesome/free-solid-svg-icons'

export default class SettingsView extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            orientation:'white'
        }
    }

    handleChange(eventState){
        return (()=> {this.setState({
                orientation: eventState
            }, ()=> {
                this.props.onChange(this.state)
            })
        }).bind(this)
    }
    render() {
        return <div>
            <div>
        <Button className="settingButton" onClick = {this.handleChange(this.state.orientation === 'white'?'black':'white')} color=""><h3><FontAwesomeIcon icon={faRetweet} /></h3> Flip board</Button>
        <Button className="settingButton" onClick = {this.props.clear} color=""><h3><FontAwesomeIcon icon={faTrashAlt} /></h3> Clear games</Button>
      </div>

        </div>
    }
}