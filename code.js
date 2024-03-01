const rows = 50
const cols = 50

let playing = false

const grid = new Array(rows) //both arrays must be a new array
const nextGrid = new Array(rows)

let timer
const reproductionTime = 100

function initializeGrids() {
  // adds arrays to both grid and nextgrid.
  for (let i = 0; i < rows; i++) {
    // Booth arrays are the same size, so one loop is enough. For every row, the loop adds columns in both grid and nextGrid.
    grid[i] = new Array(cols)
    nextGrid[i] = new Array(cols)
  } // we call this function in the initialize-function.
}

function resetGrids() {
  // Loops trough both arrays and sets i and j to 0.
  // function to clear out the two arrays above. Resetes all cells to dead.
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid[i][j] = 0
      nextGrid[i][j] = 0
    } // we call this function in the initialize-function.
  }
}

function copyAndresetGrid() {
  // goes thru, and copies the nextGrid-array to the grid-array and sets the nextGrid to 0.
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid[i][j] = nextGrid[i][j]
      nextGrid[i][j] = 0
    } // Now this becomes the current state.
  }
}

// initialize (calls other functions to initalize)
function initialize() {
  createTable()
  initializeGrids()
  resetGrids()
  setupControlButtons()
}
////////////////////////////////////////////////
// lay out the board and create the grid.
function createTable() {
  const gridContainer = document.getElementById('gridContainer')

  if (!gridContainer) {
    // throw error
    console.error('Problem: no div for the grid table"')
  }

  const table = document.createElement('table')

  for (let i = 0; i < rows; i++) {
    //iterates over all rows.
    let tr = document.createElement('tr')
    for (let j = 0; j < cols; j++) {
      // iterates over all columns.
      let cell = document.createElement('td')
      cell.setAttribute('id', i + '_' + j) // creates id for each cell with the i and j.
      cell.setAttribute('class', 'dead') // add classes (all cells are dead from the beginning.)
      cell.onclick = cellClickHandler
      tr.appendChild(cell) // appending the cell to the table-row-element.
    }
    table.appendChild(tr) // appending the //tr-element to the table.This ends the outer loop.
  }
  gridContainer.appendChild(table) // appending the table to the gridcontainer.
}
/////////////////Handle clicks on cells ///////////////////////
function cellClickHandler() {
  const rowcol = this.id.split('_') // we split the values from the  _ in the created HTML's id.
  const row = rowcol[0] // value before _
  const col = rowcol[1] // value after _  // we use theese to determine the row and column in the cell.
  let classes = this.getAttribute('class') // get classattribute with this.notation, this returns a string with values.
  if (classes.indexOf('live') > -1) {
    // We check if the clicked cell contains the string 'live'. If it does, we want it to be set to 'dead'.
    this.setAttribute('class', 'dead')
    grid[row][col] = 0
  } else {
    this.setAttribute('class', 'live')
    grid[row][col] = 1
  }
}
////////////
function updateView() {
  // looks thru every cell, and updates the current view.
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      // each cell has an id for row and column, that is how the function knows.
      const cell = document.getElementById(i + '_' + j)
      if (grid[i][j] == 0) {
        cell.setAttribute('class', 'dead') // if cell is 0
      } else {
        cell.setAttribute('class', 'live') // if cell is 1
      }
    }
  }
}
///////////// Button clickhandlers ///////////////////
function setupControlButtons() {
  // button to start
  const startButton = document.getElementById('start')
  startButton.onclick = startButtonHandler
  //button to clear
  const clearButton = document.getElementById('clear')
  clearButton.onclick = clearButtonHandler
  // button to set random live cells
  const randomButton = document.getElementById('random')
  randomButton.onclick = randomButtonHandler
}

function clearButtonHandler() {
  console.log('Clear the game: stop playing, clear the grid')
  playing = false // set playing to false, to stop playing.
  const startButton = document.getElementById('start')
  startButton.innerHTML = 'start' // change text on button to start.
  clearTimeout(timer)

  const cellsList = document.getElementsByClassName('live')
  const cells = [] // iterating over each cell and copying it into the new array cells.
  for (let i = 0; i < cellsList.length; i++) {
    cells.push(cellsList[i]) //pushing the items into the new array.Fixing the bug that the nodelist did'nt return the whole array, when we changed from live to dead.
  }
  for (let i = 0; i < cells.length; i++) {
    cells[i].setAttribute('class', 'dead')
  }
  resetGrids()
}

function startButtonHandler() {
  if (playing) {
    console.log('Pause the game') // if game is playing (true) we need to set playing to false:
    playing = false
    this.innerHTML = 'continue' // set the text on button to continue.
    clearTimeout(timer) // clears the timer.
  } else {
    // if playing is false, the game is paused or not started yet.
    console.log('Continue the game')
    playing = true // set playing to true.
    this.innerHTML = 'pause'
    play() // calling the function play, to start the game.
  }
}

function randomButtonHandler() {
  if (playing) return
  clearButtonHandler()
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      var isLive = Math.round(Math.random())
      if (isLive == 1) {
        var cell = document.getElementById(i + '_' + j)
        cell.setAttribute('class', 'live')
        grid[i][j] = 1
      }
    }
  }
}

// run the game
function play() {
  computeNextgen() // play calls computeNextgen, and sets a timer to delay a little.

  if (playing) {
    timer = setTimeout(play, reproductionTime)
  }
}

function computeNextgen() {
  // iterates over all cells in the grid, calls applyRules
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      applyRules(i, j)
    }
  }
  // copy nextGrid to grid, and reset nextGrid:
  copyAndresetGrid()
  //copy all values to "live" in the table:
  updateView()
}

// RULES OF THE GAME ///
// Any live cell with fewer than two live neighbours dies, as if caused by under-population.
// Any live cell with two or three live neighbours lives on to the next generation.
// Any live cell with more than three live neighbours dies, as if by overcrowding.
// Any dead cell with exactly three living neighbours becomes a live cell, as if by reproduction.
function applyRules(row, col) {
  // applys the rules to each cell, one at a time. Uses countHeighbours to count the number of live neighbours that cell has.Passing in the row and col we currently are working on.
  const numNeighbours = countNeighbours(row, col)
  if (grid[row][col] == 1) {
    // if current cell is alive grid at col, row will be 1.
    if (numNeighbours < 2) {
      // if number of neighbours alive is less than 2- cell dies.
      nextGrid[row][col] = 0 // therfore we store 0 in this location.
    } else if (numNeighbours == 2 || numNeighbours == 3) {
      // if 2 or 3 neighbour-cells are alive, current cell stays alive too.
      nextGrid[row][col] = 1 // therefore we store 1 in nextGrid.
    } else if (numNeighbours == 3) {
      // if live neighbours are > 3, the cell dies.
      nextGrid[row][col] = 0 // therefore we store 0.
    }
  } else if (grid[row][col] == 0) {
    // if current cell is dead:
    if (numNeighbours == 3) {
      //and has exactly 3 neighbours;
      nextGrid[row][col] = 1
      {
        //we update the cell to be alive,
        nextGrid[row][col] = 1 // therefore we store 1.
      }
    }
  }
}

function countNeighbours(row, col) {
  // keeps track of how many neighbours current cell has.
  let count = 0
  if (row - 1 >= 0) {
    // row above (row-1) is bigger or = to 0, meaning that row exists.
    if (grid[row - 1][col] == 1) count++ // check if the cell is a 1. If so, increase count. (Don´t work for first row)
  }
  if (row - 1 >= 0 && col - 1 >= 0) {
    // checking upper left corner of current cell.
    if (grid[row - 1][col - 1] == 1) count++
  }

  if (row - 1 >= 0 && col + 1 < cols) {
    // checking upper right corner.
    if (grid[row - 1][col + 1] == 1) count++
  }

  if (col - 1 >= 0) {
    // checking left.
    if (grid[row][col - 1] == 1) count++
  }

  if (col + 1 < cols) {
    // checking right.
    if (grid[row][col + 1] == 1) count++
  }

  if (row + 1 < rows) {
    // checking directly below.
    if (grid[row + 1][col] == 1) count++
  }

  if (row + 1 < rows && col - 1 >= 0) {
    // checking lower left.
    if (grid[row + 1][col - 1] == 1) count++
  }

  if (row + 1 < rows && col + 1 < cols) {
    // checking lower right.
    if (grid[row + 1][col + 1] == 1) count++
  }

  return count
}

// start everything and sets up the game so its readey
window.onload = initialize
