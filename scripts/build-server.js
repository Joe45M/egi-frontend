const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

// Ensure build directory exists
const buildDir = path.join(__dirname, '../build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

esbuild
  .build({
    entryPoints: [path.join(__dirname, '../src/entry-server.jsx')],
    bundle: true,
    outfile: path.join(buildDir, 'server.js'),
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    external: ['react', 'react-dom', 'react-dom/server', 'react-router-dom'],
    loader: {
      '.jsx': 'jsx',
      '.js': 'jsx',
      '.png': 'file',
      '.jpg': 'file',
      '.jpeg': 'file',
      '.gif': 'file',
      '.svg': 'file',
      '.webp': 'file',
    },
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    plugins: [
      {
        name: 'image-loader',
        setup(build) {
          // Handle image imports - return a placeholder path for SSR
          // The actual image will be served by Netlify from the static folder
          build.onResolve({ filter: /\.(png|jpg|jpeg|gif|svg|webp)$/ }, (args) => {
            return { path: args.path, namespace: 'image' };
          });
          build.onLoad({ filter: /.*/, namespace: 'image' }, (args) => {
            // Extract the filename and return a path that will work with CRA's build structure
            const filename = path.basename(args.path);
            // Return a path that matches CRA's static media structure
            // The actual hashed filename will be resolved by the client bundle
            const imagePath = `/static/media/${filename}`;
            return {
              contents: `module.exports = "${imagePath}";`,
              loader: 'js',
            };
          });
        },
      },
    ],
  })
  .then(() => {
    console.log('Server bundle built successfully');
  })
  .catch((error) => {
    console.error('Error building server bundle:', error);
    process.exit(1);
  });

