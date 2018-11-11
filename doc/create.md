# npx create

Generate infrastructure from `.arc` file and _only_ creates, _never_ destroys or deletes. Creating also first checks if the target infrastructure already exists remotely. This results in this command being safe to run over and over again. It is meant to be run repeatedly as you iterate building your app.

## Example Usage

- `npx create` generate local code and corosponding deployment infra on AWS
- `npx create [local | --local | --l]` generate code locally, and do not generate AWS infra
- `ARC_DISABLE_SESSION=yas npx create` generate HTTP routes without session support
