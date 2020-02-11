import React from 'react'
import {Button} from 'reactstrap'
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
        <Button onClick = {this.handleChange('white')} color = {this.state.orientation === 'white'?'secondary':'link'}>White</Button>
        <Button onClick = {this.handleChange('black')} color = {this.state.orientation === 'black'?'secondary':'link'}>Black</Button>
        <Button onClick = {this.props.clear}>Clear</Button>
      </div>

        </div>
    }

    buttonGroup(name) {
        return <div>
        <Button onClick = {this.handleChange(name, 'white')} color = {this.state[name] === 'white'?'secondary':'link'}>White</Button>
        <Button onClick = {this.handleChange(name, 'black')} color = {this.state[name] === 'black'?'secondary':'link'}>Black</Button>
      </div>
    }

}