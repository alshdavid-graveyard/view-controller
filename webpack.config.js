const path = require('path')
const yargs = require('yargs').argv
const fs = require('fs-extra')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const EventHooksPlugin = require('event-hooks-webpack-plugin');
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin

const args = {
  prod: !!yargs.prod,
  clean: !!yargs.clean,
  stats: !!yargs.stats,
  packages: typeof yargs.package === 'string' ? [yargs.package] : yargs.package || []
}

if (args.clean) {
  fs.removeSync(path.join(__dirname, 'build'));
  process.exit(0)
}

if (args.stats) {
  args.prod = true
}

const modes = {
  prod: 'production',
  dev: 'development',
}

let mode = modes.dev
if (args.prod) {
  mode = modes.prod
  process.env.NODE_ENV = modes.prod
}

const rules = {
  js: () => ({
    test: /\.js$/,
    exclude: /node_modules/,
    loader: "babel-loader",
    options: {
      presets: [["@babel/preset-env", {
        modules: false,
        targets: { esmodules: true }
      }]],
    }
  }),
  ts: (configFile) => ({
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: [
      {
        loader: "babel-loader",
        options: {
          presets: [["@babel/preset-env", {
            modules: false,
            targets: { esmodules: true }
          }]],
        }
      },
      {
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, ...configFile),
        },
      },
    ]
  }),
}

const plugins = {
  tsConfigPaths: (configFile) => new TsconfigPathsPlugin({
    configFile: path.resolve(__dirname, ...configFile)
  })
}

const preact = {
  entry: path.join(__dirname, 'cmd', 'preact', 'index.ts'),
  mode,
  output: {
    filename: 'index.js',
    path: path.join(__dirname, 'build', 'preact'),
  },
  module: {
    rules: [
      rules.js(),
      rules.ts(['cmd', 'preact', 'tsconfig.json'])
    ]
  },
  plugins: [
    args.stats && new BundleAnalyzerPlugin({
      analyzerPort: 8889
    }),
    new EventHooksPlugin({
      afterEmit: () => fs.copyFileSync(
        path.join(__dirname, 'cmd', 'preact', 'package.json'),
        path.join(__dirname, 'build', 'preact', 'package.json'),
      )
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [
      plugins.tsConfigPaths(['cmd', 'preact', 'tsconfig.json'])
    ]
  },
  externals: {
    preact: 'preact'
  },
}

const react = {
  entry: path.join(__dirname, 'cmd', 'react', 'index.ts'),
  mode,
  output: {
    filename: 'index.js',
    path: path.join(__dirname, 'build', 'react'),
  },
  module: {
    rules: [
      rules.js(),
      rules.ts(['cmd', 'react', 'tsconfig.json'])
    ]
  },
  plugins: [
    args.stats && new BundleAnalyzerPlugin(),
    new EventHooksPlugin({
      afterEmit: () => fs.copyFileSync(
        path.join(__dirname, 'cmd', 'react', 'package.json'),
        path.join(__dirname, 'build', 'react', 'package.json'),
      )
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [
      plugins.tsConfigPaths(['cmd', 'react', 'tsconfig.json'])
    ]
  },
  externals: {
    react: 'react'
  },
}

const packages = {
  preact,
  react,
}

const tasks = []

if (args.packages.length == 0) {
  tasks.push(...Object.values(packages))
} else {
  for (const package of args.packages) {
    tasks.push(packages[package])
  }
}

module.exports = tasks