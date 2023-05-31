const gameboard = document.querySelector("#gameboard")
const white_timer = document.querySelector("#white-timer")
const black_timer = document.querySelector("#black-timer")

const capture_audio = new Audio('../../misc/sounds/capture.mp3')
const move_self = new Audio('../../misc/sounds/move-self.mp3')
const move_check = new Audio('../../misc/sounds/move-check.mp3')
const castle = new Audio('../../misc/sounds/castle.mp3')
const promote = new Audio('../../misc/sounds/promote.mp3')
const player_piece_color = "white"
let all_squares

const start_pieces_white = [
    black_rook, black_knight, black_bishop, black_queen, black_king, black_bishop, black_knight, black_rook,
    black_pawn, black_pawn, black_pawn, black_pawn, black_pawn, black_pawn, black_pawn, black_pawn,
    '', '', '', '', '', '', '', '', 
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    white_pawn, white_pawn, white_pawn, white_pawn, white_pawn, white_pawn, white_pawn, white_pawn,
    white_rook, white_knight, white_bishop, white_queen, white_king, white_bishop, white_knight, white_rook
]

const start_pieces_black = [
    white_pawn, white_pawn, white_pawn, white_pawn, white_pawn, white_pawn, white_pawn, white_pawn,
    white_rook, white_knight, white_bishop, white_queen, white_king, white_bishop, white_knight, white_rook,
    '', '', '', '', '', '', '', '', 
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    black_pawn, black_pawn, black_pawn, black_pawn, black_pawn, black_pawn, black_pawn, black_pawn,
    black_rook, black_knight, black_bishop, black_queen, black_king, black_bishop, black_knight, black_rook
]

const start_pieces = player_piece_color == "white" ? start_pieces_white : start_pieces_black

const turn_gameboard_on = () => {
    all_squares = document.querySelectorAll("#gameboard .square")

    all_squares.forEach(square => {
        square.addEventListener('dragstart', drag_start)
        square.addEventListener('dragover', drag_over)
        square.addEventListener('drop', drag_drop)
    })
}

const create_board = () => {
    start_pieces.forEach((start_piece, i) => {
        const square = document.createElement("div")
        square.innerHTML = start_piece
        square.setAttribute('square-id', i)
        const row = Math.floor((63-i)/8) + 1
        row % 2 == 0 ? square.classList.add(i % 2 == 0 ? "brown" : "light-brown") : square.classList.add(i % 2 == 0 ? "light-brown" : "brown")
        square.classList.add('square')
        gameboard.append(square)
    })
}

create_board()

let start_position_id
let dragged_element
let successful_start
let current_player = "white"
let valid_squares
let eatable_pieces

const drag_start = (e) => {
    const piece_color = e.target.getAttribute("class")
    if (!piece_color.includes(current_player)) {
        successful_start = false
        return
    }
    
    successful_start = true
    start_position_id = e.target.parentNode.getAttribute("square-id")
    dragged_element = e.target
    valid_squares = search_valid_moves(dragged_element)
    eatable_pieces = scan_for_eatable_pieces(dragged_element)
}

const drag_over = (e) => {
    e.preventDefault()

}
 
const drag_drop = (e) => {
    if (!successful_start) {
        return
    }
    e.stopPropagation()
    const taken = e.target.classList.contains("piece")
    const square_id = Number(e.currentTarget.getAttribute("square-id"))

    if (taken) {
        const piece_color = e.target.getAttribute("class")
        if (piece_color.includes(current_player)) {
            return
        }

        if (eatable_pieces.includes(square_id)) {
            e.target.remove()
            e.currentTarget.append(dragged_element)
            capture_audio.play()
            change_player()
        }

    } else {
        if (valid_squares.includes(square_id)) {
            e.target.append(dragged_element)

            // check if pawn has previously moved
            if (e.target.childNodes[0].getAttribute("id") == "pawn" && e.target.childNodes[0].getAttribute("data-moved") == "false") {
                e.target.childNodes[0].setAttribute("data-moved", "true")
            }

            move_self.play()
            change_player()
        }
    }
}

turn_gameboard_on()

const change_player = () => {
    eatable_pieces = []
    if (current_player == "white") {
        reverseIds()
        current_player = "black"
    } else {
        revertIds()
        current_player = "white"
    }
}


const reverseIds = () => {
    // revert all id's for each white turn
    all_squares.forEach(square => {
        let id = square.getAttribute("square-id")
        id = 63 - id
        square.setAttribute("square-id", id)
    })
}

const revertIds = () => {
    // reverse all id's for each black turn
    all_squares.forEach((square, i) => {
        let id = square.getAttribute("square-id")
        id = i
        square.setAttribute("square-id", id)
    })
}

const search_valid_moves = (selection) => {
    const piece = selection.getAttribute("id")
    const square_id = Number(selection.parentNode.getAttribute("square-id"))
    let temp_valid_moves
    // take in selected piece and verify what square piece can be placed in
    switch(piece){

        case "pawn":
            let has_moved = selection.getAttribute("data-moved") == "true" ? true : false

            if (!has_moved) {
                temp_valid_moves = [square_id-8, square_id-16]
                if (document.querySelector(`[square-id="${square_id-8}"]`).hasChildNodes()) {
                    const index = temp_valid_moves.indexOf(square_id-8)
                    temp_valid_moves = temp_valid_moves.splice(index, 1)
                }
                if (document.querySelector(`[square-id="${square_id-16}"]`).hasChildNodes()) {
                    const index = temp_valid_moves.indexOf(square_id-16)
                    temp_valid_moves = temp_valid_moves.splice(index, 1)
                }
                return temp_valid_moves
            } else {
                temp_valid_moves = [square_id-8]
                if (document.querySelector(`[square-id="${square_id-8}"]`).hasChildNodes()) {
                    temp_valid_moves = []
                }
                return temp_valid_moves
            }

        
        case "rook":

        case "knight":

        case "bishop":

        case "king":

        case "queen":

    }
}

const scan_for_eatable_pieces = (selection) => {
    let found = []
    const piece = selection.getAttribute("id")
    const square_id = Number(selection.parentNode.getAttribute("square-id"))
    switch(piece) {
        case "pawn":
            if (document.querySelector(`[square-id="${square_id - 7}"]`).hasChildNodes()) {
                found.push(square_id-7)
            }

            if (document.querySelector(`[square-id="${square_id - 9}"]`).hasChildNodes()) {
                found.push(square_id-9)
            }

            break;

        case "rook":

        case "knight":

        case "bishop":

        case "king":

        case "queen":
    }

    return found
    
}


