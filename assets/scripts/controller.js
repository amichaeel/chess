var current_player = "white";
var under_check = false;
var is_mouse_down = false;
var need_for_RAF = true;
var moves = [];
var piece_element;
var square_element;
var piece_name;
var piece_location;
var piece_color;
var move_init;
var move_dest;
var under_check;
var king_location;
var king_element;
var current_positionX;
var current_positionY;
var start_positionX;
var start_positionY;
var distance_position;
var last_element;

function change_player() {
    // If player was in check, remove check styling.
    if (under_check) remove_check_styling();

    // Reset any enpassant conditions
    reset_enpassant();
    current_player = current_player == "white" ? "black" : "white";

    // Check if current player is under check.
    under_check = determine_check();
}

function getTranslateX() {
    var translateX = parseInt(getComputedStyle(piece_element, null).getPropertyValue("transform").split(",")[4]);
    return translateX;
}

function getTranslateY() {
    var translateY = parseInt(getComputedStyle(piece_element, null).getPropertyValue("transform").split(",")[5]);
    return translateY;
}

function initialize_controller(e) {
    piece_element = e.target;
    piece_color = piece_element.classList.contains(`${current_player}_piece`) ? current_player : null;
    piece_name = piece_element.getAttribute("id");
    square_element = piece_element.parentElement;
    piece_location = square_element.getAttribute("data-location");
    move_init = square_element;
    square_element.classList.add("selected");
    is_mouse_down = true;

    // Drag logic
    current_positionX = getTranslateX();
    current_positionY = getTranslateY();
    start_positionX = e.clientX;
    start_positionY = e.clientY;
    document.addEventListener("mousemove", start_drag);
    document.addEventListener("mouseup", release);
    piece_element.classList.add("dragging");

    // The following will be implemented in another function.
    moves = begin_search(piece_color, piece_name, piece_element, piece_location);

    if (piece_name == "king") {
        if (under_check == false) determine_castling_rights(current_player, piece_location, piece_element, moves);
    }

    // Add click event listener and highlighting to available moves
    // console.log(moves)
    for (let move of moves) {
        // if (move == null) break;
        const move_element = document.querySelector(`[data-location="${move}"]`);
        move_element.removeEventListener("mousedown", select);
        move_element.addEventListener("mousedown", release);

        if (move_element.hasChildNodes()) {
            move_element.classList.add("available-with-piece");
        } else {
            move_element.classList.add("available");
        }
    }
}

function select(e) {
    e.preventDefault();
    // If user selects same element twice, reset controller.
    if (e.target == piece_element) {
        reset_controller();
        return;
    }

    // We only want to listen to current players pieces.
    piece_color = e.target.classList.contains(`${current_player}_piece`) ? current_player : null;

    if (piece_color != null) {
        // If user selected different piece, reset controller and continue
        if (e.target != piece_element && piece_element != null) {
            reset_controller();
        }

        reset_highligting();
        // Initialize controller
        initialize_controller(e);
    } else {
        // User selected a square that doesnt contain their own piece (empty or opponent piece), or is an invalid move.
        // Reset controller
        reset_controller();
    }
}

function start_drag(e) {
    e.preventDefault();
    distance_positionX = e.clientX - start_positionX + current_positionX; // count it!
    distance_positionY = e.clientY - start_positionY + current_positionY;
    if (need_for_RAF && is_mouse_down) {
        need_for_RAF = false; // no need to call rAF up until next frame
        requestAnimationFrame(update); // request 60fps animation
    }
}

function update() {
    need_for_RAF = true; // rAF now consumes the movement instruction so a new one can come
    piece_element.style.transform = `translate(${distance_positionX}px,${distance_positionY}px)`; // move it!
}

function release(e) {
    document.removeEventListener("mouseup", start_drag);
    document.removeEventListener("mousemove", start_drag);

    const target = document.elementFromPoint(e.clientX, e.clientY)

    // Handle invalid destination
    if (target.getAttribute("id") == "main-wrap" || target.tagName == "body") {
        return;
    }

    // If element was selected again, 
    if (piece_element != null) {
        piece_element.style.transform = "translate(0,0)";
        piece_element.classList.remove("dragging")
    } else {
        return;
    }

    const dest_element =
        document.elementFromPoint(e.clientX, e.clientY).getAttribute("data-location") != null
            ? document.elementFromPoint(e.clientX, e.clientY)
            : document.elementFromPoint(e.clientX, e.clientY).parentElement;
    is_mouse_down = false;

    move_dest = dest_element;
    const dest_location = dest_element.getAttribute("data-location");
    const move_init_location = move_init.getAttribute("data-location");
    const move_dest_location = move_dest.getAttribute("data-location");
    const init_col = move_init_location[0];
    const dest_col = move_dest_location[0];
    const dest_row = Number(move_dest_location[1]);

    if (!moves.includes(dest_location)) {
        return;
    }

    if (piece_name == "pawn") {
        pawn_behavior(move_init_location, move_dest_location, init_col, dest_col, dest_row, dest_element, piece_element);
    } else if (piece_name == "king") {
        if (dest_element.hasChildNodes()) {
            const dest_element_piece = dest_element.firstChild;
            if (dest_element_piece.getAttribute("id") == "rook" && dest_element_piece.classList.contains(`${current_player}_rook`)) {
                const castle_location = determine_castle_location(move_init_location, dest_location);
                castle_behavior(castle_location, piece_element, dest_element_piece);
                castles.play();
            } else {
                dest_element.innerHTML = "";
                dest_element.append(piece_element);
                capture.play();
            }
        } else {
            dest_element.append(piece_element);
            move.play();
        }
    } else {
        // Pieces other than pawn or king
        if (dest_element.hasChildNodes()) {
            dest_element.innerHTML = "";
            dest_element.append(piece_element);
            capture.play();
        } else {
            dest_element.append(piece_element);
            move.play();
        }
    }

    if (piece_name == "king" || piece_name == "rook" || piece_name == "pawn") {
        piece_element.setAttribute("data-moved", true);
    }

    // Remove all event listeners from the previous possible moves
    for (let move of moves) {
        const move_element = document.querySelector(`[data-location="${move}"]`);
        move_element.removeEventListener("mouseup", release);
    }

    for (let square of squares) {
        if (square.classList.contains("last-move")) {
            square.classList.remove("last-move");
        }
    }

    // Highlight the initial square and destination square.
    move_init.classList.add("last-move");
    move_dest.classList.add("last-move");

    // Reset controller and change player
    reset_controller();
    change_player();
}

function pause_game() {
    chessboard.classList.add("pause");
}

function resume_game() {
    chessboard.classList.remove("pause");
}

function reset_controller() {
    for (let square of squares) {
        if (square.classList.contains("available")) {
            square.classList.remove("available");
        } else if (square.classList.contains("available-with-piece")) {
            square.classList.remove("available-with-piece");
        } else if (square.classList.contains("highlight")) {
            square.classList.remove("highlight");
        } else if (square.classList.contains("selected")) {
            square.classList.remove("selected");
        }
    }

    for (let move of moves) {
        if (move == null) break;
        const square = document.querySelector(`[data-location="${move}"]`);
        square.addEventListener("mousedown", select);
    }

    moves = [];
    if (square_element != null) {
        square_element.classList.remove("selected");
    }
    move_init = null;
    move_dest = null;
    piece_element = null;
    square_element = null;
    piece_name = null;
    piece_location = null;
    piece_color = null;
}

function reset_highligting() {
    for (let square of squares) {
        if (square.classList.contains("available")) {
            square.classList.remove("available");
        } else if (square.classList.contains("available-with-piece")) {
            square.classList.remove("available-with-piece");
        } else if (square.classList.contains("highlight")) {
            square.classList.remove("highlight");
        } else if (square.classList.contains("selected")) {
            square.classList.remove("selected");
        }
    }
}

function highlight(e) {
    e.preventDefault();
    const square = e.currentTarget;

    if (square.classList.contains("highlight")) {
        square.classList.remove("highlight");
    } else {
        square.classList.add("highlight");
    }
}
