let current_player = "white";
let current_piece_element;
let current_piece;
let current_square;
let current_available_moves;

function change_player() {
    if (current_player == "white") {
        current_player = "black";
    } else {
        current_player = "white";
    }

    squares = chessboard.childNodes;

    squares.forEach((square) => {
        if (square.classList.contains("highlighted-light")) {
            square.classList.remove("highlighted-light");
        } else if (square.classList.contains("highlighted-dark")) {
            square.classList.remove("highlighted-dark");
        }
    });
}

function search(current_piece, current_square) {
    let moves_found;
    switch (current_piece) {
        case "pawn":
            moves_found = search_pawn_moves(current_piece_element, current_square);
            break;
        case "rook":
            moves_found = search_rook_moves(current_square);
            break;
        case "bishop":
            moves_found = search_bishop_moves(current_square);
            break;
        case "knight":
            moves_found = search_knight_moves(current_square);
            break;
        case "queen":
            moves_found = search_queen_moves(current_square);
            break;
        case "king":
            moves_found = search_king_moves(current_square);
            break;
    }

    return moves_found;
}

function valid_start(piece, piece_color, square) {
    if (piece_color == current_player) {
        current_piece_element = piece;
        current_piece = piece.getAttribute("id");
        current_square = square;
        let moves_allowed = search(current_piece, current_square);
        let attacked_sqs;

        if (current_piece == "king") {
            attacked_sqs = find_attacked_squares();
            const set = new Set([].concat(...attacked_sqs));
            moves_allowed = moves_allowed.filter((move) => !set.has(move));
        }
        current_available_moves = moves_allowed;

        // Highlight available squares!
        const squares = chessboard.childNodes;
        for (let square of squares) {
            const square_location = square.getAttribute("data-location");
            if (moves_allowed.includes(square_location)) {
                if (square.hasChildNodes()) {
                    const piece_color = square.childNodes[0].classList.contains("white_piece") ? "white" : "black";
                    if (piece_color != current_player) {
                        square.classList.add("available-with-pawn");
                    }
                } else {
                    if (square.classList.contains("light-square")) {
                        square.classList.add("available-light");
                    } else {
                        square.classList.add("available-dark");
                    }
                }
            }
        }
        return true;
    }

    return false;
}

function move_current_piece(target_square) {
    if (current_available_moves.includes(target_square)) {
        const target_square_element = document.querySelector(`[data-location="${target_square}"]`);

        if (target_square_element.hasChildNodes()) {
            const piece_is_same_color_as_player = target_square_element.childNodes[0].classList.contains(`${current_player}_piece`);
            if (piece_is_same_color_as_player) {
                return;
            } else {
                target_square_element.innerHTML = "";
                target_square_element.append(current_piece_element);
                capture.play();

                if (current_piece == "pawn") {
                    current_piece_element.setAttribute("data-moved", true);
                }
            }
        } else {
            target_square_element.innerHTML = "";
            target_square_element.append(current_piece_element);
            move_self.play();

            if (current_piece == "pawn") {
                current_piece_element.setAttribute("data-moved", true);
            }
        }
        change_player();
    }
}

function search_pawn_moves(current_piece_element, current_square) {
    const pawn_has_moved = current_piece_element.getAttribute("data-moved") == "true" ? true : false;
    const moves = [];
    const col = current_square[0];
    const row = current_square[1];
    let left_diag_square;
    let right_diag_square;
    const pawn_color = current_piece_element.classList.contains("white_piece") ? "white" : "black";

    if (pawn_color == "white") {
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
            moves.push(left_diag_square.getAttribute("data-location"));
            console.log(moves);
        }

        if (right_diag_square != undefined && right_diag_square.hasChildNodes()) {
            moves.push(right_diag_square.getAttribute("data-location"));
        }

        if (!pawn_has_moved) {
            const square_above = document.querySelector(`[data-location="${col}${Number(row) + 2}"]`);
            if (!is_row_out_of_bounds(Number(row) + 2) && !square_above.hasChildNodes()) {
                moves.push(`${col}${Number(row) + 2}`);
            }
        }

        const square_above = document.querySelector(`[data-location="${col}${Number(row) + 1}"]`);
        if (!is_row_out_of_bounds(Number(row) + 1) && !square_above.hasChildNodes()) {
            moves.push(`${col}${Number(row) + 1}`);
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
            moves.push(left_diag_square.getAttribute("data-location"));
        }

        if (right_diag_square != undefined && right_diag_square.hasChildNodes()) {
            moves.push(right_diag_square.getAttribute("data-location"));
        }
        if (!pawn_has_moved) {
            const square_above = document.querySelector(`[data-location="${col}${Number(row) - 2}"]`);
            if (!is_row_out_of_bounds(Number(row) - 2) && !square_above.hasChildNodes()) {
                moves.push(`${col}${Number(row) - 2}`);
            }
        }

        const square_above = document.querySelector(`[data-location="${col}${Number(row) - 1}"]`);
        if (!is_row_out_of_bounds(Number(row) - 1) && !square_above.hasChildNodes()) {
            moves.push(`${col}${Number(row) - 1}`);
        }
    }

    return moves;
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

function search_rook_moves(current_square) {
    const moves = [];
    const col = current_square[0];
    const row = current_square[1];

    const current_column_index = column_letter.indexOf(col);

    // Search above
    for (let cur_row = Number(row) + 1; cur_row <= 8; cur_row++) {
        const square_element = document.querySelector(`[data-location="${col}${cur_row}"]`);
        const can_continue_searching = continue_searching(square_element, moves);
        if (!can_continue_searching) {
            break;
        }
    }

    // Search below
    for (let cur_row = Number(row) - 1; cur_row >= 1; cur_row--) {
        const square_element = document.querySelector(`[data-location="${col}${cur_row}"]`);
        const can_continue_searching = continue_searching(square_element, moves);
        if (!can_continue_searching) {
            break;
        }
    }

    // Search right
    for (let cur_col = current_column_index + 1; cur_col <= 8; cur_col++) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${row}"]`);
        const can_continue_searching = continue_searching(square_element, moves);
        if (!can_continue_searching) {
            break;
        }
    }

    // Search left
    for (let cur_col = current_column_index - 1; cur_col >= 1; cur_col--) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${row}"]`);
        const can_continue_searching = continue_searching(square_element, moves);
        if (!can_continue_searching) {
            break;
        }
    }

    return moves;
}

function search_bishop_moves(current_square) {
    const moves = [];
    const col = current_square[0];
    const row = current_square[1];
    let cur_row;

    const current_column_index = column_letter.indexOf(col);

    // Search north east diagonal
    cur_row = Number(row) + 1;
    for (let cur_col = current_column_index + 1; cur_col <= 8; cur_col++) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
        const can_continue_searching = continue_searching(square_element, moves);
        if (!can_continue_searching) {
            break;
        }
        cur_row++;
    }

    // Search north west diagonal
    cur_row = Number(row) + 1;
    for (let cur_col = current_column_index - 1; cur_col >= 1; cur_col--) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
        const can_continue_searching = continue_searching(square_element, moves);
        if (!can_continue_searching) {
            break;
        }
        cur_row++;
    }

    // Search south east diagonal
    cur_row = Number(row) - 1;
    for (let cur_col = current_column_index + 1; cur_col <= 8; cur_col++) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
        const can_continue_searching = continue_searching(square_element, moves);
        if (!can_continue_searching) {
            break;
        }
        cur_row--;
    }

    // Search south west diagonal
    cur_row = Number(row) - 1;
    for (let cur_col = current_column_index - 1; cur_col >= 1; cur_col--) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
        const can_continue_searching = continue_searching(square_element, moves);
        if (!can_continue_searching) {
            break;
        }
        cur_row--;
    }

    return moves;
}
function search_knight_moves(current_square) {
    const moves = [];
    const col = current_square[0];
    const row = current_square[1];
    let square_element;

    const current_column_index = column_letter.indexOf(col);

    // Get all possible east positions
    square_element = document.querySelector(`[data-location="${column_letter[current_column_index - 1]}${Number(row) + 2}"]`);
    continue_searching(square_element, moves);

    square_element = document.querySelector(`[data-location="${column_letter[current_column_index - 1]}${Number(row) - 2}"]`);
    continue_searching(square_element, moves);

    square_element = document.querySelector(`[data-location="${column_letter[current_column_index - 2]}${Number(row) + 1}"]`);
    continue_searching(square_element, moves);

    square_element = document.querySelector(`[data-location="${column_letter[current_column_index - 2]}${Number(row) - 1}"]`);
    continue_searching(square_element, moves);

    // Get all possible west positions
    square_element = document.querySelector(`[data-location="${column_letter[current_column_index + 1]}${Number(row) + 2}"]`);
    continue_searching(square_element, moves);

    square_element = document.querySelector(`[data-location="${column_letter[current_column_index + 1]}${Number(row) - 2}"]`);
    continue_searching(square_element, moves);

    square_element = document.querySelector(`[data-location="${column_letter[current_column_index + 2]}${Number(row) + 1}"]`);
    continue_searching(square_element, moves);

    square_element = document.querySelector(`[data-location="${column_letter[current_column_index + 2]}${Number(row) - 1}"]`);
    continue_searching(square_element, moves);
    return moves;
}
function search_queen_moves(current_square) {
    const moves = [];
    const col = current_square[0];
    const row = current_square[1];

    const current_column_index = column_letter.indexOf(col);

    // Search above
    for (let cur_row = Number(row) + 1; cur_row <= 8; cur_row++) {
        const square_element = document.querySelector(`[data-location="${col}${cur_row}"]`);
        const can_continue_searching = continue_searching(square_element, moves);
        if (!can_continue_searching) {
            break;
        }
    }

    // Search below
    for (let cur_row = Number(row) - 1; cur_row >= 1; cur_row--) {
        const square_element = document.querySelector(`[data-location="${col}${cur_row}"]`);
        const can_continue_searching = continue_searching(square_element, moves);
        if (!can_continue_searching) {
            break;
        }
    }

    // Search right
    for (let cur_col = current_column_index + 1; cur_col <= 8; cur_col++) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${row}"]`);
        const can_continue_searching = continue_searching(square_element, moves);
        if (!can_continue_searching) {
            break;
        }
    }

    // Search left
    for (let cur_col = current_column_index - 1; cur_col >= 1; cur_col--) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${row}"]`);
        const can_continue_searching = continue_searching(square_element, moves);
        if (!can_continue_searching) {
            break;
        }
    }

    let cur_row;

    // Search north east diagonal
    cur_row = Number(row) + 1;
    for (let cur_col = current_column_index + 1; cur_col <= 8; cur_col++) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
        const can_continue_searching = continue_searching(square_element, moves);
        if (!can_continue_searching) {
            break;
        }
        cur_row++;
    }

    // Search north west diagonal
    cur_row = Number(row) + 1;
    for (let cur_col = current_column_index - 1; cur_col >= 1; cur_col--) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
        const can_continue_searching = continue_searching(square_element, moves);
        if (!can_continue_searching) {
            break;
        }
        cur_row++;
    }

    // Search south east diagonal
    cur_row = Number(row) - 1;
    for (let cur_col = current_column_index + 1; cur_col <= 8; cur_col++) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
        const can_continue_searching = continue_searching(square_element, moves);
        if (!can_continue_searching) {
            break;
        }
        cur_row--;
    }

    // Search south west diagonal
    cur_row = Number(row) - 1;
    for (let cur_col = current_column_index - 1; cur_col >= 1; cur_col--) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
        const can_continue_searching = continue_searching(square_element, moves);
        if (!can_continue_searching) {
            break;
        }
        cur_row--;
    }

    return moves;
}
function search_king_moves(current_square) {
    const moves = [];
    const col = current_square[0];
    const row = current_square[1];

    const current_column_index = column_letter.indexOf(col);

    // Get top squares
    for (let cur_col = current_column_index - 1; cur_col <= current_column_index + 1; cur_col++) {
        const square = document.querySelector(`[data-location="${column_letter[cur_col]}${Number(row) + 1}"]`);
        continue_searching(square, moves);
    }

    // Get bottom squares
    for (let cur_col = current_column_index - 1; cur_col <= current_column_index + 1; cur_col++) {
        const square = document.querySelector(`[data-location="${column_letter[cur_col]}${Number(row) - 1}"]`);
        continue_searching(square, moves);
    }

    // Get left square
    const left_square = document.querySelector(`[data-location="${column_letter[current_column_index - 1]}${Number(row)}"]`);
    continue_searching(left_square, moves);

    // Get right square
    const right_square = document.querySelector(`[data-location="${column_letter[current_column_index + 1]}${Number(row)}"]`);
    continue_searching(right_square, moves);

    return moves;
}

function continue_searching(square_element, moves) {
    if (square_element == null) {
        return false;
    }

    if (square_element.hasChildNodes()) {
        moves.push(square_element.getAttribute("data-location"));
        return false;
    } else {
        moves.push(square_element.getAttribute("data-location"));
        return true;
    }
}

function find_attacked_squares() {
    const attacked_squares = [];
    if (current_player == "white") {
        const squares = chessboard.childNodes;

        for (let square of squares) {
            if (square.hasChildNodes() && square.childNodes[0].classList.contains("black_piece")) {
                const piece = square.childNodes[0].id;
                const piece_location = square.getAttribute("data-location");

                if (piece == "pawn") {
                    const col = piece_location[0];
                    const row = piece_location[1];
                    const col_letter_index = column_letter.indexOf(col);

                    if (column_letter[col_letter_index - 1] == "" && column_letter[col_letter_index + 1] != "") {
                        attacked_squares.push(`${column_letter[col_letter_index + 1]}${Number(row) - 1}`);
                    } else if (column_letter[col_letter_index + 1] == "" && column_letter[col_letter_index - 1] != "") {
                        attacked_squares.push(`${column_letter[col_letter_index - 1]}${Number(row) - 1}`);
                    } else {
                        attacked_squares.push([
                            `${column_letter[col_letter_index - 1]}${Number(row) - 1}`,
                            `${column_letter[col_letter_index + 1]}${Number(row) - 1}`,
                        ]);
                    }
                } else {
                    attacked_squares.push(search(piece, piece_location));
                }
            }
        }
    } else if (current_player == "black") {
        const squares = chessboard.childNodes;

        for (let square of squares) {
            if (square.hasChildNodes() && square.childNodes[0].classList.contains("white_piece")) {
                const piece = square.childNodes[0].id;
                const piece_location = square.getAttribute("data-location");

                if (piece == "pawn") {
                    const col = piece_location[0];
                    const row = piece_location[1];
                    const col_letter_index = column_letter.indexOf(col);
                    if (column_letter[col_letter_index - 1] == "" && column_letter[col_letter_index + 1] != "") {
                        attacked_squares.push(`${column_letter[col_letter_index + 1]}${Number(row) + 1}`);
                    } else if (column_letter[col_letter_index + 1] == "" && column_letter[col_letter_index - 1] != "") {
                        attacked_squares.push(`${column_letter[col_letter_index - 1]}${Number(row) + 1}`);
                    } else {
                        attacked_squares.push([
                            `${column_letter[col_letter_index - 1]}${Number(row) + 1}`,
                            `${column_letter[col_letter_index + 1]}${Number(row) + 1}`,
                        ]);
                    }
                } else {
                    attacked_squares.push(search(piece, piece_location));
                }
            }
        }
    }

    return attacked_squares;
}
