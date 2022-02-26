import React from 'react';
import {Button, Col} from 'reactstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBookOpen} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import {trackEvent} from '../app/Analytics';
import * as Constants from '../app/Constants';

const composeGoogleQuery = query => `https://www.google.com/search?q=${query.replace(/ /g, "+")}`
const composeWikibooksUrl = title => `https://en.wikibooks.org/wiki/${title.replace(/ /g, "_")}`

async function getOpeningBookUrl(openingManager) {
	if (openingManager.currentIndex === 0) {
		return composeWikibooksUrl("Chess Opening Theory")
	}

	const lastMoveNumber = Math.ceil(openingManager.currentIndex / 2)
	const moves = openingManager.pgnListSoFar().slice(0, lastMoveNumber)

	const wikibooksTitle = `Chess Opening Theory/${moves.map(({whitePly, blackPly, moveNumber}) => {
		const whitePart = `${moveNumber}. ${whitePly}`

		if (!blackPly || (moveNumber === lastMoveNumber && openingManager.currentIndex % 2 !== 0)) {
			return whitePart
		}

		const blackPart = `${moveNumber}...${blackPly}`

		return `${whitePart}/${blackPart}`
	}).join("/")}`

	try {
		const {
			data: {
				query: {
					pages
				}
			}
		} = await axios('https://en.wikibooks.org/w/api.php', {
			params: {
				action: "query",
				prop: "info",
				inprop: "url",
				format: "json",
				titles: wikibooksTitle,
				origin: "*",
			}
		})

		if (!pages[-1]) {
			return composeWikibooksUrl(wikibooksTitle)
		}
	} catch {}

	return composeGoogleQuery(moves.map(({whitePly, blackPly, moveNumber}) => `${moveNumber}. ${whitePly} ${blackPly}`).join(" "))
}

export default function OpeningTheory({openingManager}) {
	const [isDisabled, setIsDisabled] = React.useState(false)

	return <Col xs="4">
		<Button className="settingButton" onClick={async () => {
			setIsDisabled(true)
			window.open(await getOpeningBookUrl(openingManager), '_blank')
			setIsDisabled(false)
			trackEvent(Constants.EVENT_CATEGORY_CONTROLS, "OpenTheory")
		}} color="" disabled={isDisabled}>
			<h3>
				<FontAwesomeIcon icon={faBookOpen} />
			</h3>
			<span>
				Opening theory
			</span>
		</Button>
	</Col>
}