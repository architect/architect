# Automagical \`public\` directory

Each time you deploy your Architect app (\`npx deploy\`), the contents of this folder will automatically be published to the \`staging\` and \`production\` S3 buckets defined in your \`.arc\` file's \`@static\` pragma.

This makes it a great place to add (compiled) JS and CSS, images, gifs, or any other files you want to publish.

However, if you have not specified S3 buckets with \`@static\` in your project's \`.arc\` file, the public directory will only be used to deliver its contents when previewing your application locally with \`npx sandbox\`.


## Use caution!

The full contents of this folder public will be copied to S3 with each deploy, overwriting any existing S3 files with the same name.