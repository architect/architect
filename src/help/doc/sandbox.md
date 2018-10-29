# npx sandbox

Run `.arc` locally.

# Examples

- `npx sandbox` run completely local and in-memory
- `npx sandbox {--env | -e}={testing | staging | production}` connect to staging db but run locally
- `ARC_LOCAL=1 npx sandbox --env=staging` connect to staging DB, but run locally
- `npx sandbox --port=1337` use an alternate port for the local server