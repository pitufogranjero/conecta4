import { OPENAI_API_KEY } from './env.js';


// TODO
// hacer una pila con las fichas disponibles
// completar la funcion que verifica si hay 4 consecutivas en DIAGONAL
// corregir la ubicación de las pieces para que estén en el div correcto sin que afecte a la posición en pantalla tras la animacion

// DONE
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

    turnInfo.classList.add('turn-info');
    turnInfo.setAttribute('id','turn-info');
    
    playerTwoIndicator.classList.add('player');
    playerTwoIndicator.classList.add('two');

    playersInfo.appendChild(playerOneIndicator);
    playersInfo.appendChild(turnInfo);
    playersInfo.appendChild(playerTwoIndicator);

    const pieceOne = document.createElement('div');
    const pieceTwo = document.createElement('div');

    pieceOne.classList.add('piece');
    pieceOne.classList.add(color1);
    pieceTwo.classList.add('piece');
    pieceTwo.classList.add(color2);

    playerOneIndicator.appendChild(pieceOne);
    playerTwoIndicator.appendChild(pieceTwo);

    const playerOneLabel = document.createElement('div');
    const playerTwoLabel = document.createElement('div');
    playerOneLabel.classList.add('label');
    playerOneLabel.textContent = '1';
    playerTwoLabel.classList.add('label');
    playerTwoLabel.textContent = '2';
    pieceOne.appendChild(playerOneLabel);
    pieceTwo.appendChild(playerTwoLabel);

    const actualTurn = document.getElementById('turn-info');
    actualTurn.innerHTML = `<span>${playerMessage}:&nbsp;</span>`;
    actualTurn.innerHTML += `<span id='turn' class='${colorTurn}-text'>${colorTurn}</span>`;
    // actualTurn.innerHTML += `<div class="piece ${colorTurn}" style="width:40px; display:flex"></div>`;
    const actualTurnIndicator = document.getElementById('turn');
    
}


// creo los botones
const onePlayer = document.createElement('button');
onePlayer.classList.add("button");
onePlayer.setAttribute('id', '1-player');
onePlayer.textContent = "1 Player";

const twoPlayer = document.createElement('button');
twoPlayer.classList.add("button");
twoPlayer.setAttribute('id', '2-player');
twoPlayer.textContent = "2 Player";

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
// addBlur();
// changeTurn();

// capturo los clicks en los botones
onePlayer.addEventListener('click', chooseOnePlayer);
twoPlayer.addEventListener('click', chooseTwoPlayer);

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
    console.log(row)
    const divStart = document.querySelector('.cell.col-'+column+'.row-5');
    const divEnd = document.querySelector('.cell.col-'+column+'.row-'+row);
    const piece = document.querySelector('.piece.'+color+'.turn-'+games);
    // console.log(piece)

    const startY = divStart.offsetTop + divStart.offsetHeight / 2;
    const finalY = divEnd.offsetTop + divEnd.offsetHeight / 2 - startY;
        
    piece.style.transform = `${startY}px)`;
    setTimeout(() => {
        piece.style.transform = `translateY(${finalY}px)`;
        piece.style.transition= 'all 0.5s ease-in';
    }, 0);
    piece.classList.remove('row-5');
    piece.classList.add('row-'+row);
}


// marcar el turno que toca y cambiarlo al hacer click
function changeTurn(){
    // console.log('ejecuto changeTurn desde '+colorTurn);
    // const turnSpan = document.getElementById('turn')
    // turnSpan.classList.remove(colorTurn+'-text');
    if (colorTurn == 'yellow') colorTurn = 'red'
    else colorTurn = 'yellow'
    // turnSpan.textContent = colorTurn;
    // turnSpan.classList.add(colorTurn+'-text');
    // si hay cambio de turno y estamos en modo 1 player, miro si le toca jugar a la máquina
    // console.log(PLAYERS+'\n'+WINNER+'\n'+IA_COLOR+'\n'+colorTurn)
    if(PLAYERS == 1 && WINNER == 0 && IA_COLOR == colorTurn){
        console.log('turn to IA');
        // jugadaIA = iaPlay(board,IA_COLOR)
        iaPlay(board,IA_COLOR);
        }   
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
    divCell.appendChild(divPiece);

    // const divPiece1 = document.createElement('div');
    // divPiece1.classList.add('small');
    // divPiece1.style('top:0px')
    // divPiece.appendChild(divPiece1);
}


// #################################
// ### COMPROBACION DE GANADORES ###
// #################################

// comprobar si hay 4 fichas consecutivas iguales en las filas
function checkHorizontals (board,color){
    let sum = 1;
    // console.log(printBoard(board))
    // console.log('horizontals '+color)
    // console.log('rows '+board.length)
    // console.log('cols '+board[0].length)
    // console.log('sum '+sum)
    // recorro las filas
    for (let row = 0; row < board.length; row++) {
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
function checkDiagonals() {
    return true;
}

// si hay ganador marcarlo
function checkWinner(board){
    try {
        if (checkHorizontals(board, 'yellow') || checkVerticals(board, 'yellow')) {
            winnerMessage('yellow');
            return;
        }

        if (checkHorizontals(board, 'red') || checkVerticals(board, 'red')) {
            winnerMessage('red');
            return;
        }

        } catch (error) {
        // Manejar errores si es necesario
        }
}

// winner message
function winnerMessage(color){
    WINNER = color;
    allowClick = false;
    // alert(color)
    const divWinner = document.getElementById('turn-info')
    divWinner.innerHTML = "";
    divWinner.innerHTML = 'The winner is '+color;
    divWinner.classList.add(color);

    turnSpan.textContent == '';
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

// #################################
// ############ chatGPT ############
// #################################


const apiKey = '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';
const url_chatGPT = 'https://api.openai.com/v1/chat/completions';
// const apikey = OPENAI_API_KEY;
// funcion de espera para que la IA devuelva una jugada
async function iaPlay(board,IA_COLOR){
    console.log('ejecuto iaPlay')
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer "+apiKey);

    var raw = JSON.stringify({
        "model": "gpt-3.5-turbo",
        "messages": [
            {
            "role": "user",
            "content": `Estamos jugando a Conecta 4 y tu color es el ${IA_COLOR}, ahora es tu turno y el tablero es el siguiente ${board}, ¿cual sería tu próxima jugada? respóndeme sólo con el número de columna donde pondrías tu siguiente ficha. Limitate sólo a responder con el dígito de la columna, es decir, un numero del 0 al 6`
            }
        ]
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
        let columnaElegida = null;

        while (!columnaElegida) {
            columnaElegida = data.choices[0].message.content;
            columnaElegida = columnaElegida.match(/[0-6]/);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('la columna elegida por la IA es: ' + columnaElegida);
        paintPiece(columnaElegida,colorTurn);
        animatePiece(colorTurn,columnaElegida,freeSpot[columnaElegida])
        freeSpot[columnaElegida] = freeSpot[columnaElegida] + 1;
        
        checkWinner(board);
        // printConsole();
        changeTurn();
                
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
    setPlayersInfo('red','yellow','Next turn');
    // restartGame();
    removeBlur();
    // setBoard(rows,cols);
    printConsole();
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
    alert('not implemented yet');
    restartGame();
    showPlayersButtons();
    hideLevelButtons();
}

function chooseHardLevel(){
    IA_COLOR = getRandomColor();
    PLAYER_COLOR = swapColors(IA_COLOR);
    changeTurn();

    if (colorTurn == PLAYER_COLOR) setPlayersInfo(PLAYER_COLOR,IA_COLOR,'Your Turn');
    else setPlayersInfo(PLAYER_COLOR,IA_COLOR,'Turn to IA');
    // turn.textContent = 'Your color is: ' + PLAYER_COLOR;
    LEVEL = 'hard';
    removeBlur();
    // restartGame();
    hideLevelButtons();
    hidePlayersButtons();
    // if (colorTurn == IA_COLOR) iaPlay();
}

// #########################################
// ###### mostrar/ocultar los botones ######
// #### de numero de players en su capa ####
// #########################################

function showPlayersButtons(){
    document.getElementById('choose-player-number').appendChild(onePlayer);
    document.getElementById('choose-player-number').appendChild(twoPlayer);
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
    console.log(`Game: Players ${PLAYERS} || Winner ${WINNER} || IAColor ${IA_COLOR} || Turn ${colorTurn} || allowClick ${allowClick}`);
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
                checkWinner(board)
                changeTurn();    
            }
        }
    })
});
