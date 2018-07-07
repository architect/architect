module.exports = function _chunk(arr, len=10) {

  let chunks = []
  let index = 0
  let max = arr.length

  while (index < max) {
    chunks.push(arr.slice(index, index += len))
  }

  return chunks
}
