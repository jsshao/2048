function deepCopy(board) {
    var newBoard = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            newBoard[i][j] = board[i][j];
        }
    }
    return newBoard;
}

function getBoard() {
    var board = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    for (var i = 1; i < 5; i++) {
        for (var j = 1; j < 5; j++) {
            var tiles = document.getElementsByClassName("tile-position-" + j + "-" + i);
            for (var k = 0; k < tiles.length; k++) {
                var val = parseInt(tiles[k].childNodes[0].innerHTML);
                if (val > board[i-1][j-1]) {
                    board[i-1][j-1] = val;
                }
            }
        }
    }
    return board;
}

function smoothness(board) {
    var smooth = 0;
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (board[i][j] != 0) {
                var value = Math.log2(board[i][j]);
                for (var k = i + 1; k < 4; k++) {
                    if (board[k][j] != 0) {
                        smooth += Math.abs(value - Math.log2(board[k][j]));
                        break;
                    }
                }
                for (var k = j + 1; k < 4; k++) {
                    if (board[i][k] != 0) {
                        smooth += Math.abs(value - Math.log2(board[i][k]));
                        break;
                    }
                }
            }
        }
    }
    return smooth;
}

function monotonicity(board) {
    var totals = [0, 0, 0, 0];

    for (var i = 0; i < 4; i++) {
        var current = 0;
        var next = current + 1;
        while (next < 4) {
            while (next < 4 && board[i][next] == 0) {
                next += 1;
            }
            if (next >= 4) {
                next -= 1;
            }
            var curValue = 0;
            if (board[i][current] != 0)
                curValue = Math.log2(board[i][current]);
            var nextValue = 0;
            if (board[i][next] != 0)
                curValue = Math.log2(board[i][next]);
            if (curValue > nextValue) 
                totals[0] += nextValue - curValue;
            else if (nextValue > curValue)
                totals[1] += curValue - nextValue;
            current = next;
            next++;
        }
    }

    for (var i = 0; i < 4; i++) {
        var current = 0;
        var next = current + 1;
        while (next < 4) {
            while (next < 4 && board[next][i] == 0) {
                next += 1;
            }
            if (next >= 4)
                next -= 1;
            var curValue = 0;
            if (board[current][i] != 0)
                curValue = Math.log2(board[current][i]);
            var nextValue = 0;
            if (board[next][i] != 0)
                curValue = Math.log2(board[next][i]);
            if (curValue > nextValue) 
                totals[2] += nextValue - curValue;
            else if (nextValue > curValue)
                totals[3] += curValue - nextValue;
            current = next;
            next++;
        }
    }

    return Math.max(totals[0], totals[1]) + Math.max(totals[2], totals[3]);
}

function heuristic(board) {
    var smoothWeight = 0.1;
    var monoWeight  = 1.0;
    var emptyWeight  = 2.7;
    var maxWeight    = 1.0;
    var corner = 0;

    var max = 0;
    var empty = 1;
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            max = Math.max(board[i][j], max);
            if (board[i][j] == 0) {
                empty += 1;
            }
        }
    }
    if (board[0][0] == max || board[0][3] == max || board[3][0] == max || board[3][3] == max)
        corner = 1;

    console.log(-(maxWeight*max + Math.log(empty)*emptyWeight - smoothness(board)*smoothWeight + monoWeight*monotonicity(board) + corner*max));
    return -(maxWeight*max + Math.log(empty)*emptyWeight - smoothness(board)*smoothWeight + monoWeight*monotonicity(board) + corner*max);
}

// Rotate the board counter-clockwise by k*pi/2
function rotate(board, k) {
    if (k == 0) {
        return (board);
    }
    var tempBoard = (board);
    for (var iter = 0; iter < k; iter++) {
        var newBoard = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                // (3, 0) -> (0, 0); (1, 0) -> (0, 2); (0, 0) -> (0, 3)
                newBoard[i][j] = tempBoard[j][3-i];
            }
        }
        tempBoard = newBoard;
    }
    return newBoard;
}

function moveLeft(inboard) {
    var newBoard = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
    var board = deepCopy(inboard);
    for (var i = 0; i < 4; i++) {
        var row = board[i];
        // Shift left
        while (row.indexOf(0) != -1) {
            row.splice(row.indexOf(0), 1);
        }
        for (var j = 0; j < row.length; j++) {
            if (row[j] == row[j+1]) {
                row[j] *= 2;
                row[j+1] = 0;
            }
        }
        // Shift left
        while (row.indexOf(0) != -1) {
            row.splice(row.indexOf(0), 1);
        }
        for (var j = 0; j < row.length; j++) {
            newBoard[i][j] = row[j];
        }
    }
    return newBoard;
}

// Returns (score, move)
function miniMax(board, player, depth) {
    if (depth == 0) {
        return [heuristic(board), 0];
    } else if (player == "MAX") {
        console.log("MAX");
        var bestHeuristic = 10000000;
        var bestDir = -1;
        for (var rot = 0; rot < 4; rot++) {
            var newBoard = (moveLeft(rotate(board, rot))); 
            var val = miniMax(newBoard, "MIN", depth-1)[0];
            if (val < bestHeuristic && JSON.stringify(rotate(board, rot)) != JSON.stringify(moveLeft(rotate(board, rot)))) {
                bestHeuristic = val;
                bestDir = rot;
            }
        }
        return [bestHeuristic, bestDir];
    } else if (player == "MIN") {
        console.log("MIN");
        var totalHeuristic = 0;
        var numMoves = 0;
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                for (var k = 1; k < 3; k++) {
                    var randomValue = k*2;
                    if (board[i][j] == 0) {
                        var newBoard = (board);
                        newBoard[i][j] = randomValue;
                        var val = miniMax(newBoard, "MAX", depth-1)[0];
                        totalHeuristic += val * (0.9 ? k == 1 : 0.1);
                        numMoves += (0.9 ? k == 1 : 0.1);
                    }
                }
            }
        }
        return [totalHeuristic / numMoves, 0];
    }
}

function fireKey(key)
{
    //Set key to corresponding code. This one is set to the left arrow key.
    if(document.createEventObject)
    {
        var eventObj = document.createEventObject();
        eventObj.keyCode = key;
        document.body.fireEvent("onkeydown", eventObj);
    }else if(document.createEvent)
    {
        var eventObj = document.createEvent("Events");
        eventObj.initEvent("keydown", true, true);
        eventObj.which = key;
        document.body.dispatchEvent(eventObj);
    }
}

document.getElementById("solve").addEventListener("click", function() {
    var gameOver = document.getElementsByClassName("retry-button")[0];
    var lastMove = null;
    var move = miniMax(getBoard(), "MAX", 2)[1];
    console.log(move);
    var repeat = setInterval(function() {
        /*
        var bestHeuristic = 1000000;
        var bestDir = 0;
        for (var rot = 0; rot < 4; rot++) {
            var val = heuristic2(moveLeft(rotate(getBoard(), rot))); 
            if (val < bestHeuristic && JSON.stringify(rotate(getBoard(), rot)) != JSON.stringify(moveLeft(rotate(getBoard(), rot)))) {
                bestHeuristic = val;
                bestDir = rot;
            }
        }
        lastMove = bestDir;
        fireKey(37 + bestDir);
        */
        var move = miniMax(getBoard(), "MAX", 5)[1];
        fireKey(37 + move);
        if (!(gameOver.offsetParent === null)) {
            clearInterval(repeat);
        }
    }, 100); 
});
