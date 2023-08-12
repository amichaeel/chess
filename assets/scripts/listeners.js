/* This script contains all functions related to event listeners */


let is_current_player_piece;

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

function select_piece(e) {
    const piece = e.target;
    const piece_color = piece.getAttribute("class").includes("white") ? "white" : "black";
    const square = piece.parentElement.getAttribute("data-location");
    is_current_player_piece = valid_start(piece, piece_color, square);
}


function move_piece(e) {
    e.preventDefault();
}

function release_piece(e) {
    const target_square = e.currentTarget.getAttribute("data-location");
    const squares = chessboard.childNodes;
    for (let square of squares) {
        if (square.classList.contains("available-light")) {
            square.classList.remove("available-light");
        } else if (square.classList.contains("available-dark")) {
            square.classList.remove("available-dark");
        } else if (square.classList.contains("available-with-pawn")) {
            square.classList.remove("available-with-pawn")
        }
    }
    if (is_current_player_piece) {
        move_current_piece(target_square);
    }
}
