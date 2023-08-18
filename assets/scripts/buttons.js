const settings = document.querySelector("#settings-btn");
const refresh = document.querySelector("#refresh-btn");
const flip_black_btn = document.querySelector("#flip-black");
flip_black_btn.addEventListener("click", flip_black)
settings.addEventListener("click", settings_handler);
refresh.addEventListener("click", refresh_handler);

function settings_handler(e) {
    var settingsMenu = document.getElementById("settings-menu");
    if (settingsMenu.classList.contains("hidden")) {
        settingsMenu.classList.remove("hidden");
    } else {
        settingsMenu.classList.add("hidden");
    }
}

function flip_black(e) {
    if (flip_black_btn.classList.contains("active")) {
        flip_black_btn.classList.remove("active");
        squares.forEach(square => {
            if (square.hasChildNodes()) {
                const piece = square.firstChild;
                const piece_id = piece.getAttribute("id")
                if (piece.classList.contains("black_piece")) {
                    switch(piece_id) {
                        case "pawn":
                            piece.classList.add("black_pawn");
                            piece.classList.remove("rblack_pawn");
                            break;
                        case "rook":
                            piece.classList.add("black_rook");
                            piece.classList.remove("rblack_rook");
                            break;
                        case "knight":
                            piece.classList.add("black_knight");
                            piece.classList.remove("rblack_knight");
                            break;
                        case "bishop":
                            piece.classList.add("black_bishop");
                            piece.classList.remove("rblack_bishop");
                            break;
                        case "queen":
                            piece.classList.add("black_queen");
                            piece.classList.remove("rblack_queen");
                            break;
                        case "king":
                            piece.classList.add("black_king");
                            piece.classList.remove("rblack_king");
                            break;
                    }
                }
            }
        })
    } else {
        flip_black_btn.classList.add("active");
        squares.forEach(square => {
            if (square.hasChildNodes()) {
                const piece = square.firstChild;
                const piece_id = piece.getAttribute("id")
                if (piece.classList.contains("black_piece")) {
                    switch(piece_id) {
                        case "pawn":
                            piece.classList.remove("black_pawn");
                            piece.classList.add("rblack_pawn");
                            break;
                        case "rook":
                            piece.classList.remove("black_rook");
                            piece.classList.add("rblack_rook");
                            break;
                        case "knight":
                            piece.classList.remove("black_knight");
                            piece.classList.add("rblack_knight");
                            break;
                        case "bishop":
                            piece.classList.remove("black_bishop");
                            piece.classList.add("rblack_bishop");
                            break;
                        case "queen":
                            piece.classList.remove("black_queen");
                            piece.classList.add("rblack_queen");
                            break;
                        case "king":
                            piece.classList.remove("black_king");
                            piece.classList.add("rblack_king");
                            break;
                    }
                }
            }
        })
    }
}

function refresh_handler(e) {}
