const js = require('@eslint/js')
const globals = require('globals')
const nodePlugin = require('eslint-plugin-n')
const { defineConfig, globalIgnores } = require('eslint/config')

module.exports = defineConfig([
  globalIgnores(['node_modules', 'prisma/generated']),
  {
    files: ['src/**/*.js', 'test/**/*.js'],
    extends: [
      js.configs.recommended,
      nodePlugin.configs['flat/recommended-script']
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-control-regex': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'n/no-process-exit': 'off',
      'n/no-missing-require': 'off'
    }
  },
  {
    files: ['test/**/*.js'],
    rules: {
      'n/no-unpublished-require': 'off',
      'n/no-unsupported-features/node-builtins': 'off'
    }
  }
])
