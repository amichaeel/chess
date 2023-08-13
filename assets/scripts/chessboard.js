const chessboard = document.querySelector("#chessboard");
const column_letter = ["", "a", "b", "c", "d", "e", "f", "g", "h", ""];

function init_chessboard() {
    for (let row = 8; row > 0; row--) {
        for (let col = 1; col <= 8; col++) {
            const square = document.createElement("div");
            square.classList.add((row + col) % 2 == 0 ? "light-square" : "dark-square");
            square.classList.add("square");
            square.dataset.location = `${column_letter[col]}${row}`;
            chessboard.appendChild(square);
        }
    }
}

function init_pieces() {
    const squares = chessboard.childNodes;

    // initialize black pieces
    const black_pieces = [
        black_rook,
        black_knight,
        black_bishop,
        black_queen,
        black_king,
        black_bishop,
        black_knight,
        black_rook,
        black_pawn,
        black_pawn,
        black_pawn,
        black_pawn,
        black_pawn,
        black_pawn,
        black_pawn,
        black_pawn,
    ];

    for (let i = 0; i < 16; i++) {
        const square = squares[i];
        square.innerHTML = black_pieces[i];
    }

    // initialize white pieces
    const white_pieces = [
        white_pawn,
        white_pawn,
        white_pawn,
        white_pawn,
        white_pawn,
        white_pawn,
        white_pawn,
        white_pawn,
        white_rook,
        white_knight,
        white_bishop,
        white_queen,
        white_king,
        white_bishop,
        white_knight,
        white_rook,
    ];
    for (let i = 0; i < 16; i++) {
        const square = squares[i + 48];
        square.innerHTML = white_pieces[i];
    }
}

function init_event_listeners() {
    const squares = chessboard.childNodes;

    for (let square of squares) {
        square.addEventListener("contextmenu", hightlight_square);

        if (square.hasChildNodes()) {
            const piece = square.childNodes[0];
            piece.dataset.moved = false;
            piece.addEventListener("mousedown", select_piece);
            piece.addEventListener("mouseup", release_piece);
        }
    }
}

function init() {
    init_chessboard();
    init_pieces();
    init_event_listeners();
}

init();
