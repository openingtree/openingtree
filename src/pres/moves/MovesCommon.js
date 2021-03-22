import React from 'react'
import { Card, CardBody, CardText, CardTitle } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle} from '@fortawesome/free-solid-svg-icons'
import { Button as MaterialUIButton } from '@material-ui/core'

export function playerDetails(name, elo) {
    return `${name}${elo?`(${elo})`:''}`
}

export function offCard(title, message, action, actionText, actionIcon) {
    return <Card className="errorCard">
               <CardBody className="singlePadding">
                   <CardTitle className="smallBottomMargin">
                       <FontAwesomeIcon icon={faInfoCircle}
                                        className="lowOpacity"/>
		       {' ' + title}
                   </CardTitle>
                   <CardText className="smallText">
                       {message}<br/><br/>
                       {actionText ?
                        <MaterialUIButton onClick={action}
                                          variant="contained"
                                          color="default"
                                          className="mainButton"
                                          disableElevation
                                          startIcon={actionIcon}>
                            {actionText}
                        </MaterialUIButton>
                        :
                        null}
                   </CardText>
               </CardBody>
           </Card>
}
