import SelectSearch from 'react-select-search';
import React from 'react'
import * as Constants from '../../app/Constants'
import { trackEvent } from '../../app/Analytics';
import { LazyLoadImage } from 'react-lazy-load-image-component';

export default class NotableChessGames extends React.Component {

    updateDetails = (value) => {
        trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "NotableGameSelected", value.value)
        this.props.onChange(value)
    }
    
    renderDetails(option) {
        return (<div>
                <span><LazyLoadImage alt={option.name} className="profilePicture" width="40" height="40" src={option.profile.imageUrl} /></span>
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
        return <SelectSearch
            name="goatPlayers"
            value={this.props.selectedDetail.value}
            options={options}
            placeholder={this.props.placeholder}
            renderOption={this.renderDetails}
            onChange={this.updateDetails}
        />
    }
}
