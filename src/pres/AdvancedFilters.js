import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';
import React from 'react'
import {Collapse, Container, Row, Col} from 'reactstrap'
import { FormControlLabel } from '@material-ui/core';
import * as Constants from '../app/Constants'
import {getTimeControlLabel} from './FilterLabels'
import * as Common from '../app/Common'

export default class AdvancedFilters extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentlyOpenAdvancedFilter:'',

        }
    }
    setCurrentlyOpenAdvancedFilter(filterName) {
        return () => {
            if(this.state.currentlyOpenAdvancedFilter === filterName) {
                //close if already open
                filterName = ''
            }
            this.setState({currentlyOpenAdvancedFilter:filterName})
        }
    }

    getFilters(site){
        return <div>
            {this.subSectionComponent('Rated', this.ratedLabel(), this.props.toggleRated)}
            {this.subSectionComponent('Time control', getTimeControlLabel(this.props.site, this.props.selectedTimeControls), 
                    this.setCurrentlyOpenAdvancedFilter('timeControl').bind(this),
                <Collapse isOpen={this.state.currentlyOpenAdvancedFilter === 'timeControl'}>
                    {this.getTimeControlFilters(site, 4)}
                </Collapse>
            )}
            {this.subSectionComponent('When played', this.whenPlayed(), 
                this.setCurrentlyOpenAdvancedFilter('whenPlayed').bind(this),
                <Collapse isOpen={this.state.currentlyOpenAdvancedFilter === 'whenPlayed'}>
                    Test1
                </Collapse>)}
            {this.subSectionComponent('Download limit', this.downloadLimit(), 
                this.setCurrentlyOpenAdvancedFilter('downloadLimit').bind(this),
                <Collapse isOpen={this.state.currentlyOpenAdvancedFilter === 'downloadLimit'}>
                    Test2
                </Collapse>)}
      </div>
    }
    ratedLabel() {
        if(this.props.rated === 'all') {
            return "Rated and casual"
        } else if (this.props.rated === 'rated') {
            return "Rated only"
        } else if (this.props.rated === 'casual') {
            return "Casual only"
        }
    }
    
    

    whenPlayed() {
        return "Anytime"
    }
    downloadLimit () {
        return "No limit"
    }
    getTimeControlFilters(site){
        let firstRow = null, middleRow = null, lastRow = null
        let colWidth = null
        if(site === 'lichess') {
            firstRow = [Constants.TIME_CONTROL_BULLET,
                        Constants.TIME_CONTROL_ULTRA_BULLET]
            middleRow = [Constants.TIME_CONTROL_BLITZ,
                        Constants.TIME_CONTROL_CLASSICAL]
            lastRow = [Constants.TIME_CONTROL_RAPID,
                        Constants.TIME_CONTROL_CORRESPONDENCE]
            colWidth = '4'
                    
        } else {
            firstRow = [Constants.TIME_CONTROL_BULLET,
                        Constants.TIME_CONTROL_BLITZ]
            lastRow = [Constants.TIME_CONTROL_RAPID, 
                        Constants.TIME_CONTROL_DAILY]
            colWidth = '6'
        }
        return <FormControl><FormGroup><Container>
            {this.getTimeControlFilterRow(firstRow,colWidth,'first')}
            {middleRow?this.getTimeControlFilterRow(middleRow,colWidth,'middle'):null}
            {this.getTimeControlFilterRow(lastRow,colWidth,'last')}
          </Container>
        </FormGroup></FormControl>
      
    }

    getTimeControlFilterRow(controls,firstColumnWidth, position){
        let clsName = 'topBottomNegativeMargin'
        if(position === "first") {
            clsName = 'bottomNegativeMargin'
        } else if (position === "last") {
            clsName = 'topNegativeMargin'
        } 
        return <Row className={clsName}>
            {controls.map((control) => 
            <Col sm={firstColumnWidth}>
                
            <FormControlLabel className = "nomargin"
                control={<Checkbox checked={this.props.selectedTimeControls[control]} color="primary" 
                onChange={this.props.handleTimeControlChange} name={control} />}
                label={Common.TIME_CONTROL_LABELS[control]}
          /></Col>)}</Row>
    }

    subSectionComponent(title, label, changeCallback, children) {
        return <div className="pgnloadersection">{title}: <span className="smallText">[<a href="#" onClick={changeCallback}>change</a>]</span>
        <div><b>{label}</b></div>{children}
        </div>
    }


    render() {
        return this.getFilters(this.props.site)
    }

}