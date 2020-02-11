import React from 'react'
import PGNLoader from './PGNLoader'
import SettingsView from './Settings'
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faList } from '@fortawesome/free-solid-svg-icons'

export default class ControlsContainer extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            lastMove: null,
            playerName:'',
            activeTab:'1',
            settings:{
              orientation:'white',
              playerColor:'white'
            }
          }
      }
    toggle(tab) {
        if(this.state.activeTab !== tab) {
            this.setState({activeTab:tab})
        }
    }

    render(){
        return <div>
            <Nav tabs>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === '1' })}
            onClick={() => { this.toggle('1'); }}
          >
            <FontAwesomeIcon icon={faUser} />
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === '2' })}
            onClick={() => { this.toggle('2'); }}
          >
            <FontAwesomeIcon icon={faList} />
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={this.state.activeTab}>
        <TabPane tabId="1">
          <Row>
            <Col sm="12">
            <div>{this.props.gamesProcessed>0?`Number of games Loaded: ${this.props.gamesProcessed}`:""}</div>
            <PGNLoader notify = {this.props.updateProcessedGames}/>
            <SettingsView onChange = {this.props.settingsChange}/>
            <div>
                <button onClick = {this.props.reset}>Reset</button>
                <button onClick = {this.props.clear}>Clear</button>
            </div>
            </Col></Row>
            </TabPane>
        <TabPane tabId="2">
          <Row>
            <Col sm="6">
              <Card body>
                <CardTitle>Special Title Treatment</CardTitle>
                <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
                <Button>Go somewhere</Button>
              </Card>
            </Col>
            <Col sm="6">
              <Card body>
                <CardTitle>Special Title Treatment</CardTitle>
                <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
                <Button>Go somewhere</Button>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </TabContent>
        </div>
    }
}