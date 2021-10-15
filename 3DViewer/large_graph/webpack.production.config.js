/**
 * This is the Webpack configuration file for production.
 */
 const MiniCssExtractPlugin = require("mini-css-extract-plugin");
var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: "./src/main",

  output: {
    path: __dirname + "/build/",
    filename: "app.js"
  },

  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', { targets: "defaults" }]
          ]
        }
      }
    }, {
      test: /\.less$/,
      loader: MiniCssExtractPlugin.extract('css-loader!less-loader')
    }, {
      test: /\.(woff|woff2|eot|ttf|svg)$/,
      loader: 'url-loader?limit=1&name=[name].[ext]'
    }]
  },

  plugins: [
    new MiniCssExtractPlugin(),
    new webpack.optimize.DedupePlugin()
  ],
  resolveLoader: {
    root:
      path.join(__dirname, "node_modules")
  },

  resolve: {
    extensions: ['', '.js', '.jsx']
  },

  devServer: {
    info: true
  }
};
