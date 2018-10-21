# Automagical `public` directory

The `public` directory is a great place to add (compiled) JS and CSS, images, gifs, or any other files you want to publicly accessible.

Each time you deploy your Architect project (`npx deploy`), the contents of this folder will automatically be published to S3.

Architect pushes the `public` directory to the `staging` and `production` S3 buckets defined in your `.arc` file's `@static` pragma.

If you have not specified S3 buckets with `@static` in your project's `.arc` file, `public` directory will only be used when previewing your application locally with `npx sandbox`.


## Use caution!

The full contents of this folder public will be copied to S3 with each deploy, overwriting any existing S3 files with the same name.
