module.exports = {
  transform: {
    '.ts': require.resolve('ts-jest/dist'),
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.spec.json',
    },
  },
}
