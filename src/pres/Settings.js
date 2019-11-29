import React from 'react'

export default class SettingsView extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            orientation:'white',
            playerColor:'white'
        }
    }

    handleChange(event){
        let target = event.target
        this.setState({
            [target.name]: target.checked ? 'black' : 'white'
        }, ()=> {
            this.props.onChange(this.state)
        })
    }
    render() {
        return <div><div>orientation black<input name = "orientation" type="checkbox" checked={this.state.orientation === 'black'} onChange={this.handleChange.bind(this)}/></div>
        <div>player color black<input name = "playerColor" type="checkbox" checked={this.state.playerColor === 'black'} onChange={this.handleChange.bind(this)}/></div></div>
    }
}