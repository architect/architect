/**
 *
 * Things we know:
 *
 * - AWS has a Transactions Per Second metric, but it is variable based on load to their control backplane
 * - We currently do not support respecting try again timeout
 * - Bursting ~25% above that seems to be fine in most cases; seen upwards of 20 UpdateFunctionCode tps work fine, but this may vary account to account, and based on current AWS load
 *
 */
module.exports = function _chunk(arr, len=10) {

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
