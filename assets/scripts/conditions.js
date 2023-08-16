// This file will handle pawn promotion, castling, en passant, check, checkmate, stalemate, and draws.
var pawn_dest_element;

function determine_conditions() {

}

function pawn_promotion(dest_element, dest_location) {
    pawn_dest_element = dest_element;
    // Validate the destination
    if (current_player == "white" && dest_location[1] == '8') {
        promotion_menu()
    } else if (current_player == "black" && dest_location[1] == "1") {
        promotion_menu()
    }
}

function promotion_menu() {
    const promotion_menu_element = document.createElement("div");
    const shadow = document.querySelector('shadow');
    shadow.style.visibility = "visible"
    promotion_menu_element.classList.add("promotion-menu")
    pawn_dest_element.append(promotion_menu_element);

    const white_promotion_pieces = [white_queen, white_knight, white_rook, white_bishop];
    const black_promotion_pieces = [black_queen, black_knight, black_rook, black_bishop];
    
    switch(current_player) {
        case "white":
            for (const piece of white_promotion_pieces) {
                const square = document.createElement("div");
                square.addEventListener("click", promotion_selection)
                square.classList.add("menu-item");
                square.innerHTML = piece;
                promotion_menu_element.append(square);
            }
            pause_game()
            break;
        case "black":
            for (const piece of black_promotion_pieces) {
                const square = document.createElement("div");
                square.addEventListener("click", promotion_selection)
                square.classList.add("menu-item");
                square.innerHTML = piece;
                promotion_menu_element.append(square);
            }
            pause_game()
            break;
    }

}

function promotion_selection(e) {
    const piece_element = e.target;
    const shadow = document.querySelector('shadow');
    if (pawn_dest_element.hasChildNodes()) {
        pawn_dest_element.innerHTML = "";
        pawn_dest_element.append(piece_element);
    } else {
        pawn_dest_element.append(piece_element)
    }
    shadow.style.visibility = "hidden";
    promote.play();
    resume_game();
}