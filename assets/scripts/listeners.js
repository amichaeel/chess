/* This script contains all functions related to event listeners */

let is_current_player_piece;
let active_piece;
let active_square;
let selected = false;
let is_dragging = false;

function hightlight_square(e) {
    e.preventDefault();
    const square = e.currentTarget;

    if (square.classList.contains("highlighted-light")) {
        square.classList.remove("highlighted-light");
        return;
    } else if (square.classList.contains("highlighted-dark")) {
        square.classList.remove("highlighted-dark");
        return;
    } else if (square.classList.contains("light-square")) {
        square.classList.add("highlighted-light");
    } else if (square.classList.contains("dark-square")) {
        square.classList.add("highlighted-dark");
    }
}

function add_available_square_highlight(e) {
    console.log(e)
}

function select_piece(e) {
    e.preventDefault();
    if (e.button == 1 || e.button == 2) {
        selected = false;
        return;
    }
    is_dragging = true;
    selected = true;
    let temp = e.target;
    const piece_color = temp.getAttribute("class").includes("white") ? "white" : "black";
    if (piece_color != current_player) return;
    active_piece = temp;
    const square = active_piece.parentElement.getAttribute("data-location");
    active_piece.addEventListener("mousemove", move_piece);


    // Movement log
    const x = e.clientX - 70;
    const y = e.clientY - 65;
    active_piece.style.position = "absolute";
    active_piece.style.left = `${x}px`;
    active_piece.style.top = `${y}px`;
    is_current_player_piece = valid_start(active_piece, piece_color, square);
    if (is_current_player_piece) {
        active_piece.classList.add('piece-with-hover')
    }
}

function move_piece(e) {
    e.preventDefault();

    if (selected == false) return; 
    const minX = chessboard.offsetLeft - 75;
    const minY = chessboard.offsetTop - 75;
    const maxX = chessboard.offsetLeft + chessboard.clientWidth - 75;
    const maxY = chessboard.offsetTop + chessboard.clientHeight - 75;

    if (active_piece) {
        const x = e.clientX - 70;
        const y = e.clientY - 65;
        active_piece.style.position = "absolute";


        //If x is smaller than minimum amount
        if (x < minX) {
            active_piece.style.left = `${minX}px`;
        }
        //If x is bigger than maximum amount
        else if (x > maxX) {
            active_piece.style.left = `${maxX}px`;
        }
        //If x is in the constraints
        else {
            active_piece.style.left = `${x}px`;
        }

        //If y is smaller than minimum amount
        if (y < minY) {
            active_piece.style.top = `${minY}px`;
        }
        //If y is bigger than maximum amount
        else if (y > maxY) {
            active_piece.style.top = `${maxY}px`;
        }
        //If y is in the constraints
        else {
            active_piece.style.top = `${y}px`;
        }
    }
}

function release_piece(e) {
    const squares = chessboard.childNodes;
    is_dragging = false;
    if (active_piece) {
        squares.forEach((square) => {
            const rect = square.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
                const target_square = square.getAttribute("data-location");
                if (is_current_player_piece) {
                    move_current_piece(target_square);
                }
            }
        });
        active_piece.removeEventListener("mousemove", move_piece);
        active_piece.style.left = null;
        active_piece.style.top = null;
        active_piece.style.position = null;
        active_piece.classList.remove("piece-with-hover");
        active_piece = null;
    }
     
    for (let square of squares) {
        if (square.classList.contains("available-light")) {
            square.classList.remove("available-light");
        } else if (square.classList.contains("available-dark")) {
            square.classList.remove("available-dark");
        } else if (square.classList.contains("available-with-pawn")) {
            square.classList.remove("available-with-pawn");
        }
    }
}
