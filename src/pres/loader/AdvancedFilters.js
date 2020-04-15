import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';
import React from 'react'
import {Collapse, Container, Row, Col} from 'reactstrap'
import { FormControlLabel,Slider } from '@material-ui/core';
import * as Constants from '../../app/Constants'
import {getTimeControlLabel, getELORangeLabel, getRatedLabel, getWhenPlayedLabel, getDownloadLimitLabel} from './FilterLabels'
import * as Common from '../../app/Common'
import {trackEvent} from '../../app/Analytics'

export default class AdvancedFilters extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentlyOpenAdvancedFilter:'',
        }
        this.timeframeMarks=[
            {
                value:0,
                label:"Big bang"
            }, {
                value:props.timeframeSteps.length-1,
                label:"Now"
            }]
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
            {this.subSectionComponent('When played', getWhenPlayedLabel(this.props.advancedFilters[Constants.FILTER_NAME_SELECTED_TIMEFRAME], this.props.timeframeSteps), 
                this.setCurrentlyOpenAdvancedFilter('whenPlayed').bind(this),
                <Collapse isOpen={this.state.currentlyOpenAdvancedFilter === 'whenPlayed'}>
                    {this.getTimeFrameFilters()}
                </Collapse>)}
            {this.subSectionComponent('Opponent elo range', getELORangeLabel(this.props.advancedFilters[Constants.FILTER_NAME_ELO_RANGE]), 
                this.setCurrentlyOpenAdvancedFilter('eloRange').bind(this),
                <Collapse isOpen={this.state.currentlyOpenAdvancedFilter === 'eloRange'}>
                    {this.getEloRangeFilters()}
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

    getTimeFrameFilters() {
        return <Slider className = "sliderCustom"
            value={this.props.advancedFilters[Constants.FILTER_NAME_SELECTED_TIMEFRAME]}
            onChange={this.props.handleTimeframeChange}
            valueLabelDisplay="off"
            valueLabelFormat={(val)=>this.props.timeframeSteps[val].label}
            step={1}
            marks={this.timeframeMarks}
            min={0}
            max={this.props.timeframeSteps.length-1}
        />
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
            <Col sm={firstColumnWidth} key={`ctrl${control}`}>
                
            <FormControlLabel className = "nomargin"
                control={<Checkbox checked={this.props.advancedFilters[control]} color="primary" 
                onChange={this.props.handleTimeControlChange} name={control} />}
                label={Common.TIME_CONTROL_LABELS[control]}
          /></Col>)}</Row>
    }

    subSectionComponent(title, label, changeCallback, children) {
        return <div className="pgnloadersection">{title}: <span className="smallText">[<span className="linkStyle" onClick={changeCallback}>change</span>]</span>
        <div><b>{label}</b></div>{children}
        </div>
    }


    render() {
        return this.getFilters(this.props.site)
    }

}