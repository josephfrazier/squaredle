// A solver for https://www.andrewt.net/puzzles/cell-tower

const DEBUG = process.env.DEBUG;
const fs = require('fs')

const sorted = require('sorted-array-functions')

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

const targetLength = 8

// const words = fs.readFileSync('/usr/share/dict/words', 'utf8').split('\n').map(word => word.replace("'", '')).filter(word => 4 <= word.length && word.length <= targetLength).map(word => word.toUpperCase())
// const words = fs.readFileSync('./1000-most-common-words.txt', 'utf8').split('\n').map(word => word.replace("'", '')).filter(word => 4 <= word.length && word.length <= targetLength).map(word => word.toUpperCase())
const words = fs.readFileSync('./google-10000-english.txt', 'utf8').split('\n').map(word => word.replace("'", '')).filter(word => 4 <= word.length && word.length <= targetLength).map(word => word.toUpperCase())

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

// TODO find a way to optimize this, maybe with sorting of pairs within regions
// TODO and subsequent sorting of regions themselves
// TODO or maybe with better data structures such as a Set of Sets of [row, col] pairs
// TODO See https://www.npmjs.com/package/@thi.ng/associative or https://www.npmjs.com/search?q=set+equality
function regionIsVisited(regionString) {
  return visitedRegions.has(regionString)
}

function isSubsequence(subsequence, mainString) {
  let i = 0;
  let j = 0;

  while (i < subsequence.length && j < mainString.length) {
    if (subsequence[i] === mainString[j]) {
      i++;
    }
    j++;
  }

  const result = i === subsequence.length;
  return result
}

function isPotentialWord (region) {
  const subsequence = regionToWord(region, grid)
  return words.some(word => isSubsequence(subsequence, word))
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

  DEBUG && console.time('isPotentialWord')
  const result = unvisitedRegions.filter(isPotentialWord)
  DEBUG && console.timeEnd('isPotentialWord')

  DEBUG && console.timeEnd('nextRegions')
  DEBUG && console.log('')

  return result
}

const printed = {}

for (let row = 0; row < grid.length; row++) {
  for (let col = 0; col < grid[0].length; col++) {
    let regions = [[[row, col]]]

    for (let i = regions[0].length; i <= targetLength; i++) {
      const letters = regions.filter(region => isAllLetters(grid, region)).map(region => regionToWord(region, grid))
      const validWords = letters.filter(word => {
        return sorted.has(words, word)
      })
      validWords.forEach(word => {
        if (printed[word]) {
          return;
        }

        DEBUG && console.log(`FOUND ${word}`) || console.log(word)

        printed[word] = true
      })

      regions = regions.flatMap(region => nextRegions(region, grid))
    }
  }
}
