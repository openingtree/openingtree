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
                <img alt="" style={imgStyle} width="40" height="40" src={option.photo} />
                <div>{option.name}</div>
                <div className="smallText">1945-2002</div>
                </div>);
    }

    render() {
        if(!this.props.players) {
            return <div className="lowOpacity textCenter"><img width='25' height='25' src="./spinner.gif"/> <span >Loading players</span></div>
        }
        return <SelectSearch
            name="goatPlayers"
            value={this.state.selectedPlayer.value}
            options={this.props.players}
            placeholder="Select player"
            renderOption={this.renderPlayer.bind(this)}
            onChange={this.updatePlayers}
        />
    }
}
