exports.handler = function options(event, context, callback) {
  console.log(JSON.stringify(event, null, 2))
  callback(null, {
    "options": [{
      "text": "Unexpected sentience",
      "value": "AI-2323"
    },
    {
      "text": "Bot biased toward other bots",
      "value": "SUPPORT-42"
    },
    {
      "text": "Bot broke my toaster",
      "value": "IOT-75"
    }]
  })
}

