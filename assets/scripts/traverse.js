// The purpose of this file is to return the valid moveset based on the parameters that are given.

function begin_search(color, piece_name, piece_element, piece_location, bypass_self, bypass_all, pawn_attack_only) {
    var moves = [];

    switch (piece_name) {
        case "king":
            moves = find_king_moves(color, piece_location);
            break;
        case "knight":
            moves = find_knight_moves(color, piece_location);
            break;
        case "pawn":
            moves = find_pawn_moves(color, piece_element, piece_location, pawn_attack_only);
            break;
        case "rook":
            moves = find_rook_moves(color, piece_location, bypass_self, bypass_all);
            break;
        case "bishop":
            moves = find_bishop_moves(color, piece_location, bypass_self, bypass_all);
            break;
        case "queen":
            moves = find_queen_moves(color, piece_location, bypass_self, bypass_all);
            break;
    }

    return moves;
}

function continue_search(color, moves, square_element, bypass_self, bypass_all) {
    // If square doesnt exist, exit search.
    if (square_element == null) {
        return false;
    }

    const location = square_element.getAttribute("data-location");
    const piece = square_element.firstChild;

    // Always add empty square and continue search.
    if (!square_element.hasChildNodes()) {
        moves.push(location);
        return true;
    }

    // If bypass_self == true, continue search if piece is current players.
    // The purpose of this is to be able to know if a piece is pinned to its king.
    if (bypass_self) {
        if (piece.classList.contains(`${color}_piece`)) {
            moves.push(location);
            return true;
        } else {
            moves.push(location);
            return false;
        }
    }

    if (bypass_all) {
        moves.push(location);
        return true;
    }

    // Generic behavior.

    if (piece.classList.contains(`${color}_piece`)) {
        return false;
    } else {
        moves.push(location);
        return false;
    }
}

function find_pawn_moves(color, piece_element, piece_location, pawn_attack_only) {
    const moves = [];
    const col = piece_location[0];
    const row = piece_location[1];
    const col_index = column_letter.indexOf(col);

    const pawn_moved = piece_element.getAttribute("data-moved") == "true" ? true : false;

    if (color == "white") {
        if (pawn_attack_only) {
            const west_col = column_letter[col_index - 1];
            const east_col = column_letter[col_index + 1];
            const nw_square = document.querySelector(`[data-location="${west_col}${Number(row) + 1}"]`);
            const ne_square = document.querySelector(`[data-location="${east_col}${Number(row) + 1}"]`);

            if (nw_square != null) {
                const move = `${west_col}${Number(row) + 1}`;
                moves.push(move);
            }

            if (ne_square != null) {
                const move = `${east_col}${Number(row) + 1}`;
                moves.push(move);
            }
            return moves;
        }
        const left_square = document.querySelector(`[data-location="${column_letter[col_index - 1]}${row}"]`);
        const right_square = document.querySelector(`[data-location="${column_letter[col_index + 1]}${row}"]`);
        const sq_above = document.querySelector(`[data-location="${col}${Number(row) + 1}"]`);

        // If square above is exists and is empty, add as move.
        if (sq_above != null && !sq_above.hasChildNodes()) {
            const move = `${col}${Number(row) + 1}`;
            moves.push(move);
        }

        // If pawn hasnt moved, and square two spaces above is empty, add as move.
        if (!pawn_moved) {
            const two_sq_above = document.querySelector(`[data-location="${col}${Number(row) + 2}"]`);
            if (two_sq_above != null && !two_sq_above.hasChildNodes()) {
                const move = `${col}${Number(row) + 2}`;
                moves.push(move);
            }
        }

        // Can the pawn capture a piece?
        const west_col = column_letter[col_index - 1];
        const east_col = column_letter[col_index + 1];
        const nw_square = document.querySelector(`[data-location="${west_col}${Number(row) + 1}"]`);
        const ne_square = document.querySelector(`[data-location="${east_col}${Number(row) + 1}"]`);

        if (nw_square != null && nw_square.hasChildNodes() && !nw_square.firstChild.classList.contains(`${color}_piece`)) {
            const move = `${west_col}${Number(row) + 1}`;
            moves.push(move);
        }

        if (ne_square != null && ne_square.hasChildNodes() && !ne_square.firstChild.classList.contains(`${color}_piece`)) {
            const move = `${east_col}${Number(row) + 1}`;
            moves.push(move);
        }

        // Determine if en passant is possible.
        if (left_square != null && left_square.hasChildNodes()) {
            const piece = left_square.firstChild;
            if (piece.getAttribute("data-enpassant") == "true") {
                // Left square is enpassant. We can take and go above it.
                moves.push(`${column_letter[col_index - 1]}${Number(row) + 1}`);
            }
        }

        if (right_square != null && right_square.hasChildNodes()) {
            const piece = right_square.firstChild;
            if (piece.getAttribute("data-enpassant") == "true") {
                moves.push(`${column_letter[col_index + 1]}${Number(row) + 1}`);
            }
        }
    } else {
        // If square above is exists and is empty, add as move.
        if (pawn_attack_only) {
            const west_col = column_letter[col_index + 1];
            const east_col = column_letter[col_index - 1];
            const nw_square = document.querySelector(`[data-location="${west_col}${Number(row) - 1}"]`);
            const ne_square = document.querySelector(`[data-location="${east_col}${Number(row) - 1}"]`);

            if (nw_square != null) {
                const move = `${west_col}${Number(row) - 1}`;
                moves.push(move);
            }

            if (ne_square != null) {
                const move = `${east_col}${Number(row) - 1}`;
                moves.push(move);
            }
            return moves;
        }
        const sq_above = document.querySelector(`[data-location="${col}${Number(row) - 1}"]`);
        const left_square = document.querySelector(`[data-location="${column_letter[col_index + 1]}${row}"]`);
        const right_square = document.querySelector(`[data-location="${column_letter[col_index - 1]}${row}"]`);
        if (sq_above != null && !sq_above.hasChildNodes()) {
            const move = `${col}${Number(row) - 1}`;
            moves.push(move);
        }

        // If pawn hasnt moved, and square two spaces above is empty, add as move.
        if (!pawn_moved) {
            const two_sq_above = document.querySelector(`[data-location="${col}${Number(row) - 2}"]`);
            if (two_sq_above != null && !two_sq_above.hasChildNodes()) {
                const move = `${col}${Number(row) - 2}`;
                moves.push(move);
            }
        }

        // Can the pawn capture a piece?
        const west_col = column_letter[col_index + 1];
        const east_col = column_letter[col_index - 1];
        const nw_square = document.querySelector(`[data-location="${west_col}${Number(row) - 1}"]`);
        const ne_square = document.querySelector(`[data-location="${east_col}${Number(row) - 1}"]`);

        if (nw_square != null && nw_square.hasChildNodes() && !nw_square.firstChild.classList.contains(`${color}_piece`)) {
            const move = `${west_col}${Number(row) - 1}`;
            moves.push(move);
        }

        if (ne_square != null && ne_square.hasChildNodes() && !ne_square.firstChild.classList.contains(`${color}_piece`)) {
            const move = `${east_col}${Number(row) - 1}`;
            moves.push(move);
        }

        // Determine if en passant is possible.
        if (left_square != null && left_square.hasChildNodes()) {
            const piece = left_square.firstChild;
            if (piece.getAttribute("data-enpassant") == "true") {
                // Left square is enpassant. We can take and go above it.
                moves.push(`${column_letter[col_index + 1]}${Number(row) - 1}`);
            }
        }

        if (right_square != null && right_square.hasChildNodes()) {
            const piece = right_square.firstChild;
            if (piece.getAttribute("data-enpassant") == "true") {
                moves.push(`${column_letter[col_index - 1]}${Number(row) - 1}`);
            }
        }
    }
    return moves;
}

function find_knight_moves(color, piece_location) {
    const moves = [];
    const col = piece_location[0];
    const row = piece_location[1];
    const col_index = column_letter.indexOf(col);

    let square_element;
    // Get all possible east positions
    square_element = document.querySelector(`[data-location="${column_letter[col_index - 1]}${Number(row) + 2}"]`);
    continue_search(color, moves, square_element);

    square_element = document.querySelector(`[data-location="${column_letter[col_index - 1]}${Number(row) - 2}"]`);
    continue_search(color, moves, square_element);

    square_element = document.querySelector(`[data-location="${column_letter[col_index - 2]}${Number(row) + 1}"]`);
    continue_search(color, moves, square_element);

    square_element = document.querySelector(`[data-location="${column_letter[col_index - 2]}${Number(row) - 1}"]`);
    continue_search(color, moves, square_element);

    // Get all possible west positions
    square_element = document.querySelector(`[data-location="${column_letter[col_index + 1]}${Number(row) + 2}"]`);
    continue_search(color, moves, square_element);

    square_element = document.querySelector(`[data-location="${column_letter[col_index + 1]}${Number(row) - 2}"]`);
    continue_search(color, moves, square_element);

    square_element = document.querySelector(`[data-location="${column_letter[col_index + 2]}${Number(row) + 1}"]`);
    continue_search(color, moves, square_element);

    square_element = document.querySelector(`[data-location="${column_letter[col_index + 2]}${Number(row) - 1}"]`);
    continue_search(color, moves, square_element);

    return moves;
}

function find_rook_moves(color, piece_location, bypass_self, bypass_all) {
    const moves = [];
    const col = piece_location[0];
    const row = piece_location[1];
    const col_index = column_letter.indexOf(col);

    // Search above
    for (let cur_row = Number(row) + 1; cur_row <= 8; cur_row++) {
        const square_element = document.querySelector(`[data-location="${col}${cur_row}"]`);
        const can_continue_searching = continue_search(color, moves, square_element, bypass_self, bypass_all);
        if (!can_continue_searching) break;
    }

    // Search below
    for (let cur_row = Number(row) - 1; cur_row >= 1; cur_row--) {
        const square_element = document.querySelector(`[data-location="${col}${cur_row}"]`);
        const can_continue_searching = continue_search(color, moves, square_element, bypass_self, bypass_all);
        if (!can_continue_searching) break;
    }

    // Search right
    for (let cur_col = col_index + 1; cur_col <= 8; cur_col++) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${row}"]`);
        const can_continue_searching = continue_search(color, moves, square_element, bypass_self, bypass_all);
        if (!can_continue_searching) break;
    }

    // Search left
    for (let cur_col = col_index - 1; cur_col >= 1; cur_col--) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${row}"]`);
        const can_continue_searching = continue_search(color, moves, square_element, bypass_self, bypass_all);
        if (!can_continue_searching) break;
    }

    return moves;
}

function find_bishop_moves(color, piece_location, bypass_self, bypass_all) {
    const moves = [];
    const col = piece_location[0];
    const row = piece_location[1];
    const col_index = column_letter.indexOf(col);

    // Search north east diagonal
    cur_row = Number(row) + 1;
    for (let cur_col = col_index + 1; cur_col <= 8; cur_col++) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
        const can_continue_searching = continue_search(color, moves, square_element, bypass_self, bypass_all);
        if (!can_continue_searching) break;
        cur_row++;
    }

    // Search north west diagonal
    cur_row = Number(row) + 1;
    for (let cur_col = col_index - 1; cur_col >= 1; cur_col--) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
        const can_continue_searching = continue_search(color, moves, square_element, bypass_self, bypass_all);
        if (!can_continue_searching) break;
        cur_row++;
    }

    // Search south east diagonal
    cur_row = Number(row) - 1;
    for (let cur_col = col_index + 1; cur_col <= 8; cur_col++) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
        const can_continue_searching = continue_search(color, moves, square_element, bypass_self, bypass_all);
        if (!can_continue_searching) break;
        cur_row--;
    }

    // Search south west diagonal
    cur_row = Number(row) - 1;
    for (let cur_col = col_index - 1; cur_col >= 1; cur_col--) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
        const can_continue_searching = continue_search(color, moves, square_element, bypass_self, bypass_all);
        if (!can_continue_searching) break;
        cur_row--;
    }

    return moves;
}

function find_queen_moves(color, piece_location, bypass_self, bypass_all) {
    const moves = [];
    const col = piece_location[0];
    const row = piece_location[1];
    const col_index = column_letter.indexOf(col);

    // Search above
    for (let cur_row = Number(row) + 1; cur_row <= 8; cur_row++) {
        const square_element = document.querySelector(`[data-location="${col}${cur_row}"]`);
        const can_continue_searching = continue_search(color, moves, square_element, bypass_self, bypass_all);
        if (!can_continue_searching) break;
    }

    // Search below
    for (let cur_row = Number(row) - 1; cur_row >= 1; cur_row--) {
        const square_element = document.querySelector(`[data-location="${col}${cur_row}"]`);
        const can_continue_searching = continue_search(color, moves, square_element, bypass_self, bypass_all);
        if (!can_continue_searching) break;
    }

    // Search right
    for (let cur_col = col_index + 1; cur_col <= 8; cur_col++) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${row}"]`);
        const can_continue_searching = continue_search(color, moves, square_element, bypass_self, bypass_all);
        if (!can_continue_searching) break;
    }

    // Search left
    for (let cur_col = col_index - 1; cur_col >= 1; cur_col--) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${row}"]`);
        const can_continue_searching = continue_search(color, moves, square_element, bypass_self, bypass_all);
        if (!can_continue_searching) break;
    }

    // Search north east diagonal
    cur_row = Number(row) + 1;
    for (let cur_col = col_index + 1; cur_col <= 8; cur_col++) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
        const can_continue_searching = continue_search(color, moves, square_element, bypass_self, bypass_all);
        if (!can_continue_searching) break;
        cur_row++;
    }

    // Search north west diagonal
    cur_row = Number(row) + 1;
    for (let cur_col = col_index - 1; cur_col >= 1; cur_col--) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
        const can_continue_searching = continue_search(color, moves, square_element, bypass_self, bypass_all);
        if (!can_continue_searching) break;
        cur_row++;
    }

    // Search south east diagonal
    cur_row = Number(row) - 1;
    for (let cur_col = col_index + 1; cur_col <= 8; cur_col++) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
        const can_continue_searching = continue_search(color, moves, square_element, bypass_self, bypass_all);
        if (!can_continue_searching) break;
        cur_row--;
    }

    // Search south west diagonal
    cur_row = Number(row) - 1;
    for (let cur_col = col_index - 1; cur_col >= 1; cur_col--) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
        const can_continue_searching = continue_search(color, moves, square_element, bypass_self, bypass_all);
        if (!can_continue_searching) break;
        cur_row--;
    }

    return moves;
}

function find_king_moves(color, piece_location) {
    const opponent_color = current_player == "white" ? "black" : "white";
    const opponent_moves = []
    const moves = [];
    const col = piece_location[0];
    const row = piece_location[1];
    const col_index = column_letter.indexOf(col);

    // Get top squares
    for (let cur_col = col_index - 1; cur_col <= col_index + 1; cur_col++) {
        const square_element = document.querySelector(`[data-location="${column_letter[cur_col]}${Number(row) + 1}"]`);
        continue_search(color, moves, square_element);
    }

    // Get bottom squares
    for (let cur_col = col_index - 1; cur_col <= col_index + 1; cur_col++) {
        const square_element = document.querySelector(`[data-location="${column_letter[cur_col]}${Number(row) - 1}"]`);
        continue_search(color, moves, square_element);
    }

    // Get left square
    const left_square = document.querySelector(`[data-location="${column_letter[col_index - 1]}${Number(row)}"]`);
    continue_search(color, moves, left_square);

    // Get right square
    const right_square = document.querySelector(`[data-location="${column_letter[col_index + 1]}${Number(row)}"]`);
    continue_search(color, moves, right_square);

    return moves;
}
