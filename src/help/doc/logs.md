# npx logs

Read or clear logs for a function.

# Syntax

- `npx logs [production] path/to/lambda`
- `npx logs nuke [production] path/to/lambda`

# Examples

- `npx logs src/http/get-index` print staging logs
- `npx logs production src/http/get-index` print the production logs
- `npx logs nuke src/http/get-index` clear staging logs
- `npx logs nuke production src/http/get-index` clear production logs
