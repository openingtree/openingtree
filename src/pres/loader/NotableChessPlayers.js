import SelectSearch from 'react-select-search';
import React from 'react'


export default class NotableChessPlayers extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            selectedPlayer:{}
        }
    }
    updatePlayers = (value) => {
        this.setState({ selectedPlayer: value });
    }
    
    renderPlayer(option) {
        const imgStyle = {
            borderRadius: '50%',
            verticalAlign: 'middle',
            marginRight: 10,
            marginLeft: 3,
            float:"left"
        };
    
        return (<div>
                <img alt={option.name} style={imgStyle} width="40" height="40" src={option.profile.imageUrl} />
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
            value={this.state.selectedPlayer.value}
            options={options}
            placeholder="Select player"
            renderOption={this.renderPlayer.bind(this)}
            onChange={this.updatePlayers}
        />
    }
}
