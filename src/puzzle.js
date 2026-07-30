var m_w = 123456789
var m_z = 987654321
var mask = 0xffffffff


function seed(i) {
    m_w = (123456789 + i) & mask
    m_z = (987654321 - i) & mask
}


function random() {
    m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask
    m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask
    var result = ((m_z << 16) + (m_w & 65535)) >>> 0
    result /= 4294967296
    return result
}


function nearWhole(n) {
    return Math.abs(Math.round(n) - n) < 0.001
}


let acceptableNums = [1, 3, 4, 5, 7, 9, 11, 15, 17, 19, 20, 25]
export let difficultyLevels = 4
export let totalNum = 6
export let ops = ["+", "-", "*", "/"]
export let opsFunc = {
    "+": (a, b) => a + b,
    "-": (a, b) => {
        if (a < b) return NaN
        return a - b
    },
    "*": (a, b) => a * b,
    "/": (a, b) => {
        if (!nearWhole(a / b)) return NaN
        return a / b
    },
}
let weighedOps = ["+", "+", "+", "+", "-", "-", "*", "*", "*", "*", "*", "/"]
// difficulty: usedNums
let usedNums = {1: 3, 2: 4, 3: 5, 4: 6}
// difficulty: requiredOps
let requiredOpsDict = {1: ["*"], 2: ["*", "+"], 3: ["*", "*", "+"],
                       4: ["*", "*", "+", "-"]}
// difficulty: minNums
let minNums = {1: 50, 2: 100, 3: 200, 4: 300}
// difficulty: maxNums
let maxNums = {1: 150, 2: 300, 3: 600, 4: 900}


function choose(options) {
    return options[Math.floor(options.length * random())]
}


function chooseN(n, options) {
    let result = []
    for (let i = 0; i < n; i++) {
        result.push(choose(options))
    }
    return result
}


function randPop(arr) {
    return arr.splice(Math.floor(arr.length * random()), 1)[0]
}


function shuffle(arr) {
    let copy = [...arr]
    let result = []
    for (let i = 0; i < arr.length; i++) {
        result.push(randPop(copy))
    }
    return result
}


function getRandomNums(n) {
    return chooseN(n, acceptableNums)
}


export function tryPuzzle(days, difficulty) {
    console.log("New attempt (difficulty: " + difficulty + "):")
    let usedNum = usedNums[difficulty]
    let used = getRandomNums(usedNum)
    let decoys = getRandomNums(totalNum - usedNum)
    let allNums = shuffle([...used, ...decoys])
    let chosenOps = chooseN(usedNum, ops)
    let usedOps = []
    while (used.length > 1) {
        let op = choose(weighedOps)
        usedOps.push(op)
        let operand1 = randPop(used)
        let operand2 = randPop(used)
        let result = opsFunc[op](operand1, operand2)
        console.log(operand1, op, operand2, "=", result)
        if (isNaN(result)) return
        used.push(result)
    }
    let requiredOps = [...requiredOpsDict[difficulty]]
    for (let op of usedOps) {
        let i = requiredOps.indexOf(op)
        if (i == -1) continue
        requiredOps.splice(i, 1)
    }
    if (requiredOps.length) return
    let target = used[0]
    if (target < minNums[difficulty]) return
    if (target > maxNums[difficulty]) return
    return [target, allNums]
}


export function getPuzzle(days, difficulty) {
    seed(days * difficulty)
    for (let i = 0; i < 1000; i++) {
        let puzzle = tryPuzzle(days, difficulty)
        if (puzzle) return puzzle
    }
    console.log(":(")
}
