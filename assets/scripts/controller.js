var current_player = "white";
var moves = [];
var piece_element;
var square_element;
var piece_name;
var piece_location;
var piece_color;
var move_init;
var move_dest;
var conditions;

function change_player() {
    current_player = current_player == "white" ? "black" : "white";
}

function initialize_controller(e) {
    piece_element = e.target;
    piece_color = piece_element.classList.contains(`${current_player}_piece`) ? current_player : null;
    piece_name = piece_element.getAttribute("id");
    square_element = piece_element.parentElement;
    piece_location = square_element.getAttribute("data-location");
    move_init = square_element;
    square_element.classList.add("selected");
    

    // The following will be implemented in another function.
    moves = begin_search(piece_color, piece_name, piece_element, piece_location);

    // Add click event listener and highlighting to available moves
    for (let move of moves) {
        const square_element = document.querySelector(`[data-location="${move}"]`);
        square_element.removeEventListener("click", select);
        square_element.addEventListener("click", release);

        if (square_element.hasChildNodes()) {
            square_element.classList.add("available-with-piece");
        } else {
            square_element.classList.add("available");
        }
    }
}

function select(e) {
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

function drag(e) {}

function release(e) {
    // Get the location of destination square
    const dest_element = e.target.parentElement.getAttribute("data-location") != null ? e.target.parentElement : e.target;
    const dest_location = dest_element.getAttribute("data-location");
    move_dest = dest_element;

    if (dest_element.hasChildNodes()) {
        // If destination has a piece, delete piece from destination and add selected piece
        dest_element.innerHTML = "";
        dest_element.append(piece_element);
        capture.play();
    } else {
        // If destionation is empty, simply add piece.
        dest_element.append(piece_element);
        move.play();
    }

    if (piece_name == "pawn") {
        // If a pawn was selected and moved, set data-moved to true.
        piece_element.setAttribute("data-moved", true);

        // Here, we can also check if the pawn is capable of promotion.
        pawn_promotion(dest_element, dest_location)

    }

    // Remove all event listeners from the previous possible moves
    for (let move of moves) {
        const square_element = document.querySelector(`[data-location="${move}"]`);
        square_element.removeEventListener("click", release);
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
        const square = document.querySelector(`[data-location="${move}"]`);
        square.removeEventListener("click", release);
        square.addEventListener("click", select);
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
