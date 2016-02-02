module.exports = {
  context: 'app',
  entry: {
    'virtual-device': './virtual-device/index',
    'manage': './manage/index',
  },
  devtool: 'source-map',
  output: {
    path: 'public',
    filename: '[name]/bundle.js',
    publicPath: '/',
  },
  resolve: {
    alias: {
      'paho$': 'paho-client/src/mqttws31',
    },
  },
  module: {
    loaders: [
      {
        test: /\.tmpl$/,
        loader: 'html-loader?minimize=false&attrs=',
      },
      {
        test: /paho$/,
        loader: 'exports-loader?Paho',
      },
      {
        test: /jquery/,
        loader: 'exports-loader?jQuery!script-loader',
      },
    ],
  },
};
