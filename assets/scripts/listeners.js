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

let active_piece;

function select_piece(e) {
    e.preventDefault();
    active_piece = e.target;
    const piece_color = active_piece.getAttribute("class").includes("white") ? "white" : "black";
    const square = active_piece.parentElement.getAttribute("data-location");
    active_piece.addEventListener("mousemove", move_piece);


    // Movement logic
    const x = e.clientX - 80;
    const y = e.clientY - 80;
    active_piece.style.position = "absolute";
    active_piece.style.left = `${x}px`;
    active_piece.style.top = `${y}px`;
    active_piece.classList.add('dragging')
    is_current_player_piece = valid_start(active_piece, piece_color, square);
}

function move_piece(e) {
    e.preventDefault();
    const minX = chessboard.offsetLeft - 75;
    const minY = chessboard.offsetTop - 75;
    const maxX = chessboard.offsetLeft + chessboard.clientWidth - 75;
    const maxY = chessboard.offsetTop + chessboard.clientHeight - 75;

    if (active_piece) {
        const x = e.clientX - 80;
        const y = e.clientY - 80;
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
        active_piece.classList.remove('dragging')
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
