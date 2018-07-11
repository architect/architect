module.exports = function _chunk(arr, len=12) {

  if (process.env.PARALLEL_DEPLOYS_PER_SECOND) 
    len = Number(process.env.PARALLEL_DEPLOYS_PER_SECOND)

  let chunks = []
  let index = 0
  let max = arr.length

  while (index < max) {
    chunks.push(arr.slice(index, index += len))
  }

  return chunks
}
