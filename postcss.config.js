/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-custom-media')({
      importFrom: ['./src/styles/media.json']
    }),
    require('postcss-mixins'),
    require('autoprefixer'),
    require('postcss-simple-vars'),
    require('postcss-nested'),
    require('postcss-preset-env')({
      features: { 'nesting-rules': false }
    })
  ]
};
