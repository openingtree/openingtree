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

export default class MovesSettings extends React.Component {
    constructor(props) {
        super(props)
        let mSettings = Object.assign({},this.props.settings.movesSettings)
        this.state={
            movesSettings: mSettings
        }
    }

    updateMoveSetting(key) {
        return (e, value) => {
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
            <ModalHeader toggle={this.cancel.bind(this)}>Opening book settings (Work in progress)</ModalHeader>
            <ModalBody>
                {this.getOpeningBookType()}
                {this.getOpeningBookRating()}
                {this.getOpeningBookTimeControls()}
            </ModalBody>
            <ModalHeader>Indicator settings</ModalHeader>
            <ModalBody>
                {this.getIndicatorSwitch("openingBookScoreIndicator", "Score Indicators")}
                {this.getIndicatorSwitch("openingBookColorIndicator", "Color Indicators")}
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

    getOpeningBookType() {
        return <div>Book type<br/><ToggleButtonGroup size="small" exclusive={true} value={this.state.movesSettings.openingBookType} onChange={this.updateMoveSetting('openingBookType')} aria-label="text formatting">
            <ToggleButton value="off" aria-label="bold">
                Off
            </ToggleButton>
            <ToggleButton value="masters" aria-label="bold">
                Masters
            </ToggleButton>
            <ToggleButton value="lichess" aria-label="bold">
                Lichess
            </ToggleButton>
        </ToggleButtonGroup></div>
    }
    getOpeningBookRating() {
        return <div>Rating<br/><ToggleButtonGroup size="small" value={this.state.movesSettings.openingBookRating} onChange={this.updateMoveSetting('openingBookRating')} aria-label="text formatting">
            <ToggleButton value="1600" aria-label="bold">
                1600
            </ToggleButton>
            <ToggleButton value="1800" aria-label="bold">
                1800
            </ToggleButton>
            <ToggleButton value="2000" aria-label="bold">
                2000
            </ToggleButton>
            <ToggleButton value="2200" aria-label="bold">
                2200
            </ToggleButton>
            <ToggleButton value="2500" aria-label="bold">
                2500
            </ToggleButton>
        </ToggleButtonGroup></div>
    }

    getOpeningBookTimeControls() {
        return <div>Time controls<br/><ToggleButtonGroup size="small" value={this.state.movesSettings.openingBookTimeControls} onChange={this.updateMoveSetting('openingBookRating')} aria-label="text formatting">
            <ToggleButton value="bullet" aria-label="bold">
            Bullet
            </ToggleButton>
            <ToggleButton value="blitz" aria-label="bold">
            Blitz
            </ToggleButton>
            <ToggleButton value="rapid" aria-label="bold">
            Rapid
            </ToggleButton>
            <ToggleButton value="classical" aria-label="bold">
            Classical
            </ToggleButton>
        </ToggleButtonGroup></div>
    }

}
