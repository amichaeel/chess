// This file will handle pawn promotion, castling, en passant, check, checkmate, stalemate, and draws.
var pawn_dest_element;

function determine_conditions() {}

function determine_pawn_conditions(move_init_location, move_dest_location, init_col, dest_col, dest_row, dest_element) {
    // If a pawn was selected and moved, set data-moved to true.
    piece_element.setAttribute("data-moved", true);

    // Did the pawn move two squares?
    if (Math.abs(Number(move_dest_location[1]) - Number(move_init_location[1])) == 2) {
        piece_element.setAttribute("data-enpassant", true);
        move.play();
    } else if (Math.abs(column_letter.indexOf(dest_col) - column_letter.indexOf(init_col)) == 1 && !dest_element.hasChildNodes()) {
        // Did pawn take with en passant? If so, remove piece below it.
        if (current_player == "white") {
            const enpassant_square = document.querySelector(`[data-location="${dest_col}${dest_row - 1}"]`);
            enpassant_square.innerHTML = "";
        } else {
            const enpassant_square = document.querySelector(`[data-location="${dest_col}${dest_row + 1}"]`);
            enpassant_square.innerHTML = "";
        }
        capture.play();
    } else {
        // Pawn only moved one square, did not capture through normal attack nor enpassant.
        move.play();
    }
    // Here, we can also check if the pawn is capable of promotion.
    pawn_promotion(dest_element, move_dest_location);
}

function reset_enpassant() {
    squares.forEach((square) => {
        if (square.hasChildNodes()) {
            const piece = square.firstChild;
            if (!piece.classList.contains(`${current_player}_piece`) && piece.getAttribute("id") == "pawn" && piece.getAttribute("data-enpassant") == "true") {
                piece.setAttribute("data-enpassant", false);
            }
        }
    });
}

function pawn_promotion(dest_element, dest_location) {
    pawn_dest_element = dest_element;
    // Validate the destination
    if (current_player == "white" && dest_location[1] == "8") {
        console.log("Reached");
        promotion_menu();
    } else if (current_player == "black" && dest_location[1] == "1") {
        promotion_menu();
    }
    return;
}

function promotion_menu() {
    const promotion_menu_element = document.createElement("div");
    const shadow = document.querySelector("shadow");
    shadow.style.visibility = "visible";
    pawn_dest_element.append(promotion_menu_element);

    const white_promotion_pieces = [white_queen, white_knight, white_rook, white_bishop];
    const black_promotion_pieces = [black_queen, black_knight, black_rook, black_bishop];

    switch (current_player) {
        case "white":
            promotion_menu_element.classList.add("promotion-menu-white");
            for (const piece of white_promotion_pieces) {
                const square = document.createElement("div");
                square.addEventListener("click", promotion_selection);
                square.classList.add("menu-item");
                square.innerHTML = piece;
                promotion_menu_element.append(square);
            }
            pause_game();
            break;
        case "black":
            promotion_menu_element.classList.add("promotion-menu-black");
            for (const piece of black_promotion_pieces) {
                const square = document.createElement("div");
                square.addEventListener("click", promotion_selection);
                square.classList.add("menu-item");
                square.innerHTML = piece;
                promotion_menu_element.append(square);
            }
            pause_game();
            break;
    }
    return;
}

function promotion_selection(e) {
    const piece_element = e.target;
    const shadow = document.querySelector("shadow");
    if (pawn_dest_element.hasChildNodes()) {
        pawn_dest_element.innerHTML = "";
        pawn_dest_element.append(piece_element);
    } else {
        pawn_dest_element.append(piece_element);
    }
    shadow.style.visibility = "hidden";
    promote.play();
    resume_game();
    return;
}

function determine_check() {
    var moves = [];
    const opponent_color = current_player == "white" ? "black" : "white";

    // Get king location
    // Get all moves from opponent
    for (const square of squares) {
        if (square.hasChildNodes()) {
            const piece = square.firstChild;
            if (piece.classList.contains(`${opponent_color}_piece`)) {
                const piece_id = piece.getAttribute("id")
                const piece_location = square.getAttribute("data-location")
                moves.push(begin_search(opponent_color, piece_id, piece, piece_location, false, false, true))
            } else if (piece.getAttribute("id") == "king") {
                king_element = square;
                king_location = square.getAttribute("data-location");
            }
        }
    }

    moves = new Set([].concat(...moves));
    console.log(moves);

    if (moves.has(king_location)) {
        king_element.classList.add("check");
        check.play();
        return true;
    }

    return false;
}

function remove_check_styling() {
    king_element.classList.remove("check");
}
