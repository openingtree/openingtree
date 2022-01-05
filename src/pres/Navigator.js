import React from 'react'
import {Container, Row, Col, Button} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStepForward, faStepBackward } from '@fortawesome/free-solid-svg-icons'
import * as Constants from '../app/Constants'
import {trackEvent} from '../app/Analytics'

export default class Navigator extends React.Component {

    constructor(props){
        super(props)
        window.addEventListener("keydown",this.keyHandler.bind(this))
    }

    movePairs() {
        var idx = 0
        var pairs = []

        if (this.props.moves[idx].color === 'b') {
            // null first move for white
            pairs.push([undefined, this.props.moves[idx]])
            idx += 1
        }

        while (idx < this.props.moves.length) {
            pairs.push([this.props.moves[idx], this.props.moves[idx + 1]])
            idx += 2
        }

        return pairs
    }

    keyHandler(e){
        switch(e.keyCode) {
            case 37:
                this.previous(e, "keyboard");
                break
            case 39:
                this.next(e, "keyboard")
                break
            default:
                break
        }
    }

    // TODO: Put scroll handler behind setting
    // scrollHandler(e) {
    //     e.preventDefault();

    //     if (e.deltaY > 0) {
    //         this.next(e, "wheel");
    //     }

    //     else if (e.deltaY < 0) {
    //         this.previous(e, "wheel");
    //     }
    // }

    previous(e, device) {
        this.props.navigateToMove(this.props.ply - 1)
        trackEvent(Constants.EVENT_CATEGORY_NAVIGATOR, "Previous", device || "mouse")
    }

    next(e, device) {
        this.props.navigateToMove(this.props.ply + 1)
        trackEvent(Constants.EVENT_CATEGORY_NAVIGATOR, "Next", device || "mouse")
    }

    moveTo(ply) {
        this.props.navigateToMove(ply)
        trackEvent(Constants.EVENT_CATEGORY_NAVIGATOR, "move", null, ply)
    }

    render(){
        if (this.props.moves.length === 0) {
            return <div></div>
        }
        return (
            <Container id="navigator">
                <Row>
                    <Col lg="6" className="navSection">
                        <Button color="" onClick={this.previous.bind(this)}>
                            <FontAwesomeIcon icon={faStepBackward} />&nbsp;
                            <span>prev</span>
                        </Button>
                    </Col>
                    <Col lg="6" className="navSection">
                        <Button color="" onClick={this.next.bind(this)}>
                            <span>next</span>&nbsp;
                            <FontAwesomeIcon icon={faStepForward} />
                        </Button>
                    </Col>
                </Row>
                { this.renderOpening() }
                {
                    this.movePairs().map((pair, idx) => this.renderMovePair(idx + 1, pair))
                }
            </Container>
        )
    }

    renderOpening() {
        if (this.props.opening === undefined) {
            return <></>
        }
        return (
            <Row className="greyText">
                {this.props.opening.code}: {this.props.opening.name}
            </Row>
        )
    }

    renderMovePair(idx, pair) {
        let [white, black] = pair
        return (
            <Row key={`${idx}`} className="navCol">
                <Col sm="2" className="navItem navMoveNumber">
                    {`${idx}.`}
                </Col>
                { this.renderMoveColumn(white) }
                { this.renderMoveColumn(black) }
            </Row>
        )
    }

    renderMoveColumn(move) {
        var style = `navItem navMove border`
        if (move === undefined) {
            return <Col sm="5" className={style}></Col>
        }

        if (move.ply === this.props.ply) {
            style += ' selectedMove'
        }

        return (
            <Col sm="5" className={style} onClick={() => this.moveTo(move.ply)}>
                {move.san}
            </Col>
        )
    }

    // TODO: Put scroll handler behind setting
    // componentDidUpdate () {
    //     const chessBoard = document.querySelector('cg-board');
    //     const navigator = document.querySelector('#navigator');

    //     if (chessBoard) chessBoard.onwheel = this.scrollHandler.bind(this);
    //     if (navigator) navigator.onwheel = this.scrollHandler.bind(this);
    // }
}
