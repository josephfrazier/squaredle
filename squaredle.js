// A solver for https://www.andrewt.net/puzzles/cell-tower

const DEBUG = process.env.DEBUG;
const fs = require('fs')

const grid = `
TEDSTUP
LPIEIDM
LRIDREI
ANNJENI
STOUCMA
WTMATPL
ERRIOIN
REDAGTS
SOUESOS
NNDKIOI
IENGNND
EDEDGES
`.trim().split('\n').map(row => row.split('').map(c => c == ' ' ? null : c))

function adjacentPositions (previousRegion) {
  return previousRegion.flatMap(([row, col]) => [
                        [row - 1, col],
    [row,     col - 1],                 [row,     col + 1],
                        [row + 1, col],
  ])
}

function validPositions (positions, grid) {
  return positions.filter(([row, col]) => 0 <= row && row < grid.length && 0 <= col && col < grid[0].length)
}

function positionsToCells (positions, grid) {
  const sortedPositions = positions.toSorted(function (pos1, pos2) {
    if (pos1[0] === pos2[0]) {
      return pos1[1] - pos2[1]; // Sort by column if rows are equal
    }
    return pos1[0] - pos2[0]; // Sort by row
  })
  return sortedPositions.map(([row, col]) => grid[row][col])
}

function positionstoWord (positions, grid) {
  return positionsToCells(positions, grid).join('')
}

function isAllLetters (grid, region) {
  return !region.some(([row, col]) => grid[row][col] == null)
}

function isAlreadyUsed (positions, pos) {
  return positions.some(([row, col]) => row == pos[0] && col == pos[1])
}

const visitedRegions = []

// TODO find a way to optimize this, maybe with sorting of pairs within regions and subsequent sorting of regions themselves
// TODO or maybe with better data structures such as a Set of Sets of [row, col] pairs
function haveSamePairs(list1, list2) {
  if (list1.length !== list2.length) {
    return false; // Different lengths, cannot have the same set of pairs
  }

  var sortedList1 = JSON.stringify(list1.slice().sort());
  var sortedList2 = JSON.stringify(list2.slice().sort());

  return sortedList1 === sortedList2;
}

function regionIsVisited(region) {
  return visitedRegions.some(reg => haveSamePairs(region, reg))
}

function nextRegions (previousRegion, grid) {
  const potentialPositions = validPositions(adjacentPositions(previousRegion), grid)
  const unusedPositions = potentialPositions.filter(pos => !isAlreadyUsed(previousRegion, pos))
  const potentialRegions = unusedPositions.map(pos => [...previousRegion, pos])
  const result = potentialRegions.filter(region => isAllLetters(grid, region)).filter(region => {
    const visited = regionIsVisited(region)
    if (visited) {
      if (DEBUG) {
        console.log('region is visited, omitting', region)
      }
    } else {
      if (DEBUG) {
        console.log('visiting region', region)
      }
      visitedRegions.push(region)
    }
    return !visited
  })

  return result
}

const words = fs.readFileSync('/usr/share/dict/words', 'utf8').split('\n').map(word => word.replace("'", '')).filter(word => word.length > 3).map(word => word.toUpperCase())

const printed = {}

for (let row = 0; row < grid.length; row++) {
  for (let col = 0; col < grid[0].length; col++) {
    let regions = [[[row, col]]]
    const targetLength = 8

    for (let i = regions[0].length; i <= targetLength; i++) {
      const letters = regions.filter(region => isAllLetters(grid, region)).map(region => positionstoWord(region, grid))
      const validWords = letters.filter(word => {
        if (DEBUG) {
          console.log(`trying ${word}`)
        }

        return words.includes(word)
      })
      validWords.forEach(word => {
        if (printed[word]) {
          return;
        }

        if (DEBUG) {
          console.log(`FOUND ${word}`)
        } else {
          console.log(word)
        }

        printed[word] = true
      })

      regions = regions.flatMap(region => nextRegions(region, grid))
    }
  }
}
