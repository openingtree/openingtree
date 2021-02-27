import React from 'react';
import { Button, Col, Container, Row } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop, faFastBackward, faMoon, faLightbulb, faRetweet, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import { trackEvent } from '../app/Analytics';
import * as Constants from '../app/Constants';

export default class SettingsView extends React.Component {
    constructor(props){
        super(props)
        window.addEventListener("keydown",this.keyHandler.bind(this))
    }

    keyHandler(e){
        if (e.srcElement && e.srcElement.tagName === 'INPUT') {
            return;
        }

        switch(e.keyCode) {
            case 70: // F key
                this.toggle(Constants.SETTING_NAME_ORIENTATION)();
                break;
            default:
                break;
        }
    }

    toggle(eventName) {
        return (() => {
            let newValue;
            switch (eventName) {
                case Constants.SETTING_NAME_ORIENTATION:
                    newValue = this.props.settings[eventName] === Constants.PLAYER_COLOR_WHITE
                        ? Constants.PLAYER_COLOR_BLACK
                        : Constants.PLAYER_COLOR_WHITE;
                    trackEvent(Constants.EVENT_CATEGORY_CONTROLS, "ChangeOrientation")
                    break;
                case Constants.SETTING_NAME_DARK_MODE:
                    newValue = !this.props.settings[eventName];
                    trackEvent(Constants.EVENT_CATEGORY_CONTROLS, "DarkMode");
                    break;
                default:
                    break;
            }
            this.props.onChange(eventName, newValue);
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
                <Row>
                    <Col xs="4">
                        <Button className="settingButton" onClick = {this.toggle(Constants.SETTING_NAME_ORIENTATION)} color="">
                            <h3>
                                <FontAwesomeIcon icon={faRetweet} />
                            </h3>
                            <span>
                                Flip board
                            </span>
                        </Button>
                    </Col>
                    <Col xs="4">
                        <Button className="settingButton" onClick = {this.clearAction.bind(this)} color="">
                            <h3>
                                <FontAwesomeIcon icon={faTrashAlt} />
                            </h3>
                            <span>
                                Clear games
                            </span>
                        </Button>
                    </Col>
                    <Col xs="4">
                        <Button className="settingButton" onClick = {this.resetAction.bind(this)} color="">
                            <h3>
                                <FontAwesomeIcon icon={faFastBackward} />
                            </h3>
                            <span>
                                Starting position
                            </span>
                        </Button>
                    </Col>
                    <Col xs="4">
                        <Button className="settingButton" onClick = {this.analyse.bind(this)} color="">
                            <h3>
                                <FontAwesomeIcon icon={faDesktop} />
                            </h3>
                            <span>
                                Computer analysis
                            </span>
                        </Button>
                    </Col>
                    <Col xs="4">
                        <Button className="settingButton" onClick={this.toggle(Constants.SETTING_NAME_DARK_MODE)} color="">
                            <h3>
                                <FontAwesomeIcon icon={this.props.settings.darkMode?faLightbulb:faMoon} />
                            </h3>
                            <span>
                                {this.props.settings.darkMode?"Light mode":"Dark mode"}
                            </span>
                        </Button>
                    </Col>
                </Row>
            </Container>
        </div>
    }
}