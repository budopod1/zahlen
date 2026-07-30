let callbacks = {}
let counter = 0;


export function registerCallback(func) {
    let id = counter++
    callbacks[id] = func
    return id
}


export function getCallback(id) {
    return callbacks[id]
}


export function jsonStringify(json) {
    return JSON.stringify(json, (_, value) => Number.isNaN(value) ? -1 : value)
}


export function jsonParse(json) {
    return JSON.parse(json, (_, value) => value == -1 ? NaN : value)
}
