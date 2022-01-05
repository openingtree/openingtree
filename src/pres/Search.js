import React from 'react'
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from 'reactstrap'
import {
    Box,
    Button,
    FormControl,
    FormControlLabel,
    FormLabel,
    Link,
    Radio,
    RadioGroup,
    Table,
    TableBody,
    TableRow,
    TableCell,
    TextField,
} from '@material-ui/core'
import {
    DataGrid,
    GridOverlay,
} from '@mui/x-data-grid'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import {
    FontAwesomeIcon,
} from '@fortawesome/react-fontawesome'
import {
    faWrench,
} from '@fortawesome/free-solid-svg-icons'
import GameState from '../app/GameState'
import { simplifiedFen } from '../app/util'

const SHOW_ALL_GAMES = 'show-all-games'
const SHOW_UNIQUE_POSITIONS = 'show-unique-positions'

class Position {
    constructor(game, ply) {
        this.game = game
        this.move = game.moves[ply - 1]
        this.ply = ply
    }

    turn() {
        return this.move.sourceFen.split(/\s+/)[1] === 'w'
            ? 'White'
            : 'Black'
    }
}

export class Query {
    constructor(text) {
        this.text = text
        this.fen = this.parseFen(text)
        this.move = this.parseMove(text)
    }

    // sloppy FEN validator
    parseFen(text) {
        let tokens = text.trim().split(/\s+/)
        if (tokens.length > 6) {
            // more than six words is probably not FEN
            return undefined
        }

        // validate grid of pieces
        let grid = tokens[0].split('/')
        if (grid.length !== 8) {
            // need exactly 8 rows
            return undefined
        }
        for (var row = 0; row < grid.length; row++) {
            var sum = 0
            var [prv, cur] = [false, false]
            for (var col = 0; col < grid[row].length; col++) {
                cur = !isNaN(grid[row][col])
                if (cur) {
                    if (prv) {
                        // consecutive numbers
                        return undefined
                    }
                    sum += parseInt(grid[row][col], 10)
                } else {
                    if (!/^[prnbqkPRNBQK]$/.test(grid[row][col])) {
                        // invalid piece
                        return undefined
                    }
                    sum += 1
                }
                prv = cur
            }
            if (sum !== 8) {
                // need exactly 8 columns
                return undefined
            }
        }

        // validate active color, if present
        if (tokens.length > 1 && !/^(w|b)$/.test(tokens[1])) {
            return undefined
        }

        // ok, good enough for our purposes
        return text
    }

    // sloppy SAN parser
    parseMove(text) {
        let matches = text
            .replace(/=/, '')
            .replace(/[?!]*$/, '')
            .match(/([pnbrqkPNBRQK])?([a-h]?[1-8]?)(x?-?)([a-h][1-8])([qrbnQRBN])?/)
        if (!matches) {
            return undefined
        }
        let move = {
            piece: matches[1],
            from: matches[2],
            capture: matches[3].includes('x') ? true : undefined,
            to: matches[4],
            promotion: matches[5] ? matches[5].toLowerCase() : undefined,
            check: text.includes('+') ? true : undefined,
            mate: text.includes('#') ? true : undefined,
        }
        if (!move.piece && move.capture && move.from.length === 1) {
            move.piece = 'p'
        }
        return move
    }

    evaluate(parsedMove) {
        if (this.text === parsedMove.move.san) {
            return true
        }
        if (this.fen !== undefined && parsedMove.targetFen.startsWith(this.fen)) {
            return true
        }
        if (this.move !== undefined) {
            let move = parsedMove.move
            return (
                this.move.to === move.to
                    // `this.move.from` may be a square (e.g., 'b1' in 'Nb1d2')
                    // or a disambiguator (e.g., 'b' in 'Nbd2')
                    && (this.move.from === move.from
                        || (this.move.from.length === 1
                         && (move.from.startsWith(this.move.from)
                             || move.from.endsWith(this.move.from))))
                    && (!this.move.piece || this.move.piece.toLowerCase() === move.piece)
                    && this.move.promotion === move.promotion
                    && (this.move.capture === undefined || move.captured !== undefined)
                    && (this.move.check === undefined || move.san.endsWith('+'))
                    && (this.move.mate === undefined || move.san.endsWith('#'))
            )
        }
        return false
    }
}

export class Search extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            query: '',
            results: [],
            scanning: false,
            scannedGames: 0,
            totalGames: 0,
            editSettings: false,
            settings: {
                mode: SHOW_ALL_GAMES,
            },
        }
    }

    updateQuery(event) {
        this.setState({
            query: event.target.value,
        })
    }

    toggleSettingsModal() {
        this.setState({ editSettings: !this.state.editSettings })
    }

    updateSettings(settings) {
        this.setState({ settings: settings })
    }

    clearResults() {
        this.setState({
            results: [],
            scanning: false,
            scannedGames: 0,
            totalGames: 0,
        })
    }

    search() {
        if (!this.state.query) {
            this.clearResults()
            return
        }
        this.setState({
            results: [],
            scanning: true,
            scannedGames: 0,
            totalGames: this.props.openingGraph.games.length,
        })
        setTimeout(() => this.scan(new Query(this.state.query), 0))
    }

    cancel() {
        this.setState({ scanning: false })
    }

    scan(query, idx) {
        if (!this.state.scanning) {
            return
        }

        let games = this.props.openingGraph.games
        if (idx >= games.length) {
            this.cancel()
            return
        }

        var results = []
        for (var i = 0; idx < games.length && i < 10; i++) {
            let game = games[idx]
            if (query.fen !== undefined
                && game.moves.length > 0
                && game.moves[0].sourceFen.startsWith(query.fen)) {
                // special case for starting position
                results.push(new Position(game, 0))
            }
            for (var ply = 0; ply < game.moves.length; ply++) {
                let move = game.moves[ply]
                if (query.evaluate(move)) {
                    results.push(new Position(game, ply + 1))
                }
            }
            idx++
        }

        if (results.length > 0) {
            this.setState({
                results: [...this.state.results, ...results],
            })
        }
        this.setState({ scannedGames: idx })

        setTimeout(() => this.scan(query, idx))
    }

    navigate(position) {
        let game = new GameState(
            this.props.openingGraph.variant,
            position.game.moves[0].sourceFen,
            position.game.headers,
        )
        for (var i = 0; i < position.game.moves.length; i++) {
            if (this.state.settings.mode === SHOW_UNIQUE_POSITIONS && i >= position.ply) {
                break
            }
            game.makeMove(position.game.moves[i].move)
        }
        game.navigateToMove(position.ply)
        this.props.navigateToGame(game)
    }

    render() {
        return <>
            {this.renderSettings()}
            {this.renderQueryTable()}
            {this.renderResultsGrid()}
        </>
    }

    renderSettings() {
        return (
            <SettingsModal
                isOpen={this.state.editSettings}
                settings={this.state.settings}
                updateSettings={(settings) => this.updateSettings(settings)}
                toggle={() => this.toggleSettingsModal()}
            />
        )
    }

    renderQueryTable() {
        return (
            <Table size='small'>
                <TableBody>
                    { this.renderQueryInput() }
                    { this.renderQueryButton() }
                </TableBody>
            </Table>
        )
    }

    renderQueryInput() {
        // disable autoComplete because the styling doesn't work well in dark mode
        const message = 'search games for positions (in FEN format) or moves (e.g., Bxh7+)'
        return (
            <TableRow>
                <TableCell style={{borderBottom: 'none'}}>
                    <Tooltip title={message}>
                        <TextField
                            id='searchTextBox'
                            className='searchField'
                            name='search'
                            label='search query'
                            margin='dense'
                            variant='outlined'
                            autoComplete='off'
                            fullWidth
                            onChange={this.updateQuery.bind(this)}
                            inputProps={{
                                style: {fontSize: 12},
                                spellCheck: false,
                            }}
                        />
                    </Tooltip>
                </TableCell>
            </TableRow>
        )
    }

    renderQueryButton() {
        const mkSearchButton = () => {
            let supported = this.props.openingGraph.games !== undefined
            let disabled = !supported || this.state.scanning
            var button = (
                <Button
                    size='small'
                    color='primary'
                    onClick={this.search.bind(this)}
                    disabled={disabled}
                >
                        Search
                </Button>
            )
            if (!supported) {
                button = (
                    <Tooltip title='search feature not available for .tree files'>
                        <span>
                            {button}
                        </span>
                    </Tooltip>
                )
            }
            return (
                <>
                    {button}
                    <FontAwesomeIcon
                        className='searchSettingsIcon'
                        icon={faWrench}
                        onClick={() => this.toggleSettingsModal()}
                    />
                </>
            )
        }
        const mkCancelButton = () => {
            if (!this.state.scanning) {
                return ''
            }
            return (
                <Button
                    size='small'
                    color='primary'
                    onClick={this.cancel.bind(this)}
                >
                    Cancel
                </Button>
            )
        }
        return (
            <TableRow>
                <TableCell align='right' style={{borderBottom: 'none'}}>
                    { mkCancelButton() }
                    { mkSearchButton() }
                </TableCell>
            </TableRow>
        )
    }

    renderResultsGrid() {
        if (!this.props.isOpen) {
            // DataGrid complains about the parent container height
            // when rendered for an inactive TabPane
            return ''
        }
        const mkLabel = (position) => {
            if (this.state.settings.mode === SHOW_ALL_GAMES) {
                let headers = position.game.headers
                return `${headers.White} - ${headers.Black}`
            } else {
                return simplifiedFen(position.move.sourceFen)
            }
        }
        const mkDate = (date) => {
            let [year, month, day] = date.split('.')
            return new Date(year, month - 0, day)
        }
        // TODO valueFormatter for export
        const gameColumns = [
            {
                field: 'position',
                headerName: 'Game',
                flex: 1,
                renderCell: (params) => (
                    <Link
                        href="#"
                        className="searchResultLink"
                        onClick={() => this.navigate(params.value)}>
                        {mkLabel(params.value)}
                    </Link>
                ),
            },
            {
                field: 'date',
                type: 'date',
                headerName: 'Date',
            },
            {
                field: 'opening',
                headerName: 'ECO',
                valueGetter: (params) => {
                    let opening = params.row.position.game.getOpening()
                    return `${opening ? opening.code : '?'}`
                },
            },
            {
                field: 'ply',
                headerName: 'Ply',
                type: 'number',
                hide: true,
                valueGetter: (params) => params.row.position.ply,
            },
            {
                field: 'move',
                headerName: 'Move',
                hide: true,
                valueGetter: (params) => params.row.position.turn(),
            },
        ]
        const positionColumns = [
            {
                field: 'position',
                headerName: 'Position',
                flex: 1,
                cellClassName: 'searchResultPositionCell',
                renderCell: (params) => (
                    <Link
                        href="#"
                        onClick={() => this.navigate(params.value)}>
                        {mkLabel(params.value)}
                    </Link>
                ),
            },
        ]
        let columns = this.state.settings.mode === SHOW_ALL_GAMES
            ? gameColumns
            : positionColumns;
        let rows = this.getResults().map((position, idx) => {
            return {
                id: idx,
                'position': position,
                'date': mkDate(position.game.headers.Date),
            }
        })
        let message = this.state.scanning ? 'searching...' : 'no matches'
        let progress = this.state.totalGames > 0
            ? 100 * this.state.scannedGames / this.state.totalGames
            : 0
        return (
            <div className='searchGridDiv'>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pagination
                    pageSize={25}
                    rowsPerPageOptions={[25]}
                    disableSelectionOnClick
                    loading={this.state.scanning}
                    components={{
                        NoRowsOverlay: () => (
                            <GridOverlay>
                                <Box>{message}</Box>
                            </GridOverlay>
                        ),
                        LoadingOverlay: () => (
                            <GridOverlay>
                                <CircularProgress variant='determinate' value={progress} />
                            </GridOverlay>
                        ),
                    }}
                />
            </div>
        )
    }

    getResults() {
        if (this.state.settings.mode === SHOW_ALL_GAMES) {
            return this.state.results
        }
        let positions = new Map()
        return this.state.results.filter((position) => {
            let duplicate = positions.has(position.move.sourceFen)
            if (!duplicate) {
                positions.set(position.move.sourceFen, position)
                return true
            }
            return false
        })
    }
}

class SettingsModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = { ...this.props.settings }
    }

    save() {
        this.props.updateSettings(this.state)
        this.props.toggle()
    }

    cancel() {
        this.setState({ ...this.props.settings })
        this.props.toggle()
    }

    render() {
        return (
            <Modal
                isOpen={this.props.isOpen}
                toggle={this.props.toggle}>
                <ModalHeader
                    toggle={this.props.toggle}>search settings
                </ModalHeader>
                <ModalBody>
                    {this.renderSearchOptions()}
                </ModalBody>
                <ModalFooter>
                    <Button
                        color='primary'
                        onClick={() => this.cancel()}>
                        Cancel
                    </Button>
                    <Button
                        color='primary'
                        onClick={() => this.save()}>
                        Save
                    </Button>
                </ModalFooter>
            </Modal>
        )
    }

    renderSearchOptions() {
        return (
            <FormControl component='fieldset'>
                <FormLabel component='legend'>show results for</FormLabel>
                <RadioGroup
                    aria-label='show-results-for'
                    name='results-radio-buttons-group'
                    value={this.state.mode}
                    onChange={(event) => this.setState({ mode: event.target.value })}
                >
                    <FormControlLabel
                        value={SHOW_ALL_GAMES}
                        control={<Radio size='small' color='primary' />}
                        label='all games'
                    />
                    <FormControlLabel
                        value={SHOW_UNIQUE_POSITIONS}
                        control={<Radio size='small' color='primary' />}
                        label='unique positions'
                    />
                </RadioGroup>
            </FormControl>
        )
    }
}
