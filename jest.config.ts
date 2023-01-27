/** @type {import('ts-jest').JestConfigWithTsJest} */
const jestConfig = {
  transform: { '\\.[jt]s?$': 'ts-jest' },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.[jt]s$': '$1',
  }
}

export default jestConfig