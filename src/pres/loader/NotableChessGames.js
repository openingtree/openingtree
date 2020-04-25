import SelectSearch from 'react-select-search';
import React from 'react'


export default class NotableChessGames extends React.Component {

    constructor(props) {
        super(props)
        
    }
    updatePlayers = (value) => {
        this.props.onChange(value)
    }
    
    renderPlayer(option) {
        return (<div>
                <img alt={option.name} className="profilePicture" width="40" height="40" src={option.profile.imageUrl} />
                <div>{option.name}</div>
                <div className="smallText">{option.profile.birthYear}-{option.profile.deathYear}</div>
                </div>);
    }
    render() {
        if(!this.props.players) {
            return <div className="lowOpacity textCenter"><img width='25' height='25' src="./spinner.gif"/> Loading players</div>
        } else if(!this.props.players.length) {
            return <div className="lowOpacity textCenter"> Could not fetch player list</div>
        }
        let options = this.props.players.map(option=>{return {...option, value:option.name}})
        return <SelectSearch
            name="goatPlayers"
            value={this.props.selectedPlayer.value}
            options={options}
            placeholder={this.props.placeholder}
            renderOption={this.renderPlayer}
            onChange={this.updatePlayers}
        />
    }
}
