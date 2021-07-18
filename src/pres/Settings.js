import React from 'react';
import { Button, Col, Container, Row } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop, faFastBackward, faMoon, faLightbulb, faRetweet, faTrashAlt, faBookOpen } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import useSWR from 'swr';

import { trackEvent } from '../app/Analytics';
import * as Constants from '../app/Constants';

function OpeningTheory({openingManager}) {
    const lastMoveNumber = Math.ceil(openingManager.currentIndex / 2)

    const {data: url} = useSWR(openingManager.currentIndex > 0 ? `Chess Opening Theory/${openingManager.pgnListSoFar().slice(0, lastMoveNumber).map(({whitePly, blackPly, moveNumber}) => {
        const whitePart = `${moveNumber}. ${whitePly}`

        if (!blackPly || (moveNumber === lastMoveNumber && openingManager.currentIndex % 2 !== 0)) {
            return whitePart
        }

        const blackPart = `${moveNumber}...${blackPly}`

        return `${whitePart}/${blackPart}`
    }).join("/")}` : "Chess Opening Theory", async title => {
        const {
            data: {
                query: {
                    pages
                }
            }
        } = await axios("https://en.wikibooks.org/w/api.php", {
            params: {
                action: "query",
                prop: "info",
                inprop: "url",
                format: "json",
                titles: title,
                origin: "*",
            }
        })

        return !pages[-1] && `https://en.wikibooks.org/wiki/${title.replace(/ /g, "_")}`
    })

    return <Col xs="4">
        <Button className="settingButton" onClick={() => {
            window.open(url, '_blank');
            trackEvent(Constants.EVENT_CATEGORY_CONTROLS, "OpenTheory")
        }} color="" disabled={!url}>
            <h3>
                <FontAwesomeIcon icon={faBookOpen} />
            </h3>
            <span>
                Opening theory
            </span>
        </Button>
    </Col>
}

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
                    <OpeningTheory openingManager={this.props.openingManager} />
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