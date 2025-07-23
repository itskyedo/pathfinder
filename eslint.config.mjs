import config from '@itskyedo/eslint-config';
import solid from 'eslint-plugin-solid';

export default config(
  {
    library: false,
    typescript: {
      '@typescript-eslint/dot-notation': 'off',
    },
    prettier: true,
    jsdoc: {
      'jsdoc/require-returns': [
        'error',
        {
          checkGetters: false,
        },
      ],
    },
    import: true,
    promise: true,
    stylistic: false,
    sort: true,
  },

  solid.configs['flat/typescript'],

  {
    rules: {
      'dot-notation': 'off',
      'no-console': 'off',
    },
  },
);
