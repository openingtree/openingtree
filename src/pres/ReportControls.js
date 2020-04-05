export default class ControlsContainer extends React.Component {
    render() {
        return <Table onClick={this.eatClicks}>
            <TableHead className="performanceRatingRow performanceHeader"><TableRow>
                <TableCell className="performanceRatingRow"><b>Performance</b></TableCell>
                <TableCell className="performanceRatingRow"><b>{performanceDetails.performanceRating}</b></TableCell>
                </TableRow></TableHead>
            <TableBody>
            <TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Avg opponent</TableCell>
                <TableCell className="performanceRatingRow">{performanceDetails.averageElo}</TableCell>
            </TableRow>
            <TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Score</TableCell>
                <TableCell className="performanceRatingRow">{performanceDetails.score}</TableCell>
            </TableRow>
            {openMove.details.bestWin?<TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Best win</TableCell>
                <TableCell className="performanceRatingRow">{openMove.details.bestWin} <FontAwesomeIcon className="pointerExternalLink" onClick ={this.launch(openMove.details.bestWinGame.url)} icon={faExternalLinkAlt}/></TableCell>
            </TableRow>:null}
            {openMove.details.worstLoss?<TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Worst loss</TableCell>
                <TableCell className="performanceRatingRow">{openMove.details.worstLoss} <FontAwesomeIcon className="pointerExternalLink" onClick ={this.launch(openMove.details.worstLossGame.url)} icon={faExternalLinkAlt}/></TableCell>
            </TableRow>:null}
            <TableRow className="performanceRatingRow">
                <TableCell className="performanceRatingRow">Last played</TableCell>
                <TableCell className="performanceRatingRow">{openMove.details.lastPlayedGame.date} <FontAwesomeIcon className="pointerExternalLink" onClick ={this.launch(openMove.details.lastPlayedGame.url)} icon={faExternalLinkAlt}/></TableCell>
            </TableRow>
            </TableBody>
            <TableFooter><TableRow><TableCell colSpan="2">Calculated based on <a href="https://handbook.fide.com/chapter/B022017" target="_blank" rel="noopener noreferrer">FIDE regulations</a></TableCell></TableRow></TableFooter>
        </Table>
    }
}