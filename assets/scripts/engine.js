let current_player = "white";
let current_piece_element;
let current_piece;
let current_square;
let current_available_moves;
let is_under_check;
let threat;
console.log("~~~~~~~~~CHESS LITE V1.0~~~~~~~~~~~~")

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

    // Check for check, checkmate, and stalemate.
    threat = check_for_check();
}

function search(current_piece, current_square, piece_element, bypass, max_bypass, attack_only) {
    let moves_found;
    switch (current_piece) {
        case "pawn":
            moves_found = search_pawn_moves(piece_element, current_square, attack_only);
            break;
        case "rook":
            moves_found = search_rook_moves(current_square, bypass, max_bypass);
            break;
        case "bishop":
            moves_found = search_bishop_moves(current_square, bypass, max_bypass);
            break;
        case "knight":
            moves_found = search_knight_moves(current_square);
            break;
        case "queen":
            moves_found = search_queen_moves(current_square, bypass, max_bypass);
            break;
        case "king":
            moves_found = search_king_moves(current_square, bypass, max_bypass);
            break;
    }

    return moves_found;
}

function valid_start(piece, piece_color, square) {
    if (piece_color == current_player) {
        current_piece_element = piece;
        current_piece = piece.getAttribute("id");
        current_square = square;
        let moves_to_get_out_of_check;
        let moves_allowed;
        let attacked_sqs;

        const pinned = check_if_piece_is_pinned(square);

        if (pinned.includes(current_square) && pinned.length > 1 && pinned.length < 4 && current_piece != "king") {
            if (current_piece == "pawn") {
                const pawn_col = square[0];
                const threat_col = pinned[0][0];
                if (pawn_col == threat_col) {
                    moves_allowed = search(current_piece, current_square, piece);
                    current_available_moves = moves_allowed;
                }
            } else {
                moves_allowed = search(current_piece, current_square, piece);
                moves_allowed = moves_allowed.filter((move) => pinned.includes(move));
                current_available_moves = moves_allowed;
            }
        } else if (!is_under_check) {
            moves_allowed = search(current_piece, current_square, piece);
            if (current_piece == "king") {
                attacked_sqs = find_attacked_squares();
                const set = new Set([].concat(...attacked_sqs));
                moves_allowed = moves_allowed.filter((move) => !set.has(move));
            }
            current_available_moves = moves_allowed;
        } else {
            moves_to_get_out_of_check = get_out_of_check();
            moves_allowed = search(current_piece, current_square, piece);
            if (current_piece == "king") {

                attacked_sqs = all_dangerous_squares();
                const set = new Set([].concat(...attacked_sqs));
                let king_moves = moves_allowed.filter((move) => !set.has(move));
                current_available_moves = king_moves;
            } else {
                current_available_moves = moves_allowed.filter((move) => moves_to_get_out_of_check.includes(move));
            }
        }

        // Highlight available squares!
        const squares = chessboard.childNodes;
        for (let square of squares) {
            const square_location = square.getAttribute("data-location");
            if (current_available_moves.includes(square_location)) {
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

function search_pawn_moves(piece_element, current_square, attack_only) {
    const pawn_has_moved = piece_element.getAttribute("data-moved") == "true" ? true : false;
    const moves = [];
    const col = current_square[0];
    const row = current_square[1];
    let left_diag_square;
    let right_diag_square;
    const pawn_color = piece_element.classList.contains("white_piece") ? "white" : "black";

    if (pawn_color == "white") {
        const current_column_index = column_letter.indexOf(col);
        const left_col = column_letter[current_column_index - 1];
        const right_col = column_letter[current_column_index + 1];

        if (attack_only) {
            if (!is_col_of_bounds(left_col)) {
                left_diag_square = document.querySelector(`[data-location="${left_col}${Number(row) + 1}"]`);
            }
            if (!is_col_of_bounds(right_col)) {
                right_diag_square = document.querySelector(`[data-location="${right_col}${Number(row) + 1}"]`);
            }

            if (left_diag_square != undefined) {
                moves.push(left_diag_square.getAttribute("data-location"));
            }
    
            if (right_diag_square != undefined) {
                moves.push(right_diag_square.getAttribute("data-location"));
            }

            return moves;
        }

        if (!is_col_of_bounds(left_col)) {
            left_diag_square = document.querySelector(`[data-location="${left_col}${Number(row) + 1}"]`);
        }
        if (!is_col_of_bounds(right_col)) {
            right_diag_square = document.querySelector(`[data-location="${right_col}${Number(row) + 1}"]`);
        }

        if (left_diag_square != undefined && left_diag_square.hasChildNodes()) {
            moves.push(left_diag_square.getAttribute("data-location"));
        }

        if (right_diag_square != undefined && right_diag_square.hasChildNodes()) {
            moves.push(right_diag_square.getAttribute("data-location"));
        }

        if (!pawn_has_moved) {
            const square_right_above = document.querySelector(`[data-location="${col}${Number(row) + 1}"]`);
            const square_two_above = document.querySelector(`[data-location="${col}${Number(row) + 2}"]`);
            if (!is_row_out_of_bounds(Number(row) + 2) && !square_right_above.hasChildNodes() && !square_two_above.hasChildNodes()) {
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

        if (attack_only) {
            if (!is_col_of_bounds(left_col)) {
                left_diag_square = document.querySelector(`[data-location="${left_col}${Number(row) - 1}"]`);
            }
            if (!is_col_of_bounds(right_col)) {
                right_diag_square = document.querySelector(`[data-location="${right_col}${Number(row) - 1}"]`);
            }

            if (left_diag_square != undefined) {
                moves.push(left_diag_square.getAttribute("data-location"));
            }
    
            if (right_diag_square != undefined) {
                moves.push(right_diag_square.getAttribute("data-location"));
            }

            return moves;
        }

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
            const square_right_above = document.querySelector(`[data-location="${col}${Number(row) - 1}"]`);
            const square_two_above = document.querySelector(`[data-location="${col}${Number(row) - 2}"]`);
            if (!is_row_out_of_bounds(Number(row) - 2) && !square_two_above.hasChildNodes() && !square_right_above.hasChildNodes()) {
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

function search_rook_moves(current_square, bypass, max_bypass) {
    const moves = [];
    const col = current_square[0];
    const row = current_square[1];

    const current_column_index = column_letter.indexOf(col);

    // Search above
    for (let cur_row = Number(row) + 1; cur_row <= 8; cur_row++) {
        const square_element = document.querySelector(`[data-location="${col}${cur_row}"]`);
        const can_continue_searching = continue_searching(square_element, moves, bypass, max_bypass);
        if (!can_continue_searching) {
            break;
        }
    }

    // Search below
    for (let cur_row = Number(row) - 1; cur_row >= 1; cur_row--) {
        const square_element = document.querySelector(`[data-location="${col}${cur_row}"]`);
        const can_continue_searching = continue_searching(square_element, moves, bypass, max_bypass);
        if (!can_continue_searching) {
            break;
        }
    }

    // Search right
    for (let cur_col = current_column_index + 1; cur_col <= 8; cur_col++) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${row}"]`);
        const can_continue_searching = continue_searching(square_element, moves, bypass, max_bypass);
        if (!can_continue_searching) {
            break;
        }
    }

    // Search left
    for (let cur_col = current_column_index - 1; cur_col >= 1; cur_col--) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${row}"]`);
        const can_continue_searching = continue_searching(square_element, moves, bypass, max_bypass);
        if (!can_continue_searching) {
            break;
        }
    }

    return moves;
}

function search_bishop_moves(current_square, bypass, max_bypass) {
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
        const can_continue_searching = continue_searching(square_element, moves, bypass, max_bypass);
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
        const can_continue_searching = continue_searching(square_element, moves, bypass, max_bypass);
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
        const can_continue_searching = continue_searching(square_element, moves, bypass, max_bypass);
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
        const can_continue_searching = continue_searching(square_element, moves, bypass, max_bypass);
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
function search_queen_moves(current_square, bypass, max_bypass) {
    const moves = [];
    const col = current_square[0];
    const row = current_square[1];

    const current_column_index = column_letter.indexOf(col);

    // Search above
    for (let cur_row = Number(row) + 1; cur_row <= 8; cur_row++) {
        const square_element = document.querySelector(`[data-location="${col}${cur_row}"]`);
        const can_continue_searching = continue_searching(square_element, moves, bypass, max_bypass);
        if (!can_continue_searching) {
            break;
        }
    }

    // Search below
    for (let cur_row = Number(row) - 1; cur_row >= 1; cur_row--) {
        const square_element = document.querySelector(`[data-location="${col}${cur_row}"]`);
        const can_continue_searching = continue_searching(square_element, moves, bypass, max_bypass);
        if (!can_continue_searching) {
            break;
        }
    }

    // Search right
    for (let cur_col = current_column_index + 1; cur_col <= 8; cur_col++) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${row}"]`);
        const can_continue_searching = continue_searching(square_element, moves, bypass, max_bypass);
        if (!can_continue_searching) {
            break;
        }
    }

    // Search left
    for (let cur_col = current_column_index - 1; cur_col >= 1; cur_col--) {
        const cur_col_letter = column_letter[cur_col];
        const square_element = document.querySelector(`[data-location="${cur_col_letter}${row}"]`);
        const can_continue_searching = continue_searching(square_element, moves, bypass, max_bypass);
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
        const can_continue_searching = continue_searching(square_element, moves, bypass, max_bypass);
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
        const can_continue_searching = continue_searching(square_element, moves, bypass, max_bypass);
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
        const can_continue_searching = continue_searching(square_element, moves, bypass, max_bypass);
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
        const can_continue_searching = continue_searching(square_element, moves, bypass, max_bypass);
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

function continue_searching(square_element, moves, bypass, max_bypass) {
    if (square_element == null) {
        return false;
    }

    if (max_bypass) {
        if (square_element.hasChildNodes()) {
            const piece = square_element.childNodes[0];
            if (piece.classList.contains(`${current_player}_piece`) && piece.getAttribute("id") != "king") {
                return false;
            }
        }
        moves.push(square_element.getAttribute("data-location"))
        return true;
    }

    if (square_element.hasChildNodes() && bypass) {
        if (!square_element.childNodes[0].classList.contains(`${current_player}_piece`)) {
            moves.push(square_element.getAttribute("data-location"));
            return false;
        } else {
            moves.push(square_element.getAttribute("data-location"));
            return true;
        }
    } else if (square_element.hasChildNodes()) {
        moves.push(square_element.getAttribute("data-location"));
        return false;
    } else {
        if (bypass) {
            return true;
        } else {
            moves.push(square_element.getAttribute("data-location"));
            return true;
        }
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

function check_for_check() {
    let king_location;
    let attacked_sqs;
    let threat_information = [];

    const squares = chessboard.childNodes;

    // Find the location of players king
    for (let square of squares) {
        if (square.hasChildNodes()) {
            const piece = square.childNodes[0];
            if (piece.classList.contains(`${current_player}_piece`)) {
                const piece_id = piece.id;
                if (piece.id == "king") {
                    king_location = square.getAttribute("data-location");
                }
            }
        }
    }

    attacked_sqs = find_attacked_squares();
    const set = new Set([].concat(...attacked_sqs));

    if (set.has(king_location)) {
        move_check.play();
        is_under_check = true;
        // Identify the threat.
        // Scan for the move set of each piece. Once a moveset is returned that contains the kings location, return the piece name and color.

        for (let square of squares) {
            if (square.hasChildNodes()) {
                const piece_element = square.childNodes[0];
                if (!piece_element.classList.contains(`${current_player}_piece`)) {
                    const piece_id = piece_element.id;
                    const current_square = square.getAttribute("data-location");
                    const move_set = search(piece_id, current_square, piece_element);
                    if (move_set.includes(king_location)) {
                        threat_information[0] = piece_id;
                        threat_information[1] = current_square;
                        threat_information[2] = king_location;
                        break;
                    }
                }
            }
        }
    } else {
        is_under_check = false;
        // move_self.play();
    }

    return threat_information;
}

function get_out_of_check() {
    const piece_names = ["pawn", "king", "queen", "rook", "bishop", "knight"];
    let moves = [];
    const king_location = threat[2];
    const threat_piece = threat[0];
    const threat_location = threat[1];
    const col = threat_location[0];
    const row = threat_location[1];
    const current_column_index = column_letter.indexOf(col);
    let cur_row;
    moves.push(threat_location);

    switch (threat_piece) {
        case "queen":
            let queen_sequences = [[], [], [], [], [], [], [], []];
            let queen_north_sequence = 0;
            let queen_south_sequence = 1;
            let queen_east_sequence = 2;
            let queen_west_sequence = 3;
            let queen_north_west_sequence = 4;
            let queen_north_east_sequence = 5;
            let queen_south_west_sequence = 6;
            let queen_south_east_sequence = 7;
            attacker_moves = search_queen_moves(threat_location);

            // Get north sequence
            for (let cur_row = Number(row) + 1; cur_row <= 8; cur_row++) {
                const element = document.querySelector(`[data-location="${col}${cur_row}"]`);
                const can_continue_searching = continue_searching(element, queen_sequences[queen_north_sequence]);
                if (!can_continue_searching) {
                    break;
                }
            }

            // Get south sequence
            for (let cur_row = Number(row) - 1; cur_row >= 1; cur_row--) {
                const element = document.querySelector(`[data-location="${col}${cur_row}"]`);
                const can_continue_searching = continue_searching(element, queen_sequences[queen_south_sequence]);
                if (!can_continue_searching) {
                    break;
                }
            }
            // Get east sequence
            for (let cur_col = current_column_index + 1; cur_col <= 8; cur_col++) {
                const cur_col_letter = column_letter[cur_col];
                const element = document.querySelector(`[data-location="${cur_col_letter}${row}"]`);
                const can_continue_searching = continue_searching(element, queen_sequences[queen_east_sequence]);
                if (!can_continue_searching) {
                    break;
                }
            }

            // Get west sequence
            for (let cur_col = current_column_index - 1; cur_col >= 1; cur_col--) {
                const cur_col_letter = column_letter[cur_col];
                const element = document.querySelector(`[data-location="${cur_col_letter}${row}"]`);
                const can_continue_searching = continue_searching(element, queen_sequences[queen_west_sequence]);
                if (!can_continue_searching) {
                    break;
                }
            }

            // Get north east seauence
            cur_row = Number(row) + 1;
            for (let cur_col = current_column_index + 1; cur_col <= 8; cur_col++) {
                const cur_col_letter = column_letter[cur_col];
                const element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
                const can_continue_searching = continue_searching(element, queen_sequences[queen_north_east_sequence]);
                if (!can_continue_searching) {
                    break;
                }
                cur_row++;
            }

            // Get north west sequence
            cur_row = Number(row) + 1;
            for (let cur_col = current_column_index - 1; cur_col >= 1; cur_col--) {
                const cur_col_letter = column_letter[cur_col];
                const element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
                const can_continue_searching = continue_searching(element, queen_sequences[queen_north_west_sequence]);
                if (!can_continue_searching) {
                    break;
                }
                cur_row++;
            }

            // Get south east sequence
            cur_row = Number(row) - 1;
            for (let cur_col = current_column_index + 1; cur_col <= 8; cur_col++) {
                const cur_col_letter = column_letter[cur_col];
                const element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
                const can_continue_searching = continue_searching(element, queen_sequences[queen_south_east_sequence]);
                if (!can_continue_searching) {
                    break;
                }
                cur_row--;
            }

            // Get south west sequence
            cur_row = Number(row) - 1;
            for (let cur_col = current_column_index - 1; cur_col >= 1; cur_col--) {
                const cur_col_letter = column_letter[cur_col];
                const element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
                const can_continue_searching = continue_searching(element, queen_sequences[queen_south_west_sequence]);
                if (!can_continue_searching) {
                    break;
                }
                cur_row--;
            }

            // Loop through all found sequences, add sequences that contains kings location
            for (let sequence of queen_sequences) {
                if (sequence.includes(king_location)) {
                    moves.push(sequence);
                }
            }

            break;

        case "bishop":
            let bishop_sequences = [[], [], [], []];
            let bishop_north_west_sequence = 0;
            let bishop_north_east_sequence = 1;
            let bishop_south_west_sequence = 2;
            let bishop_south_east_sequence = 3;

            // Get north east seauence
            cur_row = Number(row) + 1;
            for (let cur_col = current_column_index + 1; cur_col <= 8; cur_col++) {
                const cur_col_letter = column_letter[cur_col];
                const element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
                const can_continue_searching = continue_searching(element, bishop_sequences[bishop_north_east_sequence]);
                if (!can_continue_searching) {
                    break;
                }
                cur_row++;
            }

            // Get north west sequence
            cur_row = Number(row) + 1;
            for (let cur_col = current_column_index - 1; cur_col >= 1; cur_col--) {
                const cur_col_letter = column_letter[cur_col];
                const element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
                const can_continue_searching = continue_searching(element, bishop_sequences[bishop_north_west_sequence]);
                if (!can_continue_searching) {
                    break;
                }
                cur_row++;
            }

            // Get south east sequence
            cur_row = Number(row) - 1;
            for (let cur_col = current_column_index + 1; cur_col <= 8; cur_col++) {
                const cur_col_letter = column_letter[cur_col];
                const element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
                const can_continue_searching = continue_searching(element, bishop_sequences[bishop_south_east_sequence]);
                if (!can_continue_searching) {
                    break;
                }
                cur_row--;
            }

            // Get south west sequence
            cur_row = Number(row) - 1;
            for (let cur_col = current_column_index - 1; cur_col >= 1; cur_col--) {
                const cur_col_letter = column_letter[cur_col];
                const element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
                const can_continue_searching = continue_searching(element, bishop_sequences[bishop_south_west_sequence]);
                if (!can_continue_searching) {
                    break;
                }
                cur_row--;
            }

            // Loop through all found sequences, add sequences that contains kings location
            for (let sequence of bishop_sequences) {
                if (sequence.includes(king_location)) {
                    moves.push(sequence);
                }
            }

            break;
        case "rook":
            let rook_sequences = [[], [], [], []];
            let rook_north_sequence = 0;
            let rook_south_sequence = 1;
            let rook_east_sequence = 2;
            let rook_west_sequence = 3;

            // Get north sequence
            for (let cur_row = Number(row) + 1; cur_row <= 8; cur_row++) {
                const element = document.querySelector(`[data-location="${col}${cur_row}"]`);
                const can_continue_searching = continue_searching(element, rook_sequences[rook_north_sequence]);
                if (!can_continue_searching) {
                    break;
                }
            }

            // Get south sequence
            for (let cur_row = Number(row) - 1; cur_row >= 1; cur_row--) {
                const element = document.querySelector(`[data-location="${col}${cur_row}"]`);
                const can_continue_searching = continue_searching(element, rook_sequences[rook_south_sequence]);
                if (!can_continue_searching) {
                    break;
                }
            }
            // Get east sequence
            for (let cur_col = current_column_index + 1; cur_col <= 8; cur_col++) {
                const cur_col_letter = column_letter[cur_col];
                const element = document.querySelector(`[data-location="${cur_col_letter}${row}"]`);
                const can_continue_searching = continue_searching(element, rook_sequences[rook_east_sequence]);
                if (!can_continue_searching) {
                    break;
                }
            }

            // Get west sequence
            for (let cur_col = current_column_index - 1; cur_col >= 1; cur_col--) {
                const cur_col_letter = column_letter[cur_col];
                const element = document.querySelector(`[data-location="${cur_col_letter}${row}"]`);
                const can_continue_searching = continue_searching(element, rook_sequences[rook_west_sequence]);
                if (!can_continue_searching) {
                    break;
                }
            }

            // Loop through all found sequences, add sequences that contains kings location
            for (let sequence of rook_sequences) {
                if (sequence.includes(king_location)) {
                    moves.push(sequence);
                }
            }

            break;

        case "knight":
            // In the case of knights, the queen needs to be able to either move, or a piece needs to be able to capture the knight.
            // This functionality is handeled in valid start, as it handles king movement and knows the location of the threat.
            break;
        case "pawn":
            // Pawn can either block by moving forward or taking the threat. This functionallity is handled in other methods.
            break;
    }

    // Dont forget to delete repeated elements
    moves = Array.from(new Set([].concat(...moves)));
    return moves;
}

function all_dangerous_squares() {
    // This function returns all squares that are in line with opponents pieces, regardless of what is in its way.
    const max_bypass = true;
    const bypass = false;
    const attack_only = true;
    let moves = []
    const squares = chessboard.childNodes;

    squares.forEach((square) => {
        if (square.hasChildNodes()) {
            const piece = square.childNodes[0];
            if (!piece.classList.contains(`${current_player}_piece`)) {
                const piece_id = piece.getAttribute("id");
                const square_location = square.getAttribute("data-location")
                moves.push(search(piece_id, square_location, piece, bypass, max_bypass, attack_only));
            }
        }
    })
    return moves;
}
function check_if_piece_is_pinned(piece_location) {
    let bypass = true;
    const squares = chessboard.childNodes;
    let moves = [];
    let king_location;

    // Find where current player king is located;
    squares.forEach((square) => {
        if (square.hasChildNodes()) {
            const piece_color = square.childNodes[0].classList.contains("white_piece") ? "white" : "black";
            if (piece_color == current_player) {
                const piece = square.childNodes[0].getAttribute("id");
                if (piece == "king") {
                    king_location = square.getAttribute("data-location");
                }
            }
        }
    });

    squares.forEach((square) => {
        if (square.hasChildNodes()) {
            const piece_color = square.childNodes[0].classList.contains("white_piece") ? "white" : "black";
            if (piece_color != current_player) {
                const current_piece_location = square.getAttribute("data-location");
                const piece = square.childNodes[0].getAttribute("id");
                const col = current_piece_location[0];
                const row = current_piece_location[1];
                const current_column_index = column_letter.indexOf(col);
                let cur_row;

                switch (piece) {
                    case "queen":
                        let queen_sequences = [[], [], [], [], [], [], [], []];
                        let queen_north_sequence = 0;
                        let queen_south_sequence = 1;
                        let queen_east_sequence = 2;
                        let queen_west_sequence = 3;
                        let queen_north_west_sequence = 4;
                        let queen_north_east_sequence = 5;
                        let queen_south_west_sequence = 6;
                        let queen_south_east_sequence = 7;
                        queen_sequences.forEach(sequence => sequence.push(current_piece_location));
                        // attacker_moves = search_queen_moves(threat_location);

                        // Get north sequence
                        for (let cur_row = Number(row) + 1; cur_row <= 8; cur_row++) {
                            const element = document.querySelector(`[data-location="${col}${cur_row}"]`);
                            const can_continue_searching = continue_searching(element, queen_sequences[queen_north_sequence], bypass);
                            if (!can_continue_searching) {
                                break;
                            }
                        }
                        check_for_pin_piece_removal(queen_sequences[queen_north_sequence], king_location);

                        // Get south sequence
                        for (let cur_row = Number(row) - 1; cur_row >= 1; cur_row--) {
                            const element = document.querySelector(`[data-location="${col}${cur_row}"]`);
                            const can_continue_searching = continue_searching(element, queen_sequences[queen_south_sequence], bypass);
                            if (!can_continue_searching) {
                                break;
                            }
                        }
                        check_for_pin_piece_removal(queen_sequences[queen_south_sequence], king_location);

                        // Get east sequence
                        for (let cur_col = current_column_index + 1; cur_col <= 8; cur_col++) {
                            const cur_col_letter = column_letter[cur_col];
                            const element = document.querySelector(`[data-location="${cur_col_letter}${row}"]`);
                            const can_continue_searching = continue_searching(element, queen_sequences[queen_east_sequence], bypass);
                            if (!can_continue_searching) {
                                break;
                            }
                        }
                        check_for_pin_piece_removal(queen_sequences[queen_east_sequence], king_location);

                        // Get west sequence
                        for (let cur_col = current_column_index - 1; cur_col >= 1; cur_col--) {
                            const cur_col_letter = column_letter[cur_col];
                            const element = document.querySelector(`[data-location="${cur_col_letter}${row}"]`);
                            const can_continue_searching = continue_searching(element, queen_sequences[queen_west_sequence], bypass);
                            if (!can_continue_searching) {
                                break;
                            }
                        }
                        check_for_pin_piece_removal(queen_sequences[queen_west_sequence], king_location);

                        // Get north east seauence
                        cur_row = Number(row) + 1;
                        for (let cur_col = current_column_index + 1; cur_col <= 8; cur_col++) {
                            const cur_col_letter = column_letter[cur_col];
                            const element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
                            const can_continue_searching = continue_searching(element, queen_sequences[queen_north_east_sequence], bypass);
                            if (!can_continue_searching) {
                                break;
                            }
                            cur_row++;
                        }
                        check_for_pin_piece_removal(queen_sequences[queen_north_east_sequence], king_location);

                        // Get north west sequence
                        cur_row = Number(row) + 1;
                        for (let cur_col = current_column_index - 1; cur_col >= 1; cur_col--) {
                            const cur_col_letter = column_letter[cur_col];
                            const element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
                            const can_continue_searching = continue_searching(element, queen_sequences[queen_north_west_sequence], bypass);
                            if (!can_continue_searching) {
                                break;
                            }
                            cur_row++;
                        }
                        check_for_pin_piece_removal(queen_sequences[queen_north_west_sequence], king_location);

                        // Get south east sequence
                        cur_row = Number(row) - 1;
                        for (let cur_col = current_column_index + 1; cur_col <= 8; cur_col++) {
                            const cur_col_letter = column_letter[cur_col];
                            const element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
                            const can_continue_searching = continue_searching(element, queen_sequences[queen_south_east_sequence], bypass);
                            if (!can_continue_searching) {
                                break;
                            }
                            cur_row--;
                        }
                        check_for_pin_piece_removal(queen_sequences[queen_south_east_sequence], king_location);

                        // Get south west sequence
                        cur_row = Number(row) - 1;
                        for (let cur_col = current_column_index - 1; cur_col >= 1; cur_col--) {
                            const cur_col_letter = column_letter[cur_col];
                            const element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
                            const can_continue_searching = continue_searching(element, queen_sequences[queen_south_west_sequence], bypass);
                            if (!can_continue_searching) {
                                break;
                            }
                            cur_row--;
                        }
                        check_for_pin_piece_removal(queen_sequences[queen_south_west_sequence], king_location);

                        // Loop through all found sequences, add sequences that contains kings location
                        for (let sequence of queen_sequences) {
                            if (sequence.includes(king_location) && sequence.includes(piece_location)) {
                                moves.push(sequence);
                            }
                        }

                        break;

                    case "bishop":
                        let bishop_sequences = [[], [], [], []];
                        let bishop_north_west_sequence = 0;
                        let bishop_north_east_sequence = 1;
                        let bishop_south_west_sequence = 2;
                        let bishop_south_east_sequence = 3;
                        bishop_sequences.forEach(sequence => sequence.push(current_piece_location));

                        // Get north east seauence
                        cur_row = Number(row) + 1;
                        for (let cur_col = current_column_index + 1; cur_col <= 8; cur_col++) {
                            const cur_col_letter = column_letter[cur_col];
                            const element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
                            const can_continue_searching = continue_searching(element, bishop_sequences[bishop_north_east_sequence], bypass);
                            if (!can_continue_searching) {
                                break;
                            }
                            cur_row++;
                        }
                        check_for_pin_piece_removal(bishop_sequences[bishop_north_east_sequence], king_location);

                        // Get north west sequence
                        cur_row = Number(row) + 1;
                        for (let cur_col = current_column_index - 1; cur_col >= 1; cur_col--) {
                            const cur_col_letter = column_letter[cur_col];
                            const element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
                            const can_continue_searching = continue_searching(element, bishop_sequences[bishop_north_west_sequence], bypass);
                            if (!can_continue_searching) {
                                break;
                            }
                            cur_row++;
                        }
                        check_for_pin_piece_removal(bishop_sequences[bishop_north_west_sequence], king_location);

                        // Get south east sequence
                        cur_row = Number(row) - 1;
                        for (let cur_col = current_column_index + 1; cur_col <= 8; cur_col++) {
                            const cur_col_letter = column_letter[cur_col];
                            const element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
                            const can_continue_searching = continue_searching(element, bishop_sequences[bishop_south_east_sequence], bypass);
                            if (!can_continue_searching) {
                                break;
                            }
                            cur_row--;
                        }
                        check_for_pin_piece_removal(bishop_sequences[bishop_south_east_sequence], king_location);

                        // Get south west sequence
                        cur_row = Number(row) - 1;
                        for (let cur_col = current_column_index - 1; cur_col >= 1; cur_col--) {
                            const cur_col_letter = column_letter[cur_col];
                            const element = document.querySelector(`[data-location="${cur_col_letter}${cur_row}"]`);
                            const can_continue_searching = continue_searching(element, bishop_sequences[bishop_south_west_sequence], bypass);
                            if (!can_continue_searching) {
                                break;
                            }
                            cur_row--;
                        }
                        check_for_pin_piece_removal(bishop_sequences[bishop_south_west_sequence], king_location);

                        // Loop through all found sequences, add sequences that contains kings location
                        for (let sequence of bishop_sequences) {
                            if (sequence.includes(king_location) && sequence.includes(piece_location)) {
                                moves.push(sequence);
                            }
                        }

                        break;
                    case "rook":
                        let rook_sequences = [[], [], [], []];
                        let rook_north_sequence = 0;
                        let rook_south_sequence = 1;
                        let rook_east_sequence = 2;
                        let rook_west_sequence = 3;
                        rook_sequences.forEach(sequence => sequence.push(current_piece_location));

                        // Get north sequence
                        for (let cur_row = Number(row) + 1; cur_row <= 8; cur_row++) {
                            const element = document.querySelector(`[data-location="${col}${cur_row}"]`);
                            const can_continue_searching = continue_searching(element, rook_sequences[rook_north_sequence], bypass);
                            if (!can_continue_searching) {
                                break;
                            }
                        }
                        check_for_pin_piece_removal(rook_sequences[rook_north_sequence], king_location);

                        // Get south sequence
                        for (let cur_row = Number(row) - 1; cur_row >= 1; cur_row--) {
                            const element = document.querySelector(`[data-location="${col}${cur_row}"]`);
                            const can_continue_searching = continue_searching(element, rook_sequences[rook_south_sequence], bypass);
                            if (!can_continue_searching) {
                                break;
                            }
                        }
                        check_for_pin_piece_removal(rook_sequences[rook_south_sequence], king_location);
                        // Get east sequence
                        for (let cur_col = current_column_index + 1; cur_col <= 8; cur_col++) {
                            const cur_col_letter = column_letter[cur_col];
                            const element = document.querySelector(`[data-location="${cur_col_letter}${row}"]`);
                            const can_continue_searching = continue_searching(element, rook_sequences[rook_east_sequence], bypass);
                            if (!can_continue_searching) {
                                break;
                            }
                        }
                        check_for_pin_piece_removal(rook_sequences[rook_east_sequence], king_location);

                        // Get west sequence
                        for (let cur_col = current_column_index - 1; cur_col >= 1; cur_col--) {
                            const cur_col_letter = column_letter[cur_col];
                            const element = document.querySelector(`[data-location="${cur_col_letter}${row}"]`);
                            const can_continue_searching = continue_searching(element, rook_sequences[rook_west_sequence], bypass);
                            if (!can_continue_searching) {
                                break;
                            }
                        }
                        check_for_pin_piece_removal(rook_sequences[rook_west_sequence], king_location);

                        // Loop through all found sequences, add sequences that contains kings location
                        for (let sequence of rook_sequences) {
                            if (sequence.includes(king_location) && sequence.includes(piece_location)) {
                                moves.push(sequence);
                            }
                        }

                        break;
                }
            }
        }
    });

    moves = Array.from(new Set([].concat(...moves)));
    moves = moves.filter(move => move != "");
    return moves;
}

function check_for_pin_piece_removal(sequence, king_location) {
    if (sequence.includes(king_location)) {
        sequence = remove_from_pinned_list(sequence, king_location);
    }
}

function remove_from_pinned_list(sequence, king_location) {
    let king_index;
    // if (second_to_last.classList.contains(`${current_player}_piece`))

    for (let move = 0; move < sequence.length; move++) {
        const move_square = document.querySelector(`[data-location="${sequence[move]}"]`);
        const square_piece = move_square.childNodes[0];
        if (square_piece.getAttribute('id') == "king") {
            king_index = move;
            break;
        }
    }

    for (let move = king_index+1; move < sequence.length; move++) {
        sequence[move] = "";
    }
    return sequence;
}

function check_for_mate() {}

function check_for_stalemate() {}
