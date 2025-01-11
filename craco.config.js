const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          util: require.resolve('util/'),
          fs: false, 
          path: require.resolve('path-browserify'),
          os: require.resolve('os-browserify/browser'),
          assert: require.resolve('assert/'),
          crypto: require.resolve('crypto-browserify'),
          http: require.resolve('stream-http'),
          https: require.resolve('https-browserify'),
          tty: require.resolve('tty-browserify'),
          stream: require.resolve('stream-browserify'),
          zlib: require.resolve('browserify-zlib'),
          constants: require.resolve('constants-browserify'),
          url: require.resolve('url/'),
          child_process: false,
          readline: false,
          net: false,
        },
        alias: {
            'graceful-fs': false,
          }
      },
    },
    plugins: [
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '');
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'), // NODE_ENV만 주입
        // 'process.env.API_URL': JSON.stringify(process.env.API_URL || ''), // 필요한 환경 변수만 주입
        // 'process.env': JSON.stringify({}),
      }),
    ],
  },
};
