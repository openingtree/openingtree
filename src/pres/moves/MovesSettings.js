import React from 'react'
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button
} from 'reactstrap'
import Switch from '@material-ui/core/Switch';
import {
    FormControlLabel
} from '@material-ui/core'
import {
    ToggleButtonGroup,
    ToggleButton
} from '@material-ui/lab'
import * as Constants from '../../app/Constants'
import { Collapse, CardBody, Card, CardText } from 'reactstrap';
import Link from '@material-ui/core/Link'
import {trackEvent} from '../../app/Analytics'

export default class MovesSettings extends React.Component {
    constructor(props) {
        super(props)
        let mSettings = Object.assign({},this.props.settings.movesSettings)
        mSettings.openingBookType = this.getTransformedBookType(mSettings.openingBookType)
        this.state={
            movesSettings: mSettings,
            indicatorInfoOpen:false
        }
    }

    updateMoveSetting(key) {
        return (e, value) => {
            if(Array.isArray(value) && value.length <1) {
                return
            }
            let newMovesSettings = Object.assign({},this.state.movesSettings)
            newMovesSettings[key] = value
            this.setState({
                movesSettings:newMovesSettings
            })
        }
    }

    cancel() {
        //reset to original settings
        this.setState({movesSettings: this.props.settings.movesSettings})
        this.props.toggle()
        trackEvent(Constants.EVENT_CATEGORY_SETTINGS, "MoveSettingsCancel")
    }

    set() {
        //reset to  new settings
        this.props.settingsChange(Constants.SETTING_NAME_MOVES_SETTINGS, this.state.movesSettings)
        this.props.toggle()
        trackEvent(Constants.EVENT_CATEGORY_SETTINGS, "MoveSettingsSet")
    }

    toggleIndicatorInfo(e) {
        this.setState({indicatorInfoOpen:!this.state.indicatorInfoOpen})
        if(!this.state.indicatorInfoOpen) {
            trackEvent(Constants.EVENT_CATEGORY_SETTINGS, "MoveSettingsIndicatorInfo")
        }
    }

    render() {
        return <Modal isOpen={this.props.isOpen} toggle={this.cancel.bind(this)}>
            <ModalHeader toggle={this.cancel.bind(this)}>Opening book settings</ModalHeader>
            <ModalBody>
                <div className="littlePaddingTop">{this.getOpeningBookType()}</div>
                {this.state.movesSettings.openingBookType === Constants.OPENING_BOOK_TYPE_LICHESS?
                <div className="littlePaddingTop">{this.getOpeningBookRating()}</div>
                :null}   
                {this.state.movesSettings.openingBookType === Constants.OPENING_BOOK_TYPE_LICHESS?
                <div className="littlePaddingTop">{this.getOpeningBookTimeControls()}</div>
                :null}   
                <div className="littlePaddingTop">{this.getIndicatorSwitch("openingBookWinsIndicator", <span>Book indicators <Link href="#" className="smallText" onClick={this.toggleIndicatorInfo.bind(this)}>whats this?</Link></span>)}</div>
                <Collapse isOpen={this.state.indicatorInfoOpen}>
                <Card>
                    <CardBody className="singlePadding">
                    <img src="./images/bookIndicator.png" alt="bookIndicator"/>
                    <CardText className="smallText">
                        Little triangles indicate the openingbook statistics on the moves tab and the player 
                        statistics on the openingbook tab. <br/>Everything left of the white triangle is a win for white, 
                        everything right of the black triangle is a win for black and everything in the middle is a draw.<br/>
                        If there is only a black triangle and no white, it means there are no draws.</CardText>
                    </CardBody>
                    </Card>
                </Collapse>
            </ModalBody>
            <ModalFooter>
            <Button color="link" onClick={this.cancel.bind(this)}>Cancel</Button>
            <Button color="primary" onClick={this.set.bind(this)}>Set</Button>

            </ModalFooter>
        </Modal>
    }

    getIndicatorSwitch(name, label) {
        return <div><FormControlLabel
            control={
                <Switch
                    checked={this.state.movesSettings[name]}
                    name={name}
                    color="primary"
                />
            }
            onChange={this.updateMoveSetting(name)}
            label={label}
      /></div>
    }

    mastersBookAvailable() {
        // masters book is only available for standard mode
        return this.props.variant === Constants.VARIANT_STANDARD
    }

    getTransformedBookType(value){
        //if masters book is not available, use lichess book
        if(value === Constants.OPENING_BOOK_TYPE_MASTERS
            && !this.mastersBookAvailable()) {
            return Constants.OPENING_BOOK_TYPE_LICHESS
        }
        return value
    }

    getOpeningBookType() {
        return <div>Book type<br/><ToggleButtonGroup size="small" exclusive={true} value={this.getTransformedBookType(this.state.movesSettings.openingBookType)} onChange={this.updateMoveSetting('openingBookType')} aria-label="book type">
            <ToggleButton value={Constants.OPENING_BOOK_TYPE_OFF} aria-label={Constants.OPENING_BOOK_TYPE_OFF}>
                Off
            </ToggleButton> {
                this.mastersBookAvailable()?
                <ToggleButton value={Constants.OPENING_BOOK_TYPE_MASTERS} aria-label={Constants.OPENING_BOOK_TYPE_MASTERS}>
                    Masters
                </ToggleButton>
                :null
            }
            <ToggleButton value={Constants.OPENING_BOOK_TYPE_LICHESS} aria-label={Constants.OPENING_BOOK_TYPE_LICHESS}>
                Lichess
            </ToggleButton>
        </ToggleButtonGroup></div>
    }
    getOpeningBookRating() {
        return <div>Rating<br/><ToggleButtonGroup size="small" value={this.state.movesSettings.openingBookRating} onChange={this.updateMoveSetting('openingBookRating')} aria-label="text formatting">
            <ToggleButton value="1600" aria-label="1600">
                1600
            </ToggleButton>
            <ToggleButton value="1800" aria-label="1800">
                1800
            </ToggleButton>
            <ToggleButton value="2000" aria-label="2000">
                2000
            </ToggleButton>
            <ToggleButton value="2200" aria-label="2200">
                2200
            </ToggleButton>
            <ToggleButton value="2500" aria-label="2500">
                2500
            </ToggleButton>
        </ToggleButtonGroup></div>
    }

    getOpeningBookTimeControls() {
        return <div>Time controls<br/><ToggleButtonGroup size="small" value={this.state.movesSettings.openingBookTimeControls} onChange={this.updateMoveSetting('openingBookTimeControls')} aria-label="text formatting">
            <ToggleButton value="bullet" aria-label="bullet">
            Bullet
            </ToggleButton>
            <ToggleButton value="blitz" aria-label="blitz">
            Blitz
            </ToggleButton>
            <ToggleButton value="rapid" aria-label="rapid">
            Rapid
            </ToggleButton>
            <ToggleButton value="classical" aria-label="classical">
            Classical
            </ToggleButton>
            <ToggleButton value="correspondence" aria-label="correspondence">
            Correspondence
            </ToggleButton>
        </ToggleButtonGroup></div>
    }

}
