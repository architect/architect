/**
 * 8 is a magic number;
 *
 * Things we know:
 *
 * - AWS has a Transactions Per Second metric 
 * - UpdateFunctionCode has a hard limit TPS of 15: so we know we have an upperbound max chunk speed of 15 updates per second 
 * - yazl failed w a default len of 10 on Linux; perhaps we should drop to os level `cp` on *nix systems in a child process?
 * - Saw npm installation errors (without reporting an error) with a default len of 12
 *
 * everything seems fine w 8; yes thats spooky and we should investigate further! we tuned PARALLEL_DEPLOYS_PER_SECOND on our CI to 5 for now
 */
module.exports = function _chunk(arr, len=8) {

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
