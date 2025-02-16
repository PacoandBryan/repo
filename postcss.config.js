export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-preset-env': {
      features: {
        'nesting-rules': true,
      },
    },
    'postcss-custom-properties': {},
    'postcss-will-change': {},
    'postcss-easings': {},
  },
};
