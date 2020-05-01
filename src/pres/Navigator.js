import React from 'react'
import ChessEcoCodes from 'chess-eco-codes'
import OpeningManager from '../app/OpeningManager'
import {Container, Row, Col, Button} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStepForward, faStepBackward } from '@fortawesome/free-solid-svg-icons'
import * as Constants from '../app/Constants'
import {trackEvent} from '../app/Analytics'

export default class Navigator extends React.Component {
    
    constructor(props){
        super(props)
        this.openingManager = new OpeningManager()
        this.state = {
            currentMove:0,
          }      
          window.addEventListener("keydown",this.keyHandler.bind(this))
  
    }
    keyHandler(e){
        switch(e.keyCode) {
          case 37:
            this.previous(e, "keyboard")
          break
          case 39:
            this.next(e, "keyboard")
            break
          default:
            break

        }
      }
    
    shouldComponentUpdate(newProps) {
        //console.log(newProps)
        if(newProps.fen !== this.openingManager.fen()) {
            if(newProps.move === null) {
                this.openingManager = new OpeningManager()
                return true
            }
            this.openingManager.addPly(newProps.fen, newProps.move)
            return true
        }
        return true
    }

    previous(e, device) {
        let newState = this.openingManager.moveBack()
        this.props.onChange(newState.fen, newState.move)
        this.setState({currentMove:this.openingManager.currentMove()})
        trackEvent(Constants.EVENT_CATEGORY_NAVIGATOR, "Previous", device?device:"mouse")
    }

    next(e, device) {
        let newState = this.openingManager.moveForward()
        this.props.onChange(newState.fen, newState.move)
        this.setState({currentMove:this.openingManager.currentMove()})
        trackEvent(Constants.EVENT_CATEGORY_NAVIGATOR, "Next", device?device:"mouse")
    }

    moveTo(index) {
        return () => {
            let newState = this.openingManager.moveTo(index*2+1)
            this.props.onChange(newState.fen, newState.move)
            this.setState({currentMove:this.openingManager.currentMove()})
            trackEvent(Constants.EVENT_CATEGORY_NAVIGATOR, "move", null, index)
        }
    }

    render(){
        let opening = ChessEcoCodes(this.openingManager.fen())
        if (opening) {
            this.opening = opening.name
            this.openingCode = opening.code
        }
        if(!this.openingManager.pgnListSoFar()) {
            return <div></div>
        }
        return <Container>
            <Row>
            <Col lg="6" className="navSection"><Button color="" className= "settingButton" onClick= {this.previous.bind(this)}><FontAwesomeIcon icon={faStepBackward} /> prev</Button> </Col>
            <Col lg="6" className="navSection"><Button color="" className= "settingButton" onClick = {this.next.bind(this)}>next <FontAwesomeIcon icon={faStepForward} /></Button></Col></Row>
            <Row className="greyText">{this.openingCode}: {this.opening}</Row>
            {
                this.openingManager.pgnListSoFar().map((move, index)=>
                    <Row key={`${move.moveNumber}`} onClick={this.moveTo(index).bind(this)} className={`navCol ${this.openingManager.currentMove() === index? 'selectedMove':''}`}>
                        <Col sm="12" className = "navMove border">{`${move.moveNumber}. ${move.whitePly} ${move.blackPly}`}</Col>
                    </Row>)
            }
        </Container>
    }
}