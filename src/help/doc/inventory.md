# npx inventory 

See all AWS infra defined by `.arc`.

# Examples

- `npx inventory`
- `npx inventory [verify | --verify | -v]` verifies current AWS inventory against your project manifest
- `npx inventory [nuke | --nuke | -n]` destroys all infrastructure except DynamoDB tables
- `npx inventory --nuke=tables` destroys all (and only) DynamoDB tables
