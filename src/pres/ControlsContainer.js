import React from 'react'
import PGNLoader from './PGNLoader'
import SettingsView from './Settings'
import { TabContent, TabPane, Nav, NavItem, NavLink, Row, Col } from 'reactstrap';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faList, faCog } from '@fortawesome/free-solid-svg-icons'
import MovesList from './MovesList';

export default class ControlsContainer extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            activeTab:'user',
            
          }
      }
    toggle(tab) {
        if(this.state.activeTab !== tab) {
            this.setState({activeTab:tab})
        }
    }
    switchToUserTab() {
      this.toggle('user')
    }
    switchToMovesTab() {
      this.toggle('moves')
    }

    render(){
        return <div>
            <Nav tabs>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === 'user' })}
            onClick={() => { this.toggle('user'); }}
          >
            <FontAwesomeIcon icon={faUser} /> User
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === 'moves' })}
            onClick={() => { this.toggle('moves'); }}
          >
            <FontAwesomeIcon icon={faList} /> Moves
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === 'settings' })}
            onClick={() => { this.toggle('settings'); }}
          >
            <FontAwesomeIcon icon={faCog} /> Controls
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={this.state.activeTab}>
        <TabPane tabId="user">
            <PGNLoader 
              switchToMovesTab={this.switchToMovesTab.bind(this)} 
              clear = {this.props.clear} 
              gamesProcessed = {this.props.gamesProcessed} 
              settings = {this.props.settings} 
              onChange = {this.props.settingsChange} 
              notify = {this.props.updateProcessedGames}
              showError = {this.props.showError}
              setDownloading = {this.props.setDownloading}
              isDownloading = {this.props.isDownloading}
              />
            </TabPane>
        <TabPane tabId="moves">
            <MovesList 
              switchToUserTab={this.switchToUserTab.bind(this)} 
              movesToShow={this.props.movesToShow} 
              gameResults={this.props.gameResults}
              onMove={this.props.onMove}
              settings={this.props.settings}
              turnColor={this.props.turnColor}
              settingsChange={this.props.settingsChange}
              />
        </TabPane>
        <TabPane tabId="settings">
          <Row>
            <Col sm="6">
            <SettingsView fen={this.props.fen} settings={this.props.settings} clear = {this.props.clear} reset = {this.props.reset} onChange = {this.props.settingsChange}/>
            
            </Col>
          </Row>
        </TabPane>
      </TabContent>
        </div>
    }
}