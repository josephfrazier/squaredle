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

const minLength = 4
const maxLength = 8

const words = new Set(fs.readFileSync('/usr/share/dict/words', 'utf8').split('\n').map(word => word.replace("'", '')).filter(word => minLength <= word.length && word.length <= maxLength).map(word => word.toUpperCase()))
// const words = fs.readFileSync('./1000-most-common-words.txt', 'utf8').split('\n').map(word => word.replace("'", '')).filter(word => minLength <= word.length && word.length <= maxLength).map(word => word.toUpperCase())
// const words = fs.readFileSync('./google-10000-english.txt', 'utf8').split('\n').map(word => word.replace("'", '')).filter(word => minLength <= word.length && word.length <= maxLength).map(word => word.toUpperCase())

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

function sortedRegion (region) {
  return region.toSorted(function (position1, position2) {
    if (position1[0] === position2[0]) {
      return position1[1] - position2[1]; // Sort by column if rows are equal
    }
    return position1[0] - position2[0]; // Sort by row
  })
}

function regionToCells (region, grid) {
  return sortedRegion(region).map(([row, col]) => grid[row][col])
}

function regionToWord (region, grid) {
  return regionToCells(region, grid).join('')
}

function isLetter (grid, [row, col]) {
  return grid[row][col] != null
}

function isAllLetters (grid, region) {
  const result = region.every(([row, col]) => isLetter(grid, [row, col]))
  return result
}

function isAlreadyUsed (region, position) {
  return region.some(([row, col]) => row == position[0] && col == position[1])
}

const visitedRegions = new Set()

function haveSamePairs(list1, list2) {
  if (list1.length !== list2.length) {
    return false; // Different lengths, cannot have the same set of pairs
  }

  var sortedList1 = JSON.stringify(list1.slice().sort());
  var sortedList2 = JSON.stringify(list2.slice().sort());

  return sortedList1 === sortedList2;
}

function regionIsVisited(regionString) {
  return visitedRegions.has(regionString)
}

function nextRegions (previousRegion, grid) {
  DEBUG && console.time('nextRegions')

  const potentialPositions = validPositions(adjacentPositions(previousRegion), grid)
  const unusedPositions = potentialPositions.filter(position => !isAlreadyUsed(previousRegion, position))
  const potentialRegions = unusedPositions.map(position => [...previousRegion, position])

  DEBUG && console.time('allLetterRegions')
  const allLetterRegions = potentialRegions.filter(region => isAllLetters(grid, region))
  DEBUG && console.timeEnd('allLetterRegions')

  DEBUG && console.time('unvisitedRegions')
  const unvisitedRegions = allLetterRegions.filter(region => {
    const regionString = JSON.stringify(region.toSorted())
    const visited = regionIsVisited(regionString)
    if (!visited) {
      visitedRegions.add(regionString)
    }
    return !visited
  })
  DEBUG && console.timeEnd('unvisitedRegions')

  const result = unvisitedRegions

  DEBUG && console.timeEnd('nextRegions')
  DEBUG && console.log('')

  return result
}

const printed = {}

for (let row = 0; row < grid.length; row++) {
  for (let col = 0; col < grid[0].length; col++) {
    let regions = [[[row, col]]]

    for (let i = regions[0].length; i <= maxLength; i++) {
      const regionWordPairs = regions.filter(region => isAllLetters(grid, region)).map(region => [region, regionToWord(region, grid)])
      const validPairs = regionWordPairs.filter(([region, word]) => {
        return words.has(word)
      })
      validPairs.forEach(([region, word]) => {
        if (printed[word]) {
          return;
        }

        DEBUG && console.log(`FOUND ${word} ${region}`) || console.log(word, region)

        printed[word] = true
      })

      regions = regions.flatMap(region => nextRegions(region, grid))
    }
  }
}
