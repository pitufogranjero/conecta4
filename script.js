// TODO
// corregir la ubicación de las pieces para que estén en el div correcto sin que afecte a la posición en pantalla tras la animacion
// log div para mostrar el histórico de movimientos
// almacenar el log en un archivo histórico con fecha, id de partida, etc.

// DONE
// completar la funcion que verifica si hay 4 consecutivas en DIAGONAL
// crear las funciones para "1 player" y "2 players"
// diseñar el prompt para preguntar a chatGPT cual sería la siguiente jugada
// limitar para que no puedas jugar cuando esta blur
// limitar el numero de fichas en una columna a 6

// variables
const rows = 6;
const cols = 7;
let board = [];
let colorTurn = getRandomColor();
let games = 0;
let WINNER = 0;
let PLAYERS = 0;
let IA_COLOR = 0;
let PLAYER_COLOR = 0;
let LEVEL = '';
let allowClick = false;
let freeSpot = [0,0,0,0,0,0,0]
const TEMPERATURE = 0;
let playerOneColor = '';
let playerTwoColor = '';

// clases
// declaro la variable game de forma global porque ahí voy a definir las partidas
let game;

// ##########################
// ### construyo el board ###
// ##########################

function setBoard(rows,cols){
    board = [];

    const boardDiv = document.getElementById('board');

    for (let r = rows-1; r >= 0; r--){

        const rowContainer = document.createElement('div');
        rowContainer.classList.add(`row`);
        rowContainer.classList.add(`${r}`);
        boardDiv.appendChild(rowContainer)

        for (let c = 0; c < cols; c++){
            
            const tile = document.createElement('div');
            tile.classList.add(`cell`);
            tile.classList.add(`col-${c}`);
            tile.classList.add(`row-${r}`);
            rowContainer.appendChild(tile);
            const hole = document.createElement('div');
            hole.classList.add('hole');
            tile.appendChild(hole);
        }
    }
    const restartButton = document.createElement('button');
    restartButton.classList.add('button');
    restartButton.setAttribute('id', 'restart-button');
    restartButton.textContent = 'Restart';
    document.getElementById('restart').appendChild(restartButton)
}
// creo el tablero
setBoard(rows,cols);
addBlur();

// ##############################
// ### construyo players-info ###
// ##############################

const playersInfo = document.getElementById('players-info');

function setPlayersInfo(color1,color2,playerMessage){
    const playerOneIndicator = document.createElement('div');
    const turnInfo = document.createElement('div');
    const playerTwoIndicator = document.createElement('div');

    playerOneIndicator.classList.add('player');
    playerOneIndicator.classList.add('one');
    playerOneIndicator.id = ('player-one');


    turnInfo.classList.add('turn-info');
    turnInfo.setAttribute('id','turn-info');
    
    playerTwoIndicator.classList.add('player');
    playerTwoIndicator.classList.add('two');
    playerTwoIndicator.id = ('player-two');

    playersInfo.innerHTML = '';
    playersInfo.appendChild(playerOneIndicator);
    playersInfo.appendChild(turnInfo);
    playersInfo.appendChild(playerTwoIndicator);

    const pieceOne = document.createElement('div');
    const pieceTwo = document.createElement('div');

    pieceOne.innerHTML = '';
    pieceOne.classList.add('piece');
    pieceOne.classList.add('one');
    pieceOne.classList.add(color1);

    pieceTwo.innerHTML = '';
    pieceTwo.classList.add('piece');
    pieceTwo.classList.add('two');
    pieceTwo.classList.add(color2);

    playerOneIndicator.appendChild(pieceOne);
    playerTwoIndicator.appendChild(pieceTwo);

    const actualTurn = document.getElementById('turn-info');
    // actualTurn.innerHTML = `<span>${playerMessage}:&nbsp;</span>`;
    actualTurn.innerHTML = playerMessage;
    // actualTurn.innerHTML += `<span id='turn' class='${colorTurn}-text'>${colorTurn}</span>`;
    // actualTurn.innerHTML += `<div class="piece ${colorTurn}" style="width:40px; display:flex"></div>`;
    const actualTurnIndicator = document.getElementById('turn');
    
}

// creo los botones de players y levels
const onePlayerButton = document.createElement('button');
onePlayerButton.classList.add("button");
onePlayerButton.setAttribute('id', '1-player');
onePlayerButton.textContent = "1 Player";

const twoPlayerButton = document.createElement('button');
twoPlayerButton.classList.add("button");
twoPlayerButton.setAttribute('id', '2-player');
twoPlayerButton.textContent = "2 Player";

const easyButton = document.createElement('button');
easyButton.classList.add("button");
easyButton.setAttribute('id', 'easy-button');
easyButton.textContent = "Easy";

const hardButton = document.createElement('button');
hardButton.classList.add("button");
hardButton.setAttribute('id', 'hard-button');
hardButton.textContent = "Hard (IA)";

const restartButton = document.getElementById('restart-button');

const playerInfo = document.getElementById('players-info');

const turnSpan = document.querySelector("#turn");

const divWinner = document.querySelector('.winner');



// Carga inicial del juego
restartBoard();
showPlayersButtons();

// capturo los clicks en los botones
onePlayerButton.addEventListener('click', chooseOnePlayer);
twoPlayerButton.addEventListener('click', chooseTwoPlayer);

easyButton.addEventListener('click', chooseEasyLevel)
hardButton.addEventListener('click', chooseHardLevel)

if(restartButton){
    restartButton.addEventListener('click', () => {
        showPlayersButtons();
        restartGame();
        addBlur();
    });
}

// de la lista de clases obtenida, selecciono la que es numerica
function numericClass(list){
    let numberClass = 0;
    for (let i = 0; i < list.length; i++) {
        if (list[i].startsWith('col-')) {
            numberClass = parseInt(list[i].substr(4));
        }
    }
    return numberClass;
}

// animar la caída de la ficha hasta su posición 
function animatePiece(color,column,row){
    // console.log(row)
    const divStart = document.querySelector('.cell.col-'+column+'.row-5');
    const divEnd = document.querySelector('.cell.col-'+column+'.row-'+row);
    const piece = document.querySelector('.piece.'+color+'.turn-'+games);
    const four = document.querySelector('.number-four-'+color+'.game-'+games);
    // console.log(piece)
    // console.log(four)

    const startY = divStart.offsetTop + divStart.offsetHeight / 2;
    const finalY = divEnd.offsetTop + divEnd.offsetHeight / 2 - startY;
    
    piece.style.transform = `${startY}px)`;// rotate(${getRandomRotation()}deg)`;
    setTimeout(() => {
        piece.style.transform = `translateY(${finalY}px)`; // rotate(${getRandomRotation()}deg)`;
        piece.style.transition= 'all 0.5s ease-in';
    }, 0);

    four.style.transform = `rotate(${getRandomRotation()}deg)`;
    setTimeout(() => {
        four.style.transform = `translateY(8px) rotate(${getRandomRotation()}deg)`;
        four.style.transition= 'all 0.5s ease-in';
    }, 0);


    piece.classList.remove('row-5');
    piece.classList.add('row-'+row);
}

// resaltar el color correspondiente al turno actual
function highlightTurn(actualTurn){
    const playerOneIndicator = document.getElementById('player-one');
    const playerTwoIndicator = document.getElementById('player-two');
    
    if (playerOneColor == actualTurn){
        playerTwoIndicator.classList.remove('highlight')
        playerOneIndicator.classList.add('highlight')
    } else if (playerTwoColor == actualTurn){
        playerOneIndicator.classList.remove('highlight')
        playerTwoIndicator.classList.add('highlight')
    }

}

// marcar el turno que toca y cambiarlo al hacer click
function changeTurn(){
    // playerOneColor = swapColors(playerTwoColor);
    // playerTwoColor = swapColors(playerOneColor);
    console.log('change turn')
    colorTurn = swapColors(colorTurn);
    
    
    // si hay cambio de turno y estamos en modo 1 player, miro si le toca jugar a la máquina
    if (PLAYERS == 1 && LEVEL == 'hard' && colorTurn == PLAYER_COLOR) {
        // console.log('--> turn to player');
        setPlayersInfo(PLAYER_COLOR,IA_COLOR,'Your Turn');
    }
    else if (PLAYERS == 1 && LEVEL == 'easy' && colorTurn == PLAYER_COLOR) {
        // console.log('--> turn to player');
        setPlayersInfo(PLAYER_COLOR,IA_COLOR,'Your Turn');
    }
    else if (PLAYERS == 1 && LEVEL == 'hard' && colorTurn == IA_COLOR) {
        // console.log('--> turn to IA');
        setPlayersInfo(PLAYER_COLOR,IA_COLOR,'Turn to IA');
        iaPlay(board,IA_COLOR);
    }
    else if (PLAYERS == 1 && LEVEL == 'easy' && colorTurn == IA_COLOR) {
        // console.log('--> turn to Computer');
        setPlayersInfo(PLAYER_COLOR,IA_COLOR,'Turn to Computer');
        easyPlay(IA_COLOR);
    }
    highlightTurn(colorTurn);
}

// pintar la ficha en el primer sitio libre
function putPiece(column){
    for(let i=0; i<6; i++){
        freeSpot[column] = color;
        }
}
function paintPiece(column,color,freeSpot){
    const divCell = document.querySelector('.cell.col-'+column+'.row-5'); //+freeSpot[column])
    // console.log(divCell.classList)
    // divCell.removeChild(divCell.firstChild);
    const divPiece = document.createElement('div');
    divPiece.classList.add('piece');
    divPiece.classList.add('turn-'+games);
    divPiece.classList.add(color);
    const divNumber4 = document.createElement('div');
    divNumber4.classList.add('number-four-'+color);
    divNumber4.classList.add('game-'+games);
    divNumber4.textContent = '4';
    divCell.appendChild(divPiece);
    divPiece.appendChild(divNumber4);

}

// #################################
// ### COMPROBACION DE GANADORES ###
// #################################

// comprobar si hay 4 fichas consecutivas iguales en las filas
function checkHorizontals (board,color){
    let sum = 1;
    // console.log(printBoard(board))
    console.log('check horizontals '+color)
    // console.log('rows '+board.length)
    // console.log('cols '+board[0].length)
    // console.log('sum '+sum)
    // recorro las filas
    for (let row = 0; row < board.length-3; row++) {
        // console.log('row number '+row)
        // recorro las columnas
        for(let col = 0; col < board[row].length; col++){
            // console.log('col number '+col)
            // console.log('posicion '+board[row][col]);
            if (board[row][col+1] == color && board[row][col] == color) {
                sum = sum + 1;
                // console.log(color+' fila '+i+' suma '+sum)
            } else {
                sum = 1;
                // console.log(color+' fila '+i+' suma '+sum)
            }
            if (sum == 4) return true;
        }
    }

}

// comprobar si hay 4 fichas consecutivas iguales en las columnas
function checkVerticals(board,color) {
    let sum = 1;
    console.log('check verticals '+color)
    // recorro las columnas
    for(let col = 0; col < board[0].length-1; col++){
        // recorro las filas
        for (let row = 0; row < board.length-1; row++) {
            // console.log('row '+row+' col '+col+' piece '+board[row][col])
            if (board[row+1][col] == color && board[row][col] == color) {
                sum = sum + 1;
                // console.log(color+' fila '+row+' suma '+sum)
            } else {
                sum = 1;
            }
            if (sum == 4) return true;
        }
    }
}

// comprobar si hay 4 fichas consecutivas iguales en las diagonales
function checkDiagonals(board,color) {
    let sum = 1;
    console.log('check diagonals '+color)
    // primero compruebo una de las diagonales
    // recorro las columnas
    for(let col = 0; col < board[0].length; col++){
        // recorro las filas
        for (let row = 0; row < board.length; row++) {
            console.log('row '+row+' col '+col+' piece '+board[row][col]+' suma '+sum)
            if (board[row][col] == color && board[row+1][col+1] == color && board[row+2][col+2] == color && board[row+3][col+3] == color) {
                sum = sum + 1;
            } else {
                sum = 1;
            }
            if (sum == 4) return true;
        }
    }
    // ahora compruebo la otra de las diagonales
    sum = 1;
    // recorro las columnas
    for(let col = 0; col < board[0].length; col++){
        // recorro las filas
        for (let row = 0; row < board.length; row++) {
            // console.log('row '+row+' col '+col+' piece '+board[row][col])
            if (board[row][col] == color && board[row-1][col+1] == color && board[row-2][col+2] == color && board[row-3][col+3] == color) {
                sum = sum + 1;
                // console.log(color+' fila '+row+' suma '+sum)
            } else {
                sum = 1;
            }
            if (sum == 4) return true;
        }
    }
}

// si hay ganador marcarlo
function checkWinner(board, rows, cols){
    printBoard(board);
    console.log('is there a winner?')
    // horizontal
    for (let r=0; r<rows; r++){
        for (let c=0; c<cols-3; c++){
            if (board[r][c] != 0){
                if (board[r][c] == board[r][c+1] && board[r][c+1] == board[r][c+2] && board[r][c+2] == board[r][c+3]){
                    winnerMessage(board[r][c]);
                }
            }
        }
    }
    // vertical
    for (let c=0; c<cols; c++){
        for (let r=0; r<rows-3; r++){
            if (board[r][c] != 0){
                if (board[r][c] == board[r+1][c] && board[r+1][c] == board[r+2][c] && board[r+2][c] == board[r+3][c]){
                    winnerMessage(board[r][c]);
                }
            }
        }
    }
    // diagonal 1
    for (let r=0; r<rows-3; r++){
        for (let c=0; c<cols-3; c++){
            if (board[r][c] != 0){
                if (board[r][c] == board[r+1][c+1] && board[r+1][c+1] == board[r+2][c+2] && board[r+2][c+2] == board[r+3][c+3]){
                    winnerMessage(board[r][c]);
                }
            }
        }
    }
    // diagonal 2
    for (let r=3; r<rows; r++){
        for (let c=0; c<cols-3; c++){
            if (board[r][c] != 0){
                if (board[r][c] == board[r-1][c+1] && board[r-1][c+1] == board[r-2][c+2] && board[r-2][c+2] == board[r-3][c+3]){
                    winnerMessage(board[r][c]);
                }
            }
        }
    }
    // try {
    //     if (checkHorizontals(board, 'yellow') || checkVerticals(board, 'yellow') || checkDiagonals(board, 'yellow')) {
    //         winnerMessage('yellow');
    //         return;
    //     }

    //     if (checkHorizontals(board, 'red') || checkVerticals(board, 'red') || checkDiagonals(board, 'red')) {
    //         winnerMessage('red');
    //         return;
    //     }

    //     } catch (error) {
    //     // Manejar errores si es necesario
    //     }
}

// winner message
function winnerMessage(color){
    WINNER = color;
    allowClick = false;
    // alert(color)
    
    const divWinner = document.getElementById('turn-info')
    // playerInfo.innerHTML = divWinner;
    // console.log(divWinner)
    divWinner.innerHTML = "";
    divWinner.innerHTML = 'The winner is '+color;
    divWinner.classList.add(color);
    console.log(game.getPlays());
    // document.getElementById('plays-history').textContent = game.getPlays();
}

// restart game
function restartGame() {
    // alert('El juego se ha reiniciado.'); 
    
    colorTurn = getRandomColor();
    games = 0;
    freeSpot = [0,0,0,0,0,0,0];

    playersInfo.innerHTML = "";

    // borro el mensaje de winner
    // document.querySelector('.winner').innerHTML = "";
    // document.querySelector('.winner').classList.remove('red');
    // document.querySelector('.winner').classList.remove('yellow');

    // borro el mensaje de playerInfo
    // playerInfo.textContent = '';

    erasePieces();
    restartBoard()

    WINNER = 0;
    showPlayersButtons();
}

// borrar las fichas del tablero
function erasePieces(){
    const pieces = document.querySelectorAll('.piece');
    pieces.forEach(piece => {
        piece.parentNode.removeChild(piece);
    });
}

// reinicio board
function restartBoard(){
    board = [
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0]
        ]
}

// aleatorio para calcular quien empieza
function getRandomColor() {
    const colors = ["red", "yellow"];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

// aleatorio para calcular la columna en el nivel facil
function getRandomColumn() {
    return Math.floor(Math.random() * 7);
}

// aleatorio para simular la rotacion de la ficha
function getRandomRotation() {
    return Math.floor(Math.random() * 360);
}

// me devuelve el otro color
function swapColors(inputColor) {
    const colorMap = {
        'yellow': 'red',
        'red': 'yellow'
    };
    if (colorMap.hasOwnProperty(inputColor)) {
        return colorMap[inputColor];
        } else {
            return 'Color not found';
        }
    }

function checkFullColumn(freeSpot){
    let message = '';
    for (let c=0; c<freeSpot.length; c++){
        if(freeSpot[c] == 6){
            message += `\nLa columna ${c}, está llena y no puedes jugar en ella.`;
        }
    }  
    return message;
}

function randomWait() {
    const randomTime = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(); 
        }, randomTime);
    });
}

async function easyPlay(IA_COLOR){
    const columnSelected = getRandomColumn();
    await randomWait();
    paintPiece(columnSelected,IA_COLOR);
    animatePiece(colorTurn,columnSelected,freeSpot[columnSelected])
    freeSpot[columnSelected] = freeSpot[columnSelected] + 1;
    board[6-freeSpot[columnSelected]][columnSelected] = colorTurn;
    
    allowClick = true;

    checkWinner(board,board.length,board[0].length);
    if (WINNER == 0) changeTurn();

    // clases
    game.doPlay(columnSelected, 'player 2', 'computer', IA_COLOR);

}

// #################################
// ############ chatGPT ############
// #################################

const url_chatGPT = 'https://api.openai.com/v1/chat/completions';
import TOKEN from './js/config.js';
const apiKey = TOKEN;
// funcion de espera para que la IA devuelva una jugada
async function iaPlay(board,IA_COLOR){
    console.log('ejecuto iaPlay')
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer "+apiKey);
    
    const prompt = `Estamos jugando a Conecta 4 tu eres un profesional que me va a impedir ganar y tu color es el ${IA_COLOR}, ahora es tu turno y el tablero es el siguiente: \nfila superior o 0: ${board[0]}\nfila 1: ${board[1]}\nfila 2: ${board[2]}\nfila 3: ${board[3]}\nfila 4: ${board[4]}\nfila 5: ${board[5]},\n¿cual sería tu próxima jugada? \nTen en cuenta que:${checkFullColumn(freeSpot)}\nno puedes jugar siempre en la misma columna\nSi ves que hay posibilidad que yo haga cuatro colores consecutivos, bien sea de forma horizontal, diagonal o vertical, debes tratar de evitarlo poniendo tu ficha en la columna que no me permita ganar\n\nRespóndeme sólo con el número de columna donde pondrías tu siguiente ficha.\nLimitate sólo a responder con el dígito de la columna, es decir, un numero del 0 al 6`;
    console.log(prompt)

    var raw = JSON.stringify({
        "model": "gpt-3.5-turbo",
        "messages": [
            {
            "role": "user",
            "content": prompt
            }
        ],
        "temperature": TEMPERATURE
    });

    var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
    };

    // console.log(raw)

    try {
        const response = await fetch(url_chatGPT, requestOptions);
    
        if (!response.ok) {
            throw new Error('La solicitud no se completó correctamente.');
        }
        const data = await response.json(); 
        let columnSelected = null;

        while (!columnSelected) {
            columnSelected = data.choices[0].message.content;
            columnSelected = columnSelected.match(/[0-6]/);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('la columna elegida por la IA es: ' + columnSelected);
        paintPiece(columnSelected,colorTurn);
        animatePiece(colorTurn,columnSelected,freeSpot[columnSelected])
        freeSpot[columnSelected] = freeSpot[columnSelected] + 1;
        board[6-freeSpot[columnSelected]][columnSelected] = colorTurn;
        
        allowClick = true;

        // clases
        game.doPlay(columnSelected, 'player 2', 'computer', IA_COLOR);


        checkWinner(board,board.length,board[0].length);
        if (WINNER == 0) changeTurn();

        } catch (error) {
        console.error('Error:', error);
        }
    }


// desenfoques
function removeBlur() {
    allowClick = true;
    document.getElementById('board').classList.remove('blur');
    // document.getElementById('actual-turn').classList.remove('blur');
    document.getElementById('restart-button').classList.remove('blur');
}
function addBlur() {
    allowClick = false;
    document.getElementById('board').classList.add('blur');
    // document.getElementById('actual-turn').classList.add('blur');
    document.getElementById('restart-button').classList.add('blur');
    // document.getElementById('players-info').classList.add('blur');
}

// imprimir en console.log amigablemente el tablero
function printBoard(board){
    for (let i = 0; i < board.length; i++) {
        console.log(`${i}: ${board[i].join(', ')}`);
    }
}

// ###################################
// ### funciones para los botones ####
// ###################################

function chooseTwoPlayer(){
    PLAYERS = 2;
    allowClick = true;
    hidePlayersButtons();
    playerOneColor = getRandomColor();
    playerTwoColor = swapColors(playerOneColor);
    setPlayersInfo(playerOneColor,playerTwoColor,'Next turn');
    highlightTurn(colorTurn);
    // restartGame();
    removeBlur();
    // setBoard(rows,cols);
    printConsole();

    // clases
    game = new connectFourGame(2, '', playerOneColor, playerTwoColor);
    // console.log(game.getPlays());
}

function chooseOnePlayer(){
    hidePlayersButtons();
    showLevelButtons();
    PLAYERS = 1;

    if(IA_COLOR == 'yellow') PLAYER_COLOR = 'red';
    else PLAYER_COLOR = 'yellow';
    // printConsole();
}

function chooseEasyLevel(){
    LEVEL = 'easy';
    // alert('not implemented yet');
    // restartGame();
    PLAYER_COLOR = getRandomColor();
    IA_COLOR = swapColors(PLAYER_COLOR);
    playerOneColor = PLAYER_COLOR;
    playerTwoColor = IA_COLOR;

    if (colorTurn == PLAYER_COLOR) {
        setPlayersInfo(playerOneColor,playerTwoColor,'Your Turn');
        allowClick = true;
    }
    else if (colorTurn == IA_COLOR){
        allowClick = false;
        setPlayersInfo(playerOneColor,playerTwoColor,'Turn to Computer');
        // aquí pongo la funcion para que juegue el nivel easy
        easyPlay(IA_COLOR);
    }
    highlightTurn(colorTurn);
    removeBlur();
    hideLevelButtons();
    hidePlayersButtons();
    printConsole();

    // clases
    game = new connectFourGame(2, LEVEL, playerOneColor, playerTwoColor);
    // console.log(game.getPlays());
}

function chooseHardLevel(){
    LEVEL = 'hard';
    // changeTurn();
    PLAYER_COLOR = getRandomColor();
    IA_COLOR = swapColors(PLAYER_COLOR);
    playerOneColor = PLAYER_COLOR;
    playerTwoColor = IA_COLOR;
    
    if (colorTurn == PLAYER_COLOR) {
        setPlayersInfo(playerOneColor,playerTwoColor,'Your Turn');
        allowClick = true;
    }
    else if (colorTurn == IA_COLOR){
        allowClick = false;
        setPlayersInfo(playerOneColor,playerTwoColor,'Turn to IA');
        iaPlay(board,IA_COLOR);
    }
    highlightTurn(colorTurn)
    removeBlur();
    hideLevelButtons();
    hidePlayersButtons();
    printConsole();

    // clases
    game = new connectFourGame(2, LEVEL, playerOneColor, playerTwoColor);
    // console.log(game.getPlays());
}

// #########################################
// ###### mostrar/ocultar los botones ######
// #### de numero de players en su capa ####
// #########################################

function showPlayersButtons(){
    document.getElementById('choose-player-number').appendChild(onePlayerButton);
    document.getElementById('choose-player-number').appendChild(twoPlayerButton);
}
function hidePlayersButtons(){
    document.getElementById('choose-player-number').innerHTML = "";
}

// ############################################
// ######## mostrar/ocultar los botones #######
// #### de numero de dificultad en su capa ####
// ############################################

function showLevelButtons(){
    document.getElementById('choose-level').appendChild(easyButton);
    document.getElementById('choose-level').appendChild(hardButton);
}
function hideLevelButtons(){
    document.getElementById('choose-level').innerHTML = "";
}


// ###################################
// ############# prints ##############
// ###################################

function printConsole(){
    // console.log(board);
    // console.log(freeSpot);
    // console.log(`turn: ${colorTurn}`)
    // console.log(`next free row: ${freeSpot[columnClicked]}`)
    // console.log(`clicked on column: ${columnClicked}`)
    // console.log(printBoard(board));
    console.log(`Game:\nPlayers ${PLAYERS}\nLevel ${LEVEL}\nWinner ${WINNER}\nIAColor ${IA_COLOR}\nTurn ${colorTurn}\nallowClick ${allowClick}\nPlayer 1 ${playerOneColor}\nPlayer 2 ${playerTwoColor}`);
    
    // clases
    // const plays = game.getPlays();
    // console.log(plays); 
    // console.log(game.getPlays())
    // console.log(game.getPlays())
    // showPlaysHistory(game);
}

// printConsole();

// detectar en que columna se ha hecho click y colocar la ficha
const cells = document.querySelectorAll('.cell');
cells.forEach(cell => {
    cell.addEventListener("click", () => {
        if (allowClick){
            const column = numericClass(cell.classList)
            games = games + 1;
            if(freeSpot[column] < 6){
                paintPiece(column,colorTurn,freeSpot)
                animatePiece(colorTurn,column,freeSpot[column])
                freeSpot[column] = freeSpot[column] + 1;
                board[6-freeSpot[column]][column] = colorTurn;
                checkWinner(board,board.length,board[0].length);
                
                // clases
                if(playerOneColor == colorTurn) game.doPlay(column, 'player 1', 'human', colorTurn);
                else game.doPlay(column, 'player 2', 'human', colorTurn);
                // console.log(game);
                
                
                if (PLAYERS == 1) allowClick = false;
                if (WINNER == 0) changeTurn();
            }
        }
        printConsole();
    })
});







// ###################################
// ############# clases ##############
// ###################################


// trato de crear una clase para ir almacenando las partidas jugadas

class connectFourGame {
    constructor(players, level, playerOneColor, playerTwoColor) {
        this.players = players;
        this.level = level;
        this.playerOneColor = playerOneColor;
        this.playerTwoColor = playerTwoColor;
        this.plays = [];
    }

    doPlay(column, player, kind, color) {
        this.plays.push({ column, player, kind, color});
    }

    getPlays() {
        return this.plays;
    }
}

// Ejemplo de cómo crear una partida y realizar una jugada:
// const game = new connectFourGame(2, 'easy', 'red', 'yellow');
// game.doPlay(3, 'red');
// game.doPlay(2, 'yellow');

// Obtener las jugadas realizadas
// const plays = game.getPlays();
// console.log(plays); 


function showPlaysHistory(game) {
    const historyElement = document.getElementById('plays-history');
    historyElement.innerHTML = '';

    const plays = game.getPlays();

    const playsList = document.createElement('ul');

    plays.forEach((play, index) => {
        const playItem = document.createElement('li');
        playItem.textContent = `Play: ${index + 1}: Column ${play.column}, Player ${play.player}`;
        playsList.appendChild(playItem);
    });

    historyElement.appendChild(listaJugadas);
}

// showPlaysHistory(game);
