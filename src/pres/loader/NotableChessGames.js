import SelectSearch from 'react-select-search';
import React from 'react'
import * as Constants from '../../app/Constants'
import { trackEvent } from '../../app/Analytics';

export default class NotableChessGames extends React.Component {

    updateDetails = (value) => {
        if(!value.length) {
            return
        }
        trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "NotableGameSelected", value[value.length-1].value)
        this.props.onChange(value[value.length-1])
    }
    
    renderDetails(option) {
        return (<div>
                <img alt={option.name} className="profilePicture" width="40" height="40" src={option.profile.imageUrl} />
                <div>{option.name}</div>
                <div className="smallText">{option.profile.subText}</div>
                </div>);
    }
    render() {
        if(!this.props.list) {
            return <div className="lowOpacity textCenter"><img alt="loading" width='25' height='25' src="./spinner.gif"/> Loading List</div>
        } else if(!this.props.list.length) {
            return <div className="lowOpacity textCenter"> Could not fetch list</div>
        }
        let options = this.props.list.map(option=>{return {...option, value:option.name}})
        return <SelectSearch multiple
            name="goatPlayers"
            value={this.props.selectedDetail?[this.props.selectedDetail.value]:null}
            options={options}
            placeholder={this.props.placeholder}
            renderOption={this.renderDetails}
            onChange={this.updateDetails}
        />
    }
}
