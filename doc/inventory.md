# npx inventory 

See all infrastructure defined by `.arc`.

## Example Usage

- `npx inventory`
- `npx inventory [verify | --verify | -v]` verifies current remote infrastructure inventory against your project manifest as defined by the `.arc` file
- `npx inventory [nuke | --nuke | -n]` destroys all infrastructure except DynamoDB tables
- `npx inventory --nuke=tables` destroys all (and only) DynamoDB tables
