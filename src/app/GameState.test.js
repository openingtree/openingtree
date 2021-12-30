import GameState from './GameState'

test('make move', () => {
  let game = new GameState()
  expect(game.getOpening()).toBe(undefined)
  expect(game.makeMove('e4')).not.toBeNull()
  expect(game.makeMove('e5')).not.toBeNull()
  expect(game.makeMove('Nf3')).not.toBeNull()
  expect(game.getPly()).toBe(3)
  expect(game.getTurn()).toBe('b')
  expect(game.getMoves().map((move) => move.san)).toEqual(['e4', 'e5', 'Nf3'])
  expect(game.getOpening().code).toBe('C40')
})

test('overwrite move', () => {
  let game = new GameState()
  expect(game.getOpening()).toBe(undefined)
  game.makeMove('e4')
  let move = game.makeMove('e5')
  game.makeMove('Nf3')
  game.navigateToMove(move.ply)
  expect(game.makeMove('Bc4')).not.toBeNull()
  expect(game.getPly()).toBe(3)
  expect(game.getTurn()).toBe('b')
  expect(game.getMoves().map((move) => move.san)).toEqual(['e4', 'e5', 'Bc4'])
  expect(game.getOpening().code).toBe('C23')
})
