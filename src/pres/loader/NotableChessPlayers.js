import SelectSearch from 'react-select-search';
import React from 'react'


export default class NotableChessPlayers extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            selectedfriends:[],
            friends: [
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
    }



    render() {
        return <SelectSearch
        name="friends"
        multiple
        className="select-search-box select-search-box--friends select-search-box--multiple"
        value={this.state.selectedfriends}
        onChange={this.updateFriends}
        options={this.state.friends}
        placeholder="Search friends"
        renderOption={renderFriend}
        disabled={this.state.disabled}
        search
    />
    }
}

function renderFriend(props, option, snapshot, className) {
    const imgStyle = {
        borderRadius: '50%',
        verticalAlign: 'middle',
        marginRight: 10,
    };

    return (
        <button {...props} className={className} type="button">
            <span><img alt="" style={imgStyle} width="32" height="32" src={option.photo} /><span>{option.name}</span></span>
        </button>
    );
}