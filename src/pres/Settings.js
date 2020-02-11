import React from 'react'
import {ButtonGroup, Button} from 'reactstrap'
export default class SettingsView extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            orientation:'white',
            playerColor:'white'
        }
    }

    handleChange(eventname, eventState){
        return (()=> {this.setState({
                [eventname]: eventState
            }, ()=> {
                this.props.onChange(this.state)
            })
        }).bind(this)
    }
    render() {
        return <div>
            <div>Playing as: {this.buttonGroup('playerColor')}</div>
            <div>Orientation: {this.buttonGroup('orientation')}</div>
            <Button onClick = {this.props.clear}>Clear</Button>

        </div>
    }

    buttonGroup(name) {
        return <div>
        <Button onClick = {this.handleChange(name, 'white')} color = {this.state[name] === 'white'?'secondary':'link'}>White</Button>
        <Button onClick = {this.handleChange(name, 'black')} color = {this.state[name] === 'black'?'secondary':'link'}>Black</Button>
      </div>
    }

}