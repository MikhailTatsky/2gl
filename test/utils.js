export function slice(typedArray) {
    return Array.prototype.slice.call(typedArray);
}

export function round(value, sign = 5) {
    return Math.round(value * Math.pow(10, sign)) / Math.pow(10, sign);
}
