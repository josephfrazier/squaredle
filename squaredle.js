const fs = require('fs')

const grid = `
SENA
RGR
NRRA
A  E
`.trim().split('\n').map(row => row.split('').map(c => c == ' ' ? null : c))

function adjacentPositions ([ row, col ]) {
  return [
    [row - 1, col - 1], [row - 1, col], [row - 1, col + 1],
    [row,     col - 1],                 [row,     col + 1],
    [row + 1, col - 1], [row + 1, col], [row + 1, col + 1]
  ]
}

function validPositions (positions, grid) {
  return positions.filter(([row, col]) => 0 <= row && row < grid.length && 0 <= col && col < grid[0].length)
}

function positionsToCells (positions, grid) {
  // debugger;
  return positions.map(([row, col]) => grid[row][col])
}

function isAllLetters (grid, positions) {
  return !positions.some(([row, col]) => grid[row][col] == null)
}

function isAlreadyUsed (positions, pos) {
  return positions.some(([row, col]) => row == pos[0] && col == pos[1])
}

function nextChains (previousChain, grid) {
  const potentialPositions = validPositions(adjacentPositions(previousChain[previousChain.length - 1]), grid)
  const unusedPositions = potentialPositions.filter(pos => !isAlreadyUsed(previousChain, pos))
  const result = unusedPositions.map(pos => [...previousChain, pos]).filter(positions => isAllLetters(grid, positions))

  return result
}

const words = fs.readFileSync('/usr/share/dict/words', 'utf8').split('\n').map(word => word.replace("'", '')).filter(word => word.length > 3).map(word => word.toUpperCase())

const chains1 = [[[2, 2], [3, 3]]]
const chains2 = chains1.flatMap(chain => nextChains(chain, grid))
const chains3 = chains2.flatMap(chain => nextChains(chain, grid))
const chains4 = chains3.flatMap(chain => nextChains(chain, grid))
const chains5 = chains4.flatMap(chain => nextChains(chain, grid))
const chains6 = chains5.flatMap(chain => nextChains(chain, grid))
const chains7 = chains6.flatMap(chain => nextChains(chain, grid))
const chains8 = chains7.flatMap(chain => nextChains(chain, grid))
const chains9 = chains8.flatMap(chain => nextChains(chain, grid))

const letters = chains9.filter(chain => isAllLetters(grid, chain)).map(chain => positionsToCells(chain, grid).join(''))

console.log(letters.filter(word => words.includes(word)))
