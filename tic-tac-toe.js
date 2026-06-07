//Gameboard
//the Gameboard represent state of the game.
//board contain cells which are essentially form from the 
//intersection of rows and columns

function Gameboard() {
    const rows = 3;
    const cols = 3;
    const board = [];
    let emptyCells = rows * cols;

    //builds the board as an array of cells
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
        board[rowIndex] = [];
        for (let colIndex = 0; colIndex < cols; colIndex++) {
            board[rowIndex][colIndex] = Cell();
        }
    }

    //board is private so this is how we get board content for UI display
    const getBoard = () => board;

    const isFilled = () => (emptyCells == 0);
    
    const updateEmptyCount = () => { emptyCells-- };

    //controls addTokening the cell in a board
    //how player interact with board
    const move = (row, col, player) => {
        const cell  = board[row][col];

        if (cell.getValue()) {
            return false;
        }
        cell.addToken(player);
        updateEmptyCount();
        return true;

    }

    //the getRow, getColumn, getLeftDiagonal, and getRightDiagonal
    // would help with the game winning logic
    // and the board houses rows and columns
    const getRow = (rowIndex) => {
        const row = board[rowIndex]
        return row.map(
            (cell) => cell.getValue()
        );
    }

    const getColumn = (colIndex) => board.map(
        (row) => row[colIndex].getValue()
    );

    const getDiagonals = () => {
        const diagonals = {
            leftDiagonal : [],
            rightDiagonal: [],
        }

        for (let rowIndex = 0; rowIndex < rows;  rowIndex++) {
            for (let colIndex = 0; colIndex < cols; colIndex++) {
                if (rowIndex == colIndex) {
                const cell = board[rowIndex][colIndex]
                diagonals.leftDiagonal.push(cell.getValue());
                }

            if (rowIndex + colIndex == 2) {
                const cell = board[rowIndex][colIndex]
                diagonals.rightDiagonal.push(cell.getValue());
                }
            }
        }

        return diagonals;
    }

    return {
        move,
        getBoard,
        getRow,
        getColumn,
        getDiagonals,
        isFilled,
    };
};


//Cell the box in Gameboard
//expose the addToken method for changing the value of cell 
//based on player addTokener
function Cell() {
    let value = 0;

    const addToken = (player) => {
        value = player.token;
    }

    //only players should be able to change cell value
    //that is why the value is kept private
    const getValue = () => value;

    return {
        addToken,
        getValue,
    };
};


//GameController, controls game flow

function GameController(
    playerOneName = "player1",
    playerTwoName = "player2",
    start = false
) {
    const board = Gameboard();
    players = [
        {
            name: playerOneName,
            token: 1,
        },
        {
            name: playerTwoName,
            token: 2,
        }
    ];

    liveStatus = {
        turn: "turn",
        error: "error",
        win: "win",
        tie: "tie"
    }

    let activePlayer = players[0];
    let currentStatus = liveStatus.turn;
    let end = !start;

    //activePlayer should be controlled only by GameController
    const getActivePlayer = () => activePlayer;

    const switchTurn = () =>  {
       activePlayer =  activePlayer === players[0] ? players[1] : players[0];
    }

    const changeStatus = (status) => {
        currentStatus = liveStatus[status];
    }

    const getStatus = () => currentStatus;

    const isAWin = (adjacentCells, player) => {
        const match = adjacentCells.filter((value) => (value == player.token))
        
        if (match.length == 3) {
            toggleSwitch();
            return true;
        } return false;
    }

    //to get if a game has ended or still live
    const ended  = () => end;

    const toggleSwitch = () => { end = !(end); }

    
    const playRound = (row, col) => {
 
        //acknowledge valid move only
        const validMove = board.move(row, col, activePlayer);
        if (!validMove) {
            changeStatus("error");
            return;
        }

        //win logic comes here
        if (isAWin(board.getRow(row), activePlayer)){
            changeStatus("win");
            return;
        } else if (isAWin(board.getColumn(col), activePlayer)) {
          
            changeStatus("win");
            return;
        } else if ((row + col ) % 2 == 0) {
            const diagonals = board.getDiagonals()
            if (row == col) {
                if (isAWin(diagonals.leftDiagonal, activePlayer)) {
                    
                    changeStatus("win");
                    return;
                }
            }
            if ((row + col) == 2) {
                if (isAWin(diagonals.rightDiagonal, activePlayer)) {
                    changeStatus("win");
                    return;
                }
            }
        } else if (board.isFilled()) {
     
            changeStatus("tie");
            toggleSwitch();
            return;
        }
    
        
        switchTurn();
    }

    return {
        ended,
        getActivePlayer,
        getStatus,
        getBoard: board.getBoard,
        playRound,
    }

}


//DomController, UI component controller houses all changes to UI

(function DomController() {
    let game = GameController();

    const playersForm = document.querySelector("#players-form");
    const board = document.querySelector(".board");
    const gameStatus = document.querySelector(".game-status");
    const errorStatus = document.querySelector(".error");


    function updateScreen() {
        board.innerHTML = "";
        errorStatus.innerHTML = "";

     

        const activePlayer = game.getActivePlayer();
        const status = game.getStatus();
        const gameBoard = game.getBoard();

        //displaying appropriate status in DOM
        if (game.ended() && (status == "turn")) {
            gameStatus.textContent = "Enter a name (optional) and click Start to begin";
        } else if (status == "turn") {
            gameStatus.textContent = `${activePlayer.name} ${status}`;
        } else if (status == "win") {
            gameStatus.textContent = `${activePlayer.name} ${status}`
        } else if (status == "tie") {
            gameStatus.textContent = "Game ends in a tie"
        } else if (status == "error") {
            errorStatus.textContent = "invalid move, mark another cell"
        }

        //render Board
        gameBoard.forEach(
            (row, rowIndex) => {
                row.forEach(
                    (col, colIndex) => {
                        const cell = document.createElement("button");
                        cell.classList.add("cell");
                        cell.dataset.col = colIndex;
                        cell.dataset.row = rowIndex;

                        //displaying appropriate value
                        const value = col.getValue();
                        if (value != 0) {
                            cell.style.opacity = 0.9;
                        }
                        if (value == 1) {
                            cell.textContent = "X";
                            cell.style.color = "red"
                        } else if (value == 2) {
                            cell.textContent = "O";
                        } else {
                            cell.textContent = "";
                        }

                        board.appendChild(cell);                        
                    }
                );
            }
        );

    }

    //GameStartEntryHandler, for handling game start/form
    function gameStartEntryHandler(event) {
        event.preventDefault();
        const playersForm =  new FormData(event.target);
        const playersData = Object.fromEntries(playersForm.entries())

        game = GameController(
            playersData.player1 || "player1", 
            playersData.player2 || "player2",
            true
        );

        updateScreen();
    }

    //handles board clicking
    function clickBoardHandler(event) {
        let { row, col } = event.target.dataset;
        
        if (game.ended()){
            errorStatus.textContent = "please press the start button to play";
            return;
        }

        [ row, col ] = [ Number(row), Number(col)];
        game.playRound(row, col);
        
        updateScreen();
    }

    playersForm.addEventListener("submit", gameStartEntryHandler);

    board.addEventListener("click", clickBoardHandler);

    updateScreen();

})();