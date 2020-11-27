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

export default class MovesSettings extends React.Component {
    constructor(props) {
        super(props)
        let mSettings = Object.assign({},this.props.settings.movesSettings)
        mSettings.openingBookType = this.getTransformedBookType(mSettings.openingBookType)
        this.state={
            movesSettings: mSettings
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
    }

    set() {
        //reset to  new settings
        this.props.settingsChange('movesSettings', this.state.movesSettings)
        this.props.toggle()
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
                <div className="littlePaddingTop">{this.getIndicatorSwitch("openingBookWinsIndicator", "Book indicators")}</div>
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
        </ToggleButtonGroup></div>
    }

}
