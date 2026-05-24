import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';
import React from 'react'
import {Collapse, Container, Row, Col, Badge} from 'reactstrap'
import { FormControlLabel,Slider } from '@material-ui/core';
import * as Constants from '../../app/Constants'
import {getTimeControlLabel, getELORangeLabel, getRatedLabel, 
    getDownloadLimitLabel, opponentNameLabel, getFromDateLabel, getToDateLabel, getOutcomesLabel } from './FilterLabels'
import * as Common from '../../app/Common'
import { trackEvent } from '../../app/Analytics'
import { TextField } from '@material-ui/core'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";

export default class AdvancedFilters extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentlyOpenAdvancedFilter:'',
        }
        this.downloadLimitMarks=[
            {
                value:0,
                label:"0"
            }, {
                value:Constants.MAX_DOWNLOAD_LIMIT,
                label:`No limit`
            }]
        this.eloRangeMarks=[
            {
                value:0,
                label:"0"
            }, {
                value:Constants.MAX_ELO_RATING,
                label:`No limit`
            }]
    
    }
    setCurrentlyOpenAdvancedFilter(filterName) {
        return () => {
            if(this.state.currentlyOpenAdvancedFilter === filterName) {
                //close if already open
                filterName = ''
            }
            this.setState({currentlyOpenAdvancedFilter:filterName})
            trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "AdvancedFilterChange", filterName)
        }
    }

    getFilters(site){
        return <div>
            {this.subSectionComponent('Mode', getRatedLabel(this.props.advancedFilters.rated), this.props.toggleRated)}
            {this.subSectionComponent('Time control', getTimeControlLabel(this.props.site, this.props.advancedFilters), 
                    this.setCurrentlyOpenAdvancedFilter('timeControl').bind(this),
                <Collapse isOpen={this.state.currentlyOpenAdvancedFilter === 'timeControl'}>
                    {this.getTimeControlFilters(site, 4)}
                </Collapse>
            )}
            {this.subSectionComponent('From Date', getFromDateLabel(this.props.advancedFilters[Constants.FILTER_NAME_FROM_DATE]), 
                this.setCurrentlyOpenAdvancedFilter('fromDate').bind(this),
                <Collapse isOpen={this.state.currentlyOpenAdvancedFilter === 'fromDate'}>
                    {this.getFromDateFilter()}
                </Collapse>, true)}
            {this.subSectionComponent('To Date', getToDateLabel(this.props.advancedFilters[Constants.FILTER_NAME_TO_DATE]), 
            this.setCurrentlyOpenAdvancedFilter('toDate').bind(this),
            <Collapse isOpen={this.state.currentlyOpenAdvancedFilter === 'toDate'}>
                {this.getToDateFilter()}
            </Collapse>, true)}

            {this.subSectionComponent('Opponent rating range', getELORangeLabel(this.props.advancedFilters[Constants.FILTER_NAME_ELO_RANGE]), 
                this.setCurrentlyOpenAdvancedFilter('eloRange').bind(this),
                <Collapse isOpen={this.state.currentlyOpenAdvancedFilter === 'eloRange'}>
                    {this.getEloRangeFilters()}
                </Collapse>)}
            {this.subSectionComponent('Opponent name', opponentNameLabel(this.props.advancedFilters[Constants.FILTER_NAME_OPPONENT]), 
                this.setCurrentlyOpenAdvancedFilter('opponent').bind(this),
                <Collapse isOpen={this.state.currentlyOpenAdvancedFilter === 'opponent'}>
                    {this.getOpponentNameFilter()}
                </Collapse>, true)}
            {this.subSectionComponent('Game outcome', getOutcomesLabel(this.props.advancedFilters),
                this.setCurrentlyOpenAdvancedFilter(Constants.FILTER_OUTCOME).bind(this),
                <Collapse isOpen={this.state.currentlyOpenAdvancedFilter === Constants.FILTER_OUTCOME}>
                    {this.getOutcomeFilters()}
                </Collapse>)}
            {this.subSectionComponent('Download limit', getDownloadLimitLabel(this.props.advancedFilters[Constants.FILTER_NAME_DOWNLOAD_LIMIT]), 
                this.setCurrentlyOpenAdvancedFilter('downloadLimit').bind(this),
                <Collapse isOpen={this.state.currentlyOpenAdvancedFilter === 'downloadLimit'}>
                    {this.getDownloadLimitFilters()}
                </Collapse>)}
      </div>
    }

    getDownloadLimitFilters() {
        return <Slider className = "sliderCustom"
            value={this.props.advancedFilters[Constants.FILTER_NAME_DOWNLOAD_LIMIT]}
            onChange={this.props.handleDownloadLimitChange}
            valueLabelDisplay="auto"
            valueLabelFormat={(val)=>val>=Constants.MAX_DOWNLOAD_LIMIT?"All":val}
            step={100}
            min={0}
            marks={this.downloadLimitMarks}
            max={Constants.MAX_DOWNLOAD_LIMIT}
        />
    }
    getFromDateFilter() {
        return <DatePicker placeholderText = "mm/dd/yyyy" selected={this.props.advancedFilters[Constants.FILTER_NAME_FROM_DATE]}
                            onChange={this.props.handleFromDate}/>
    }
    getToDateFilter() {
        return <DatePicker placeholderText = "mm/dd/yyyy" selected={this.props.advancedFilters[Constants.FILTER_NAME_TO_DATE]}
                            onChange={this.props.handleToDate}/>
    }

    getEloRangeFilters() {
        return <Slider className = "sliderCustom"
            value={this.props.advancedFilters[Constants.FILTER_NAME_ELO_RANGE]}
            onChange={this.props.handleEloRangeChange}
            valueLabelDisplay="off"
            marks={this.eloRangeMarks}
            min={0}
            max={Constants.MAX_ELO_RATING}
        />
    }
    getOpponentNameFilter() {
        return <TextField
            className="playernameField" name="opponentName" id="opponentNameTextBox" 
            margin="dense" onChange={this.props.handleOpponentNameChange}
            label={"Opponent Name"} variant="outlined" value={this.props.advancedFilters[Constants.FILTER_NAME_OPPONENT]}/>
    }

    getOutcomeFilters() {
        let row = [Constants.OUTCOME_DRAW,
            Constants.OUTCOME_LOSE, Constants.OUTCOME_WIN]
        let colWidth = '3'
        return <FormControl>
            <FormGroup>
                <Container>
                    {this.getFilterRow(row, colWidth, 'first', Common.OUTCOME_LABELS)}
                </Container>
            </FormGroup>
        </FormControl>
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
            {this.getFilterRow(firstRow,colWidth,'first', Common.TIME_CONTROL_LABELS)}
            {middleRow?this.getFilterRow(middleRow,colWidth,'middle', Common.TIME_CONTROL_LABELS):null}
            {this.getFilterRow(lastRow,colWidth,'last', Common.TIME_CONTROL_LABELS)}
          </Container>
        </FormGroup></FormControl>
      
    }

    getFilterRow(controls,firstColumnWidth, position, labels){
        let clsName = 'topBottomNegativeMargin'
        if(position === "first") {
            clsName = 'bottomNegativeMargin'
        } else if (position === "last") {
            clsName = 'topNegativeMargin'
        } 
        return <Row className={clsName}>
            {controls.map((control) => 
            <Col sm={firstColumnWidth} key={`ctrl${control}`}>
                
            <FormControlLabel className = "nomargin"
                control={<Checkbox checked={this.props.advancedFilters[control]} color="primary" 
                onChange={this.props.handleRootLevelChange} name={control} />}
                label={labels[control]}
          /></Col>)}</Row>
    }

    subSectionComponent(title, label, changeCallback, children, newBadge) {
        return <div className="pgnloadersection">{title}: <span className="smallText">[<span className="linkStyle" onClick={changeCallback}>change</span>]</span> {newBadge?<Badge className="sourceName" color="info">New!</Badge>:null}
            <div><b>{label}</b></div>{children}
            </div>
    }


    render() {
        return this.getFilters(this.props.site)
    }

}