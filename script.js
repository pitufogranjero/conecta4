// TODO
// hacer una pila con las fichas disponibles
// completar la funcion que verifica si hay 4 consecutivas en diagonal
// crear las funciones para "1 player" y "2 players"
// diseñar el prompt para preguntar a chatGPT cual sería la siguiente jugada


// variables
let board = 0;
let colorTurn = getRandomColor();
let games = 0;
let WINNER = 0;
let PLAYERS = 0;
let IA_COLOR = 0;
let PLAYER_COLOR = 0;
let LEVEL = '';


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

const playerInfo = document.getElementById('player-color');

const turnSpan = document.querySelector("#turn");

const divWinner = document.querySelector('.winner');

// crear un array con la primera posición libre de cada columna
freeSpot = [0,0,0,0,0,0,0]


// Carga inicial del juego
restartBoard();
showPlayersButtons();
addBlur();
// changeTurn();






// capturo los clicks en los botones
onePlayer.addEventListener('click', chooseOnePlayer);
twoPlayer.addEventListener('click', chooseTwoPlayer);

easyButton.addEventListener('click', chooseEasyLevel)
hardButton.addEventListener('click', chooseHardLevel)

restartButton.addEventListener('click', function() {
    showPlayersButtons();
    restartGame();
    addBlur();
});


// detectar en que columna se ha hecho click y colocar la ficha
const cells = document.querySelectorAll('.cell');
cells.forEach(cell => {
    cell.addEventListener("click", () => {
        if(WINNER == 0){

            columnClicked = numericClass(cell.classList);

            // incrementar el turno
            games = games + 1;

            // y la pinto en pantalla
            paintPiece(columnClicked,colorTurn)

            animatePiece(colorTurn,columnClicked,freeSpot[columnClicked])
            
            // marco como ocupada la casilla de esa columna
            freeSpot[columnClicked] = freeSpot[columnClicked] + 1;
            
            // pongo la ficha de este color en la matriz del tablero
            board[6-freeSpot[columnClicked]][columnClicked] = colorTurn;

            // compruebo si hay un ganador
            checkWinner(board)

            // cambio el turno
            changeTurn();        
        }
        })
    })

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
    const divInicio = document.querySelector('.cell.col-'+column+'.row-5');
    const divFinal = document.querySelector('.cell.col-'+column+'.row-'+row);
    const piece = document.querySelector('.piece.'+color+'.turn-'+games);
    // console.log(piece)

    const startY = divInicio.offsetTop + divInicio.offsetHeight / 2;
    
    const finalY = divFinal.offsetTop + divFinal.offsetHeight / 2 - startY;
    piece.style.transform = `${startY}px)`;

    setTimeout(() => {
        piece.style.transform = `translateY(${finalY}px)`;
        piece.style.transition= 'all 0.5s ease-in';
    }, 0);
}


// marcar el turno que toca y cambiarlo al hacer click
function changeTurn(){
    console.log('ejecuto changeTurn desde '+colorTurn);
    turnSpan.classList.remove(colorTurn+'-text');
    if (colorTurn == 'yellow') colorTurn = 'red'
    else colorTurn = 'yellow'
    turnSpan.textContent = colorTurn;
    turnSpan.classList.add(colorTurn+'-text');
    document.querySelector("#turn-number").textContent = games;
    // si hay cambio de turno y estamos en modo 1 player, miro si le toca jugar a la máquina
    console.log(PLAYERS+'\n'+WINNER+'\n'+IA_COLOR+'\n'+colorTurn)
    if(PLAYERS == 1 && WINNER == 0 && IA_COLOR == colorTurn){
        console.log('le toca jugar a la IA');
        jugadaIA = iaPlay(board,IA_COLOR)
        }   
}

// pintar la ficha en el primer sitio libre
function putPiece(column){
    for(let i=0; i<6; i++){
        freeSpot[column] = color;
        }
}
function paintPiece(column,color){
    const divCell = document.querySelector('.cell.col-'+column+'.row-5'); //+freeSpot[column])
    const divPiece = document.createElement('div');
    divPiece.classList.add('piece');
    divPiece.classList.add('turn-'+games);
    divPiece.classList.add(color);
    // divPiece.classList.add('falling-piece');
    divCell.appendChild(divPiece);
}


// #################################
// ### COMPROBACION DE GANADORES ###
// #################################

// comprobar si hay 4 fichas consecutivas iguales en las filas
function checkHorizontals (board,color){
    let sum = 1;
    // recorro las filas
    for (let row = 0; row < board.length; row++) {
        // recorro las columnas
        for(let col = 0; col < board[row].length; col++){
            if (board[row][col+1] == color && board[row][col] == color) {
                sum = sum + 1;
                // console.log(color+' fila '+i+' suma '+sum)
            } else {
                sum = 1;
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

// #################################
// ### COMPROBACION DE GANADORES ###
// #################################

// winner message
function winnerMessage(color){
    WINNER = color;
    // alert(color)

    divWinner.innerHTML = 'The winner is... '+color+' in '+games+' movements';
    divWinner.classList.add(color);

    turnSpan.textContent == '';
}

// restart game
function restartGame() {
    // alert('El juego se ha reiniciado.'); 
    
    colorTurn = getRandomColor();
    games = 0;
    freeSpot = [0,0,0,0,0,0,0];

    // borro el mensaje de winner
    document.querySelector('.winner').innerHTML = "";
    document.querySelector('.winner').classList.remove('red');
    document.querySelector('.winner').classList.remove('yellow');

    // borro el mensaje de playerInfo
    playerInfo.textContent = '';
    erasePieces();

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

// #################################
// ############ chatGPT ############
// #################################

require('dotenv').config();
const apiKey = process.env.CHATGPT_API_KEY;
// const url_chatGPT = 'https://api.openai.com/v1/chat/completions';

// funcion de espera para que la IA devuelva una jugada
async function iaPlay(board,IA_COLOR){
    console.log('ejectuo iaPlay')
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
        printConsole();
        changeTurn();
                
        } catch (error) {
        console.error('Error:', error);
        }
    }


// desenfoques
function removeBlur() {
    document.getElementById('board').classList.remove('blur');
    document.getElementById('actual-turn').classList.remove('blur');
    document.getElementById('restart-button').classList.remove('blur');
}
function addBlur() {
    document.getElementById('board').classList.add('blur');
    document.getElementById('actual-turn').classList.add('blur');
    document.getElementById('restart-button').classList.add('blur');
}

// imprimir amigablemente el tablero
function printBoard(board){
    for (let i = 0; i < board.length; i++) {
        console.log(`${i}: ${board[i].join(', ')}`);
    }
}

// ###################################
// ### funciones para los botones ####
// ###################################

function chooseOnePlayer(){
    hidePlayersButtons();
    showLevelButtons();
    PLAYERS = 1;

    IA_COLOR = getRandomColor();
    if(IA_COLOR == 'yellow') PLAYER_COLOR = 'red';
    else PLAYER_COLOR = 'yellow';
    printConsole();
}

function chooseTwoPlayer(){
    hidePlayersButtons();
    PLAYERS = 2;
    restartGame();
    removeBlur();
    printConsole();
}

function chooseEasyLevel(){
    LEVEL = 'easy';
    alert('not implemented yet');
    restartGame();
    showPlayersButtons();
    hideLevelButtons();
}

function chooseHardLevel(){
    changeTurn();
    playerInfo.textContent = 'You are playing against IA, your color is: ' + PLAYER_COLOR;
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
    console.log(printBoard(board));
    console.log(`Game: Players ${PLAYERS} || Winner ${WINNER} || IAColor ${IA_COLOR} || Turn ${colorTurn}`);
}

printConsole();

function debug(content){
    const debugContainer = document.getElementById('debug');
    debugContainer.textContent += content;
}
