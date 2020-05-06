import React from 'react'
import {Button} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRetweet, faTrashAlt, faFastBackward, faDesktop } from '@fortawesome/free-solid-svg-icons'
import {Container, Row, Col} from 'reactstrap'
import {trackEvent} from '../app/Analytics'
import * as Constants from '../app/Constants'

export default class SettingsView extends React.Component {
    toggle(eventName){
        return (()=> {
            let newValue = this.props.settings[eventName] === Constants.PLAYER_COLOR_WHITE ? Constants.PLAYER_COLOR_BLACK:Constants.PLAYER_COLOR_WHITE
            this.props.onChange(eventName, newValue)
            trackEvent(Constants.EVENT_CATEGORY_CONTROLS, "ChangeOrientation")
        })
    }
    analyse() {
        window.open(`https://www.lichess.org/analysis/standard/${this.props.fen}`, '_blank');
        trackEvent(Constants.EVENT_CATEGORY_CONTROLS, "AnalyzeGame")

    }
    resetAction() {
        this.props.reset()
        trackEvent(Constants.EVENT_CATEGORY_CONTROLS, "Reset")
    }
    clearAction() {
        this.props.clear()
        trackEvent(Constants.EVENT_CATEGORY_CONTROLS, "Clear")
    }

    render() {
        return <div>
            <Container>
                <Row sm="12">
                    <Col sm="6">
                        <Button className="settingButton" onClick = {this.toggle('orientation')} color=""><h3><FontAwesomeIcon icon={faRetweet} /></h3> Flip board</Button>
                    </Col>
                    <Col sm="6">
                        <Button className="settingButton" onClick = {this.clearAction.bind(this)} color=""><h3><FontAwesomeIcon icon={faTrashAlt} /></h3> Clear games</Button>
                    </Col>
                    <Col sm="6">
                        <Button className="settingButton" onClick = {this.resetAction.bind(this)} color=""><h3><FontAwesomeIcon icon={faFastBackward} /></h3> Starting position</Button>
                    </Col>
                    <Col sm="6">
                        <Button className="settingButton" onClick = {this.analyse.bind(this)} color=""><h3><FontAwesomeIcon icon={faDesktop} /></h3> Computer analysis</Button>
                    </Col>
                </Row>
            </Container>
        </div>
    }
}