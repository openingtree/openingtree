import SelectSearch from 'react-select-search';
import React from 'react'


export default class NotableChessPlayers extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            selectedPlayer:{}
        }

        this.players = [
            { name: 'Annie Cruz', value: 'annie.cruz', photo: 'https://randomuser.me/api/portraits/women/60.jpg' },
            { name: 'Eli Shelton', disabled: true, value: 'eli.shelton', photo: 'https://randomuser.me/api/portraits/men/7.jpg' },
            { name: 'Loretta Rogers', value: 'loretta.rogers', photo: 'https://randomuser.me/api/portraits/women/51.jpg' },
            { name: 'Lloyd Fisher', value: 'lloyd.fisher', photo: 'https://randomuser.me/api/portraits/men/34.jpg' },
            { name: 'Tiffany Gonzales', value: 'tiffany.gonzales', photo: 'https://randomuser.me/api/portraits/women/71.jpg' },
            { name: 'Charles Hardy', value: 'charles.hardy', photo: 'https://randomuser.me/api/portraits/men/12.jpg' },
            { name: 'Rudolf Wilson', value: 'rudolf.wilson', photo: 'https://randomuser.me/api/portraits/men/40.jpg' },
            { name: 'Emerald Hensley', value: 'emerald.hensley', photo: 'https://randomuser.me/api/portraits/women/1.jpg' },
            { name: 'Lorena McCoy', value: 'lorena.mccoy', photo: 'https://randomuser.me/api/portraits/women/70.jpg' },
            { name: 'Alicia Lamb', value: 'alicia.lamb', photo: 'https://randomuser.me/api/portraits/women/22.jpg' },
            { name: 'Maria Waters', value: 'maria.waters', photo: 'https://randomuser.me/api/portraits/women/82.jpg' },
        ]
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
        return <SelectSearch
            name="goatPlayers"
            value={this.state.selectedPlayer.value}
            options={this.players}
            placeholder="Select player"
            renderOption={this.renderPlayer.bind(this)}
            onChange={this.updatePlayers}
        />
    }
}
