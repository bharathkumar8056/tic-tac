const board = document.querySelector('.board');
const cells = Array.from({ length: 9 }, () => null);
let currentPlayer = 'X';
let user1Score = 0;
let user2Score = 0;
let isTwoPlayerMode = false;

function createBoard() {
  board.innerHTML = '';
  cells.fill(null);
  cells.forEach((cell, index) => {
    const cellElement = document.createElement('div');
    cellElement.classList.add('cell');
    cellElement.dataset.index = index;
    cellElement.addEventListener('click', handleCellClick);
    board.appendChild(cellElement);
  });
}

function handleCellClick(event) {
  const clickedCell = event.target;
  const index = clickedCell.dataset.index;
  if (cells[index] !== null) return;
  cells[index] = currentPlayer;
  renderBoard();
  if (checkWin(currentPlayer)) {
    if (currentPlayer === 'X') {
      user1Score++;
      document.getElementById('user1Score').textContent = user1Score;
    } else {
      user2Score++;
      document.getElementById('user2Score').textContent = user2Score;
    }
    showResult(`${currentPlayer} wins!`);
    return;
  }
  if (checkDraw()) {
    showResult("It's a draw!");
    return;
  }
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  if (!isTwoPlayerMode && currentPlayer === 'O') {
    makeAiMove();
  }
}

function renderBoard() {
  cells.forEach((cell, index) => {
    const cellElement = document.querySelector(`[data-index="${index}"]`);
    cellElement.textContent = cell;
    cellElement.className = 'cell';
    if (cell) {
      cellElement.classList.add(cell.toLowerCase());
    }
  });
}

function checkWin(player) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];
  return winPatterns.some(pattern => pattern.every(index => cells[index] === player));
}

function checkDraw() {
  return cells.every(cell => cell !== null);
}

function resetGame() {
  cells.fill(null);
  renderBoard();
  currentPlayer = 'X';
  document.getElementById('resultModal').classList.remove('show');
}

function showResult(message) {
  document.getElementById('resultMessage').textContent = message;
  document.getElementById('resultModal').classList.add('show');
}

function makeAiMove() {
  const emptyCells = cells.reduce((acc, cell, index) => {
    if (cell === null) acc.push(index);
    return acc;
  }, []);
  const randomChance = Math.random();
  let move;
  if (randomChance < 0.7) {
    move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  } else {
    move = findBestMove();
  }
  cells[move] = currentPlayer;
  renderBoard();
  if (checkWin(currentPlayer)) {
    user2Score++;
    document.getElementById('user2Score').textContent = user2Score;
    showResult(`${currentPlayer} wins!`);
    return;
  }
  if (checkDraw()) {
    showResult("It's a draw!");
    return;
  }
  currentPlayer = 'X';
}

function findBestMove() {
  let bestScore = -Infinity;
  let move;
  cells.forEach((cell, index) => {
    if (cell === null) {
      cells[index] = 'O';
      let score = minimax(cells, 0, false);
      cells[index] = null;
      if (score > bestScore) {
        bestScore = score;
        move = index;
      }
    }
  });
  return move;
}

function minimax(board, depth, isMaximizing) {
  let scores = {
    'X': -1,
    'O': 1,
    'draw': 0
  };

  let winner = checkWinner();
  if (winner !== null) {
    return scores[winner];
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    board.forEach((cell, index) => {
      if (cell === null) {
        board[index] = 'O';
        let score = minimax(board, depth + 1, false);
        board[index] = null;
        bestScore = Math.max(score, bestScore);
      }
    });
    return bestScore;
  } else {
    let bestScore = Infinity;
    board.forEach((cell, index) => {
      if (cell === null) {
        board[index] = 'X';
        let score = minimax(board, depth + 1, true);
        board[index] = null;
        bestScore = Math.min(score, bestScore);
      }
    });
    return bestScore;
  }
}

function checkWinner() {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return cells[a];
    }
  }
  if (cells.every(cell => cell !== null)) {
    return 'draw';
  }
  return null;
}

document.addEventListener('DOMContentLoaded', () => {
  const gameModeModal = document.createElement('div');
  gameModeModal.className = 'modal show';
  gameModeModal.innerHTML = `
    <div class="message">Select Game Mode</div>
    <button onclick="startGame(true)">Two Player</button>
    <button onclick="startGame(false)">Player vs AI</button>
  `;
  document.body.appendChild(gameModeModal);

  window.startGame = (twoPlayer) => {
    isTwoPlayerMode = twoPlayer;
    gameModeModal.classList.remove('show');
    createBoard();
  };
});

createBoard();
