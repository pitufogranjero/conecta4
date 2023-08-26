// TODO
// hacer una pila con las fichas disponibles
// completar la funcion que verifica si hay 4 consecutivas en diagonal
// crear las funciones para "1 player" y "2 players"
// diseñar el prompt para preguntar a chatGPT cual sería la siguiente jugada




// variables
let board = [
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0]
    ]
let colorTurn = getRandomColor();
let turn = 0;
let WINNER = 0;
let PLAYERS = 2;
changeTurn();

// crear un array con la primera posición libre de cada columna
freeSpot = [0,0,0,0,0,0,0]


// detectar en que columna se ha hecho click y colocar la ficha
const cells = document.querySelectorAll('.cell');
cells.forEach(cell => {
    cell.addEventListener("click", () => {
        if(WINNER == 0){

            columnClicked = numericClass(cell.classList);

            // incrementar el turno
            turn = turn + 1;

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

            // prints
            printConsole();
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
    const piece = document.querySelector('.piece.'+color+'.turn-'+turn);
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
    document.querySelector("#turn").classList.remove(colorTurn+'-text');
    if (colorTurn == 'yellow') colorTurn = 'red'
    else colorTurn = 'yellow'
    document.querySelector("#turn").textContent = colorTurn;// + ' '+turn+'-'+WINNER;
    document.querySelector("#turn").classList.add(colorTurn+'-text');
    document.querySelector("#turn-number").textContent = turn;
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
    divPiece.classList.add('turn-'+turn);
    divPiece.classList.add(color);
    // divPiece.classList.add('falling-piece');
    divCell.appendChild(divPiece);
}

// bajar una ficha de la pila correspondiente

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
    if (checkHorizontals(board,'yellow')) winnerMessage('yellow');
    if (checkHorizontals(board,'red')) winnerMessage('red');
    if (checkVerticals(board,'yellow')) winnerMessage('yellow');
    if (checkVerticals(board,'red')) winnerMessage('red');
    // if (checkDiagonals(board,'yellow')) winner = 'red';
    // if (checkDiagonals(board,'red')) winner = 'red';
}

// winner message
function winnerMessage(color){
    WINNER = color;
    // alert(color)

    divWinner = document.querySelector('.winner');
    divWinner.innerHTML = 'The winner is... '+color+' in '+turn+' movements';
    divWinner.classList.add(color);

    const body = document.body;

    // body.style.backgroundColor = color;
}



// restart game
function restartGame() {
    // alert('El juego se ha reiniciado.'); 
    board = [
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0]
        ]
    colorTurn = 'yellow';
    turn = 0;
    freeSpot = [0,0,0,0,0,0,0];

    // borro el mensaje de winner
    document.querySelector('.winner').innerHTML = "";
    document.querySelector('.winner').classList.remove('red');
    document.querySelector('.winner').classList.remove('yellow');

    // borro todas las piezas del tablero
    const pieces = document.querySelectorAll('.piece');
    pieces.forEach(piece => {
        piece.parentNode.removeChild(piece);
    });
    WINNER = 0;
    printConsole();

}
const restartButton = document.getElementById('restart-button');

restartButton.addEventListener('click', function() {
    restartGame(); 
});


// aleatorio para calcular quien empieza
function getRandomColor() {
    const colors = ["red", "yellow"];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

// prints
function printConsole(){
    // console.log(board);
    // console.log(freeSpot);
    // console.log(`turn: ${colorTurn}`)
    // console.log(`next free row: ${freeSpot[columnClicked]}`)
    // console.log(`clicked on column: ${columnClicked}`)
    // console.log(board);
    console.log(WINNER);
}