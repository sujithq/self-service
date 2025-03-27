import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

const config = {
  input: 'action/index.ts',
  output: {
    esModule: true,
    file: 'dist/index.js',
    format: 'es'
  },
  plugins: [
    typescript(),
    nodeResolve({ preferBuiltins: true }),
    json(),
    commonjs()
  ]
}

export default config
