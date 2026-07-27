module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  setupFiles: [
    './node_modules/react-native-gesture-handler/jestSetup.js',
    './jestSetup.js',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|@react-navigation|react-redux|@reduxjs|immer)/)',
  ],
};
