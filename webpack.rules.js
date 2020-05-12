module.exports = [
  // Add support for native node modules
  {
    test: /\.node$/,
    use: 'node-loader',
  },
  {
    test: /\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@marshallofsound/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'assets',
        production: true,
        filterAssetBase: process.cwd(),
        emitDirnameAll: true,
        emitFilterAssetBaseAll: false,
        existingAssetNames: [
          'node-pty',
          'winpty.dll',
          'conpty',
          'winpty-agent.exe'
        ],
        wrapperCompatibility: false,
        cwd: process.cwd(),
        debugLog: false,
      },
    },
  },
  // Put your webpack loader rules in this array.  This is where you would put
  // your ts-loader configuration for instance:
  /**
   * Typescript Example:
   *
   * {
   *   test: /\.tsx?$/,
   *   exclude: /(node_modules|.webpack)/,
   *   loaders: [{
   *     loader: 'ts-loader',
   *     options: {
   *       transpileOnly: true
   *     }
   *   }]
   * }
   */
];
