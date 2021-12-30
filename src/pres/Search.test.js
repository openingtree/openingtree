import { Query } from './Search'
import { chessLogic } from '../app/chess/ChessLogic'
import { simplifiedFen } from '../app/util'

function mkMove(chess, san) {
  let src = chess.fen()
  let move = chess.move(san)
  expect(move).not.toBeNull()
  let dst = chess.fen()
  return {
    sourceFen: src,
    move: move,
    targetFen: dst,
  }
}

test('evaluate fen', () => {
  let chess = chessLogic()
  let move = mkMove(chess, 'e4')
  expect(new Query(move.sourceFen).evaluate(move)).toBe(true)
  expect(new Query(move.targetFen).evaluate(move)).toBe(false)
})

test('evaluate simplified fen', () => {
  let chess = chessLogic()
  let fen = simplifiedFen(chess.fen())
  mkMove(chess, 'Nc3')
  mkMove(chess, 'Nf6')
  mkMove(chess, 'Nb1')
  mkMove(chess, 'Ng8')
  let move = mkMove(chess, 'Nc3')
  expect(new Query(fen).evaluate(move)).toBe(true)
  expect(new Query(fen.split(' ')[0]).evaluate(move)).toBe(true)
  expect(new Query(fen.split(' ')[0] + ' ').evaluate(move)).toBe(true)
  expect(new Query(simplifiedFen(move.targetFen)).evaluate(move)).toBe(false)
})

test('evaluate san', () => {
  let chess = chessLogic()
  let move = mkMove(chess, 'Nc3')
  expect(new Query('Nc3').evaluate(move)).toBe(true)
  expect(new Query('e4').evaluate(move)).toBe(false)
})

test('evaluate lan', () => {
  let chess = chessLogic()
  mkMove(chess, 'e4')
  mkMove(chess, 'e5')
  mkMove(chess, 'Nf3')
  mkMove(chess, 'Nf6')
  let move = mkMove(chess, 'Nxe5')
  expect(new Query('f3e5').evaluate(move)).toBe(true)
  expect(new Query('f3-e5').evaluate(move)).toBe(true)
  expect(new Query('f3xe5').evaluate(move)).toBe(true)
  expect(new Query('Nf3e5').evaluate(move)).toBe(true)
  expect(new Query('Nf3-e5').evaluate(move)).toBe(true)
  expect(new Query('Nf3xe5').evaluate(move)).toBe(true)
})

test('evaluate disambiguated', () => {
  let chess = chessLogic()
  mkMove(chess, 'd4')
  mkMove(chess, 'd5')
  mkMove(chess, 'Nf3')
  mkMove(chess, 'Nf6')
  let move = mkMove(chess, 'Nbd2')
  expect(new Query('Nbd2').evaluate(move)).toBe(true)
})

test('evaluate overly disambiguated', () => {
  let chess = chessLogic()
  mkMove(chess, 'd4')
  mkMove(chess, 'd5')
  let move = mkMove(chess, 'Nd2')
  expect(new Query('Nbd2').evaluate(move)).toBe(true)
})

test('evaluate capture', () => {
  let chess = chessLogic()
  mkMove(chess, 'e4')
  mkMove(chess, 'Nf6')
  mkMove(chess, 'e5')
  mkMove(chess, 'Ne4')
  mkMove(chess, 'd4')
  mkMove(chess, 'd5')
  let capture = mkMove(chess, 'exd6')
  expect(new Query('exd6').evaluate(capture)).toBe(true)
  let recapture = mkMove(chess, 'Nxd6')
  expect(new Query('exd6').evaluate(recapture)).toBe(false)
  expect(new Query('Nxd6').evaluate(recapture)).toBe(true)
})

test('evaluate no capture', () => {
  let chess = chessLogic()
  mkMove(chess, 'e4')
  mkMove(chess, 'c5')
  mkMove(chess, 'Nf3')
  mkMove(chess, 'd6')
  let move = mkMove(chess, 'Ne5')
  expect(new Query('Nxe5').evaluate(move)).toBe(false)
})

test('evaluate promotion', () => {
  let chess = chessLogic()
  mkMove(chess, 'e4')
  mkMove(chess, 'd5')
  mkMove(chess, 'e5')
  mkMove(chess, 'd4')
  mkMove(chess, 'e6')
  mkMove(chess, 'd3')
  mkMove(chess, 'exf7+')
  mkMove(chess, 'Kd7')
  let move = mkMove(chess, 'fxg8R')
  expect(new Query('fxg8R').evaluate(move)).toBe(true)
  expect(new Query('fxg8Q').evaluate(move)).toBe(false)
})

test('evaluate check', () => {
  let chess = chessLogic()
  mkMove(chess, 'e4')
  mkMove(chess, 'e5')
  mkMove(chess, 'Bc4')
  mkMove(chess, 'Nf6')
  let move = mkMove(chess, 'Bxf7+')
  expect(new Query('Bxf7').evaluate(move)).toBe(false)
  expect(new Query('Bxf7+').evaluate(move)).toBe(true)
})

test('evaluate no check', () => {
  let chess = chessLogic()
  mkMove(chess, 'e4')
  mkMove(chess, 'e5')
  mkMove(chess, 'Qh5')
  mkMove(chess, 'd6')
  let move = mkMove(chess, 'Qxh7')
  expect(new Query('Qxh7').evaluate(move)).toBe(true)
  expect(new Query('Qxh7+').evaluate(move)).toBe(false)
})

test('evaluate mate', () => {
  let chess = chessLogic()
  mkMove(chess, 'e4')
  mkMove(chess, 'e5')
  mkMove(chess, 'Bc4')
  mkMove(chess, 'Nc6')
  mkMove(chess, 'Qh5')
  mkMove(chess, 'Nf6')
  let move = mkMove(chess, 'Qxf7#')
  expect(new Query('Qxf7').evaluate(move)).toBe(false)
  expect(new Query('Qxf7+').evaluate(move)).toBe(false)
  expect(new Query('Qxf7#').evaluate(move)).toBe(true)
})

test('evaluate no mate', () => {
  let chess = chessLogic()
  mkMove(chess, 'e4')
  mkMove(chess, 'e5')
  mkMove(chess, 'Bc4')
  mkMove(chess, 'Nc6')
  mkMove(chess, 'Qh5')
  mkMove(chess, 'Nh6')
  let move = mkMove(chess, 'Qxf7+')
  expect(new Query('Qxf7').evaluate(move)).toBe(false)
  expect(new Query('Qxf7+').evaluate(move)).toBe(true)
  expect(new Query('Qxf7#').evaluate(move)).toBe(false)
})
