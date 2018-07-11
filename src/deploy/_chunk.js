module.exports = function _chunk(arr, len=12) {


  if (process.env.NIX_CONTAINER) len = 1

  let chunks = []
  let index = 0
  let max = arr.length

  while (index < max) {
    chunks.push(arr.slice(index, index += len))
  }

  return chunks
}
