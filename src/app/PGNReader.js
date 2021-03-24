import {chessLogic} from './chess/ChessLogic'
import LichessIterator from './iterator/LichessIterator'
import ChessComIterator from './iterator/ChessComIterator'
import PGNFileIterator from './iterator/PGNFileIterator'
import * as Constants from './Constants'
import NotablePlayerIterator from './iterator/NotablePlayerIterator'
import OnlineTournamentIterator from './iterator/OnlineTournamentIterator'
import { expose } from 'comlink'

export default class PGNReader {
    constructor(variant) {
        this.totalGames = 0;
        this.pendingGames = 0;
        this.pendingDownloads = true;
        this.variant = variant;
    }



    fetchPGNFromSite(playerName, playerColor, site, selectedNotablePlayer,
        selectedNotableEvent, selectedOnlineTournament, shouldDownloadToFile, 
        advancedFilters, notify, showError, stopDownloading, files, 
        downloadResponse, tokens) {
        this.continueProcessingGames = true
        
        let handleResponse = (result, pendingDownloads) => {
            if(!result) {
                return this.continueProcessingGames
            }
            this.totalGames += result.length
            this.pendingGames += result.length
            this.pendingDownloads = pendingDownloads
            

            setTimeout(() => {
                this.parsePGNTimed(site, result, 0, advancedFilters, playerColor, playerName, notify, showError, stopDownloading)
            } ,1)
            return this.continueProcessingGames
        }
        let processor = shouldDownloadToFile? downloadResponse: handleResponse
        if (site === Constants.SITE_LICHESS) {
            new LichessIterator(this.variant,tokens.lichess, playerName, playerColor, advancedFilters, processor, showError)
        } else if (site === Constants.SITE_CHESS_DOT_COM) {
            new ChessComIterator(this.variant,playerName, playerColor, advancedFilters, processor, showError)
        } else if (site === Constants.SITE_PGN_FILE) {
            new PGNFileIterator(playerName, files, playerColor, advancedFilters, processor, showError)
        } else if (site === Constants.SITE_PLAYER_DB) {
            new NotablePlayerIterator(selectedNotablePlayer, playerColor, advancedFilters, processor, showError)
        } else if (site === Constants.SITE_EVENT_DB) {
            new NotablePlayerIterator(selectedNotableEvent, playerColor, advancedFilters, processor, showError)
        } else if (site === Constants.SITE_ONLINE_TOURNAMENTS) {
            new OnlineTournamentIterator(this.variant,tokens.lichess, selectedOnlineTournament, advancedFilters, processor,showError)
        }
        return 'done'
        
    }

    parsePGNTimed(site, pgnArray, index, advancedFilters, playerColor,  playerName, notify, showError, stopDownloading) {
        if(index< pgnArray.length) {
            this.pendingGames--
        }
        if(!this.pendingDownloads && this.pendingGames <= 0) {
            stopDownloading()
        }

        if(index>= pgnArray.length || !this.continueProcessingGames) {
            return
        }
        var pgn = pgnArray[index]

        // ignore pgn files with no moves, or less than 2 moves played
        // ignore pgn files that do not start with move 1. these are mostly "from position tournaments in lichess"
        // for this, we need to check that the move number actually exists and is not 1.
        // there are some pgns that do not have any move numbers and we should assume they start with move 1
        if(pgn.moves.length>2 && pgn.moves[0] && 
            (pgn.moves[0].move_number == null || pgn.moves[0].move_number === 1)) {
            let chess = chessLogic(this.variant)
            let pgnParseFailed = false;
            let parsedMoves = []
            var moves=pgn.moves.map(i=>i.move).join(" ")
            
            chess.load_pgn(moves, {sloppy: true});

            var items=chess.history({verbose:true})
            chess = chessLogic(this.variant)
            items.forEach((element, idx) => {
                let sourceFen=""
                if(idx===0) {
                    sourceFen=chess.fen();
                } else {
                    sourceFen = parsedMoves[idx-1].targetFen
                }
                let targetFen = element.fen
                var item={
                    sourceFen:sourceFen,
                    targetFen:targetFen,
                    moveSan:element.san
                }
                parsedMoves.push(item)
            })
            if(pgnParseFailed) {
                showError("Failed to load a game", `${playerName}:${playerColor}`)
            } else {
                let fen = chess.fen()
                let parsedPGNDetails = {
                    pgnStats:this.gameResult(pgn,site),
                    parsedMoves:parsedMoves,
                    latestFen:fen,
                    playerColor:playerColor
                }
                notify(advancedFilters[Constants.FILTER_NAME_DOWNLOAD_LIMIT],1, parsedPGNDetails).then((continueProcessingGames)=>{
                    this.continueProcessingGames = continueProcessingGames
                })
            }
        }
        setTimeout(()=>{this.parsePGNTimed(site, pgnArray, index+1, advancedFilters, playerColor, playerName, notify, showError, stopDownloading)},1)

    }

    gameResult(pgn, site) {
        let url= null 
        if (site === Constants.SITE_CHESS_DOT_COM) {
            url = pgn.headers.Link
        } else if(site === Constants.SITE_LICHESS || site === Constants.SITE_ONLINE_TOURNAMENTS) {
            url = pgn.headers.Site
        }
        let headers=null
        if(!url) {
            headers = pgn.headers
        }
        return {
            result:pgn.result,
            white:pgn.headers.White,
            black:pgn.headers.Black,
            whiteElo:pgn.headers.WhiteElo,
            blackElo:pgn.headers.BlackElo,
            url:url,
            date:pgn.headers.Date,
            headers:headers,
            numberOfPlys:pgn.moves.length
        }
    }
}

expose(PGNReader)