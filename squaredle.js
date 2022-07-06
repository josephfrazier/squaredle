// A solver for https://squaredle.app/

const fs = require('fs')

const grid = `
NEVER
GONNA
GIVEC
YOUXI
UPSYT
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
  return positions.map(([row, col]) => grid[row][col])
}

function positionstoWord (positions, grid) {
  return positionsToCells(positions, grid).join('')
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

const printed = {}

for (let row = 0; row < grid.length; row++) {
  for (let col = 0; col < grid[0].length; col++) {
    let chains = [[[row, col]]]
    const targetLength = 8

    for (let i = chains[0].length; i <= targetLength; i++) {
      const letters = chains.filter(chain => isAllLetters(grid, chain)).map(chain => positionstoWord(chain, grid))
      const validWords = letters.filter(word => words.includes(word))
      validWords.forEach(word => {
        if (printed[word]) {
          return;
        }

        console.log(word)
        printed[word] = true
      })

      chains = chains.flatMap(chain => nextChains(chain, grid))
    }
  }
}
