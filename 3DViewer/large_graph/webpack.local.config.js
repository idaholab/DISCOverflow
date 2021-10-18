// development config
var webpack = require('webpack');
var path = require('path');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// Where to listen for the dev server
var port = process.env.PORT || 8081;

// For more information, see: http://webpack.github.io/docs/configuration.html
module.exports = {

  // Efficiently evaluate modules with source maps
  devtool: "eval",

  // Set entry point to ./src/main and include necessary files for hot load
  entry: [
    "webpack-dev-server/client?http://0.0.0.0:" + port,
    "webpack/hot/only-dev-server",
    "./src/main"
  ],

  // This will not actually create a bundle.js file in ./build. It is used
  // by the dev server for dynamic hot loading.
  output: {
    path: __dirname + "/build/",
    filename: "app.js",
    publicPath: "/"
  },

  // Transform source code using Babel and React Hot Loader
  module: {
    rules: [{
      test: /\.jsx?$/,
      include: path.join(__dirname, "src"),
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-react', { targets: "defaults" }]
          ]
        }
      }
    }, {
      test: /\.less$/,
      use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"]
    }, {
      test: /\.(woff|woff2|eot|ttf|svg)$/,
      use: 'url-loader?limit=1&name=[name].[ext]'
    }]
  },

  // Necessary plugins for hot load
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // extract inline css into separate 'styles.css'
    new MiniCssExtractPlugin()
  ],

  // Automatically transform files with these extensions
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};
