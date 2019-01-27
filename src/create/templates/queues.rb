require 'json'

def handler(event:, context:)
  {event: JSON.generate(event), context: JSON.generate(context.inspect)}
end
