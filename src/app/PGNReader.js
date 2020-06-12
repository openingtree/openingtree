import {openingGraph} from './OpeningGraph'
import Chess from 'chess.js'
import LichessIterator from './iterator/LichessIterator'
import ChessComIterator from './iterator/ChessComIterator'
import PGNFileIterator from './iterator/PGNFileIterator'
import * as Constants from './Constants'
import streamsaver from 'streamsaver'
import NotablePlayerIterator from './iterator/NotablePlayerIterator'
import * as SitePolicy from './SitePolicy'

export default class PGNReader {
    constructor() {
        this.totalGames = 0;
        this.pendingGames = 0;
        this.pendingDownloads = true;
        streamsaver.mitm = "download/download-mitm.html"
        this.fileWriter = null
    }

    stopDownloading() {
        if(this.fileWriter) {
            this.fileWriter.close()
            this.fileWriter = null
        }
    }

    getPgnString(game){
        return `${Object.entries(game.headers).map(header=>`[${header[0]} "${header[1]}"]`).join("\n")}
                \n${game.moves.map((moveObject, index)=>{
                    return `${index%2!==0?'':index/2+1+"."} ${moveObject.move}`
                }).join(' ')} ${game.result}\n\n\n`
    }

    fetchPGNFromSite(playerName, playerColor, site, selectedNotablePlayer,
        selectedNotableEvent, shouldDownloadToFile, advancedFilters, notify, 
        showError, stopDownloading, files) {
        this.continueProcessingGames = true
        if(shouldDownloadToFile) {
            let fileStream =  streamsaver.createWriteStream(SitePolicy.exportFileName(site, playerName, playerColor, selectedNotableEvent, "pgn"))
            this.fileWriter = fileStream.getWriter()
        }
        let encoder = new TextEncoder()
        let downloadResponse = (result, pendingDownloads) => {
            this.fileWriter.write(encoder.encode(result.map(game=>this.getPgnString(game)).join(""))).then(()=>{
                if(!pendingDownloads) {
                    this.stopDownloading()
                }
            })
            return true
        }
        let handleResponse = (result, pendingDownloads) => {
            if(!result) {
                return this.continueProcessingGames
            }
            this.totalGames += result.length
            this.pendingGames += result.length
            this.pendingDownloads = pendingDownloads
            

            setTimeout(() => {
                this.parsePGNTimed(site, result, advancedFilters, playerColor, 0, playerName, notify, showError, stopDownloading)
            } ,1)
            return this.continueProcessingGames
        }
        let processor = shouldDownloadToFile? downloadResponse: handleResponse
        if (site === Constants.SITE_LICHESS) {
            new LichessIterator(playerName, playerColor, advancedFilters, processor, showError)
        } else if (site === Constants.SITE_CHESS_DOT_COM) {
            new ChessComIterator(playerName, playerColor, advancedFilters, processor, showError)
        } else if (site === Constants.SITE_PGN_FILE) {
            new PGNFileIterator(playerName, files, playerColor, advancedFilters, processor, showError)
        } else if (site === Constants.SITE_PLAYER_DB) {
            new NotablePlayerIterator(selectedNotablePlayer, playerColor, advancedFilters, processor, showError)
        } else if (site === Constants.SITE_EVENT_DB) {
            new NotablePlayerIterator(selectedNotableEvent, playerColor, advancedFilters, processor, showError)
        } 

        
    }

    parsePGNTimed(site, pgnArray, advancedFilters, playerColor, index,  playerName, notify, showError, stopDownloading) {
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

        if(pgn.moves[0] && pgn.moves[0].move_number === 1) {
            let chess = new Chess()
            let pgnParseFailed = false;
            let parsedMoves = []
            pgn.moves.forEach(element => {
                let sourceFen = chess.fen()
                let move = chess.move(element.move, {sloppy: true})
                let targetFen = chess.fen()
                if(!move){
                    pgnParseFailed=true
                    return
                }
                parsedMoves.push({
                    sourceFen:sourceFen,
                    targetFen:targetFen,
                    move:move
                })
            })
            if(pgnParseFailed) {
                console.log('failed to load game ',  pgn)
                showError("Failed to load a game", `${playerName}:${playerColor}`)
            } else {
                let fen = chess.fen()
                let parsedPGNDetails = {
                    pgnStats:this.gameResult(pgn,site),
                    parsedMoves:parsedMoves,
                    latestFen:fen,
                    playerColor:playerColor
                }
                this.continueProcessingGames = notify(advancedFilters[Constants.FILTER_NAME_DOWNLOAD_LIMIT],1, parsedPGNDetails)
            }
        }
        setTimeout(()=>{this.parsePGNTimed(site, pgnArray, advancedFilters, playerColor, index+1, playerName, notify, showError, stopDownloading)},1)
    }

    gameResult(pgn, site) {
        let url= null 
        if (site === Constants.SITE_CHESS_DOT_COM) {
            url = pgn.headers.Link
        } else if(site === Constants.SITE_LICHESS) {
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
            headers:headers
        }
    }
}