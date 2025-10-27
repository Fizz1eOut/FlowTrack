import pluginVue from 'eslint-plugin-vue';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import pluginVitest from '@vitest/eslint-plugin';

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue,js}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/node_modules/**'],
  },

  ...pluginVue.configs['flat/essential'],
  
  ...defineConfigWithVueTs(vueTsConfigs.recommended),

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/**', '**/*.spec.ts', '**/*.test.ts'],
  },

  {
    name: 'app/custom-rules',
    files: ['**/*.{ts,mts,tsx,vue,js}'],
    rules: {
      'vue/max-attributes-per-line': ['warn', {
        singleline: 3,
        multiline: 1
      }],
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multi-word-component-names': 'warn',
      'vue/no-v-html': 'warn',
      'vue/require-default-prop': 'off',
      'vue/html-self-closing': ['error', {
        html: {
          void: 'always',
          normal: 'never',
          component: 'always'
        }
      }],

      'eol-last': ['error', 'always'],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'comma-dangle': ['error', 'only-multiline'],
      
      'indent': ['error', 2, {
        SwitchCase: 1,
        ignoredNodes: [
          'TemplateLiteral',
          'PropertyDefinition[decorators]',
          'TSUnionType',
          'TSIntersectionType',
          'TSTypeParameterInstantiation',
          'FunctionExpression > .params[decorators.length > 0]',
          'FunctionExpression > .params > :matches(Decorator, :not(:first-child))'
        ]
      }],
      'vue/script-indent': ['error', 2, {
        baseIndent: 1,
        switchCase: 1
      }],
      'vue/html-indent': ['error', 2, {
        attribute: 1,
        baseIndent: 1,
        closeBracket: 0,
        alignAttributesVertically: true
      }],

      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-unused-vars': 'off',
      'prefer-const': 'error',
      'no-var': 'error'
    }
  },

  {
    files: ['*.vue', '**/*.vue'],
    rules: {
      'indent': 'off'
    }
  }
];
