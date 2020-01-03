const autoprefixer = require('autoprefixer');
const path = require('path');

module.exports = {
    mode: process.env.dev || 'production',
    entry: {
        app: ['./material-design/app.scss'],
        layout: ['./material-design/layout.js'],
        login: ['./material-design/login.js'],
        register: ['./material-design/register.js'],
        index: ['./material-design/index.js']
    },
    output: {
        path: path.join(__dirname, 'public'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].css',
                        },
                    },
                    {loader: 'extract-loader'},
                    {loader: 'css-loader'},
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [autoprefixer()]
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sassOptions: {
                                includePaths: ['./node_modules'],
                            }
                        },
                    }
                ],
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['@babel/preset-env'],
                },
            }
        ],
    },
};