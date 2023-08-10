let current_player = "white";
let current_piece_element;
let current_piece;
let current_square;

function change_player() {
    if (current_player == "white") {
        current_player = "black";
    } else {
        current_player = "white";
    }
}

function search(current_piece, current_square) {
    let available_moves = [];
    switch (current_piece) {
        case "pawn":
            available_moves = search_pawn_moves(current_piece_element, current_square);
            break;
    }

    return available_moves;
}

function valid_start(piece, piece_color, square) {
    if (piece_color == current_player) {
        current_piece_element = piece;
        current_piece = piece.getAttribute("id");
        current_square = square;
        return true;
    }

    return false;
}

function move_current_piece(target_square) {
    const available_moves = search(current_piece, current_square);
    console.log(available_moves);

    if (available_moves.includes(target_square)) {
        const target_square_element = document.querySelector(`[data-location="${target_square}"]`);

        if (target_square_element.hasChildNodes()) {
            target_square_element.innerHTML = "";
            target_square_element.append(current_piece_element);
        }

        target_square_element.append(current_piece_element);

        if (current_piece == "pawn") {
            current_piece_element.setAttribute("data-moved", true);
        }
        change_player();
    }
}

function search_pawn_moves(current_piece_element, current_square) {
    const pawn_has_moved = current_piece_element.getAttribute("data-moved") == "true" ? true : false;
    const available_moves = [];
    const col = current_square[0];
    const row = current_square[1];
    let left_diag_square;
    let right_diag_square;

    if (current_player == "white") {
        const current_column_index = column_letter.indexOf(col);
        const left_col = column_letter[current_column_index - 1];
        const right_col = column_letter[current_column_index + 1];

        if (!is_col_of_bounds(left_col)) {
            left_diag_square = document.querySelector(`[data-location="${left_col}${Number(row) + 1}"]`);
        }
        if (!is_col_of_bounds(right_col)) {
            right_diag_square = document.querySelector(`[data-location="${right_col}${Number(row) + 1}"]`);
        }

        if (left_diag_square != undefined && left_diag_square.hasChildNodes()) {
            available_moves.push(left_diag_square.getAttribute("data-location"));
        }

        if (right_diag_square != undefined && right_diag_square.hasChildNodes()) {
            available_moves.push(right_diag_square.getAttribute("data-location"));
        }

        if (!pawn_has_moved) {
            const square_above = document.querySelector(`[data-location="${col}${Number(row) + 2}"]`);
            if (!is_row_out_of_bounds(Number(row) + 2) && !square_above.hasChildNodes()) {
                available_moves.push(`${col}${Number(row) + 2}`);
            }
        }

        const square_above = document.querySelector(`[data-location="${col}${Number(row) + 1}"]`);
        if (!is_row_out_of_bounds(Number(row) + 1) && !square_above.hasChildNodes()) {
            available_moves.push(`${col}${Number(row) + 1}`);
        }
    } else {
        const current_column_index = column_letter.indexOf(col);
        const left_col = column_letter[current_column_index + 1];
        const right_col = column_letter[current_column_index - 1];

        if (!is_col_of_bounds(left_col)) {
            left_diag_square = document.querySelector(`[data-location="${left_col}${Number(row) - 1}"]`);
        }

        if (!is_col_of_bounds(right_col)) {
            right_diag_square = document.querySelector(`[data-location="${right_col}${Number(row) - 1}"]`);
        }

        if (left_diag_square != undefined && left_diag_square.hasChildNodes()) {
            available_moves.push(left_diag_square.getAttribute("data-location"));
        }

        if (right_diag_square != undefined && right_diag_square.hasChildNodes()) {
            available_moves.push(right_diag_square.getAttribute("data-location"));
        }
        if (!pawn_has_moved) {
            const square_above = document.querySelector(`[data-location="${col}${Number(row) - 2}"]`);
            if (!is_row_out_of_bounds(Number(row) - 2) && !square_above.hasChildNodes()) {
                available_moves.push(`${col}${Number(row) - 2}`);
            }
        }

        const square_above = document.querySelector(`[data-location="${col}${Number(row) - 1}"]`);
        if (!is_row_out_of_bounds(Number(row) - 1) && !square_above.hasChildNodes()) {
            available_moves.push(`${col}${Number(row) - 1}`);
        }
    }

    return available_moves;
}

function is_col_of_bounds(col) {
    if (col == "") {
        return true;
    }

    return false;
}

function is_row_out_of_bounds(row) {
    if (row < 1 || row > 8) {
        return true;
    }

    return false;
}

/* To be worked on */
function available_moves_contain_pieces(available_moves) {}
function search_rook_moves(current_square) {}
function search_bishop_moves(current_square) {}
function search_knight_moves(current_square) {}
function search_queen_moves(current_square) {}
function search_king_moves(current_square) {}