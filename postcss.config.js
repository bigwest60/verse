import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

export default {
  plugins: [
    autoprefixer({
      grid: true,
      flexbox: true
    }),
    cssnano({
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
        normalizeWhitespace: true,
        minifyFontValues: true,
        minifyGradients: true,
        calc: true,
        colormin: true
      }]
    })
  ]
}; 