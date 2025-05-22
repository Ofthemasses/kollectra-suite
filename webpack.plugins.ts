import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import type ICopyWebpackPlugin from 'copy-webpack-plugin';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin: typeof ICopyWebpackPlugin = require('copy-webpack-plugin');

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
  new  CopyWebpackPlugin({
      patterns: [
      { from: 'node_modules/netlistsvg/lib/default.svg', to: 'resources/netlistsvg/default.svg' },
      { from: 'dist/Dockerfile', to: 'resources/container/' },
      { from: 'dist/setup.sh', to: 'resources/container/' }
      ]
  })
];
