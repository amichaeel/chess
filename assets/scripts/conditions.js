// This file will handle pawn promotion, castling, en passant, check, checkmate, stalemate, and draws.
var pawn_dest_element;

function determine_conditions() {}

function pawn_behavior(move_init_location, move_dest_location, init_col, dest_col, dest_row, dest_element, piece_element) {
    // Did the pawn move two squares?
    if (Math.abs(Number(move_dest_location[1]) - Number(move_init_location[1])) == 2) {
        piece_element.setAttribute("data-enpassant", true);
        dest_element.append(piece_element);
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
        dest_element.append(piece_element)
        capture.play();
    } else {
        // Normal pawn behavior. Either moved one square up or took a piece.
        if (dest_element.hasChildNodes()) {
            dest_element.innerHTML = "";
            capture.play()
        } else {
            move.play()
        }
        dest_element.append(piece_element)
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
    moves = get_opponent_moves(opponent_color);
    // console.log(moves)

    if (moves.includes(king_location)) {
        king_element.classList.add("check");
        check.play();
        return true;
    }

    return false;
}

function determine_castling_rights(color, piece_location, piece_element, moves) {
    const col = piece_location[0];
    const row = piece_location[1];
    const col_index = column_letter.indexOf(col);
    const opponent_color = color == "white" ? "black" : "white";
    var opponent_moves;

    if (piece_element.getAttribute("data-moved") == "false") {
        opponent_moves = get_opponent_moves(opponent_color);
        var left_rook_found = false;
        var right_rook_found = false;
        var left_rook_location;
        var right_rook_location;

        // Go left
        for (let cur_col = col_index - 1; cur_col > 0; cur_col--) {
            const square_element = document.querySelector(`[data-location="${column_letter[cur_col]}${row}"]`);
            const location = square_element.getAttribute("data-location");
            if (opponent_moves.includes(location)) {
                break;
            }

            if (!square_element.hasChildNodes() && !opponent_moves.includes(location)) {
                continue;
            } else if (square_element.hasChildNodes()) {
                // Break at rook
                const piece = square_element.firstChild;
                if (piece.getAttribute("id") == "rook" && piece.getAttribute("data-moved") == "false") {
                    left_rook_found = true;
                    left_rook_location = location;
                    break;
                } else break;
            }
        }

        // Go right
        for (let cur_col = col_index + 1; cur_col < 9; cur_col++) {
            const square_element = document.querySelector(`[data-location="${column_letter[cur_col]}${row}"]`);
            const location = square_element.getAttribute("data-location");
            if (opponent_moves.includes(location)) {
                break;
            }

            if (!square_element.hasChildNodes()) {
                continue
            } else if (square_element.hasChildNodes()) {
                // Break at rook. If its not a rook, castle unsuccessful.
                const piece = square_element.firstChild;
                if (piece.getAttribute("id") == "rook" && piece.getAttribute("data-moved") == "false") {
                    right_rook_found = true;
                    right_rook_location = location;
                    break;
                } else break;
            }
        }

        if (left_rook_found) {
            moves.push(left_rook_location);
        }

        if (right_rook_found) {
            moves.push(right_rook_location)
        }
    }
}

function determine_castle_location(init_location, dest_location) {
    const init_col_index = column_letter.indexOf(init_location[0]);
    const dest_col_index = column_letter.indexOf(dest_location[0]);
    const distance = Math.abs(dest_col_index - init_col_index);
    if (distance == 4) {
        return "left";
    } else return "right";
}

function castle_behavior(castle_location, piece_element, dest_element_piece) {
    if (current_player == "white") {
        if (castle_location == "left") {
            const king_castle_location = document.querySelector('[data-location="c1"]');
            const rook_castle_location = document.querySelector('[data-location="d1"]');
            king_castle_location.append(piece_element);
            rook_castle_location.append(dest_element_piece);
        } else {
            const king_castle_location = document.querySelector('[data-location="g1"]');
            const rook_castle_location = document.querySelector('[data-location="f1"]');
            king_castle_location.append(piece_element);
            rook_castle_location.append(dest_element_piece);
        }
    } else {
        if (castle_location == "left") {
            const king_castle_location = document.querySelector('[data-location="c8"]');
            const rook_castle_location = document.querySelector('[data-location="d8"]');
            king_castle_location.append(piece_element);
            rook_castle_location.append(dest_element_piece);
        } else {
            const king_castle_location = document.querySelector('[data-location="g8"]');
            const rook_castle_location = document.querySelector('[data-location="f8"]');
            king_castle_location.append(piece_element);
            rook_castle_location.append(dest_element_piece);
        }
    }

}

function remove_check_styling() {
    king_element.classList.remove("check");
}

function get_opponent_moves(opponent_color) {
    var moves = [];
    for (const square of squares) {
        if (square.hasChildNodes()) {
            const piece = square.firstChild;
            if (piece.classList.contains(`${opponent_color}_piece`)) {
                const piece_id = piece.getAttribute("id");
                const piece_location = square.getAttribute("data-location");
                moves.push(begin_search(opponent_color, piece_id, piece, piece_location, false, false, true));
            } else if (piece.getAttribute("id") == "king") {
                king_element = square;
                king_location = square.getAttribute("data-location");
            }
        }
    }
    moves = Array.from(new Set([].concat(...moves)));

    return moves;
}
