import React from 'react'
import PGNLoader from './PGNLoader'
import SettingsView from './Settings'
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faList, faLightbulb, faCog } from '@fortawesome/free-solid-svg-icons'
import MovesList from './MovesList';

export default class ControlsContainer extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            activeTab:'1',
            
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
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === '3' })}
            onClick={() => { this.toggle('3'); }}
          >
            <FontAwesomeIcon icon={faLightbulb} /> 
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === '4' })}
            onClick={() => { this.toggle('4'); }}
          >
            <FontAwesomeIcon icon={faCog} /> 
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={this.state.activeTab}>
        <TabPane tabId="1">
            <PGNLoader clear = {this.props.clear} gamesProcessed = {this.props.gamesProcessed} settings = {this.props.settings} onChange = {this.props.settingsChange} notify = {this.props.updateProcessedGames}/>
            </TabPane>
        <TabPane tabId="2">
            <MovesList movesToShow={this.props.movesToShow} onMove={this.props.onMove}/>
        </TabPane>
        <TabPane tabId="4">
          <Row>
            <Col sm="6">
            <SettingsView settings={this.props.settings} clear = {this.props.clear} reset = {this.props.reset} onChange = {this.props.settingsChange}/>
            
            </Col>
          </Row>
        </TabPane>
      </TabContent>
        </div>
    }
}