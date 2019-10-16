import { join, resolve } from 'path';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { Configuration } from 'webpack';
import webpackNodeExternals from 'webpack-node-externals';

const configuration: Configuration = {
  target: 'node',
  mode: 'production',
  entry: resolve(__dirname, 'src/index.ts'),
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  externals: [webpackNodeExternals()],
  optimization: {
    sideEffects: true
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true
        },
        exclude: /node_modules/,
        include: [join(__dirname, 'src')]
      }
    ]
  },
  plugins: [new CleanWebpackPlugin()],
  devtool: 'source-map'
};

export default configuration;
