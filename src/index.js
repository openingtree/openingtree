import ReactDOM from 'react-dom'
import MainContainer from './pres/MainContainer'
import React from 'react'
import {trackPageView} from './app/Analytics'

ReactDOM.render(<MainContainer />, document.getElementById('root'))
trackPageView()