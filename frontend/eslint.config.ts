import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'playwright-report'] },
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Сторонние пакеты
            ['^react', '^@?\\w'],
            // FSD-слои сверху вниз
            ['^@/app(/|$)'],
            ['^@/pages(/|$)'],
            ['^@/widgets(/|$)'],
            ['^@/features(/|$)'],
            ['^@/entities(/|$)'],
            ['^@/shared(/|$)'],
            // Относительные импорты
            ['^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
)
