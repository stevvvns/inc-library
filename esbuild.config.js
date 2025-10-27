import esbuildServe from 'esbuild-serve';
import { sync as globSync } from 'glob';

esbuildServe({
  entryPoints: globSync('src/*.js'),
  bundle: true,
  format: 'esm',
  keepNames: true,
  platform: 'browser',
  outdir: 'dist',
  loader: {
    '.svg': 'text',
    '.css': 'text'
  },
  define: { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development') },
});
