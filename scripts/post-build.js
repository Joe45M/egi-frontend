const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '../build');
const timestamp = Date.now();

const jsDir = path.join(buildDir, 'static/js');
const cssDir = path.join(buildDir, 'static/css');

function renameMainFiles(dir, ext) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  const mainFile = files.find(f => f.startsWith('main.') && f.endsWith(ext) && !f.endsWith('.map'));
  if (!mainFile) return null;

  const oldPath = path.join(dir, mainFile);
  const parts = mainFile.split('.');
  const newName = `${parts[0]}.${parts[1]}.${timestamp}.${ext}`;
  const newPath = path.join(dir, newName);

  fs.renameSync(oldPath, newPath);
  console.log(`Renamed ${mainFile} -> ${newName}`);

  // Prepend bundle date logging to the main JS file
  if (ext === 'js') {
    const bundleDate = new Date(timestamp).toUTCString();
    const logStatement = `console.log("Bundle Date: ${bundleDate}");\n`;
    const jsContent = fs.readFileSync(newPath, 'utf8');
    fs.writeFileSync(newPath, logStatement + jsContent, 'utf8');
    console.log(`Injected bundle date log to ${newName}`);
  }

  const mapFile = mainFile + '.map';
  if (files.includes(mapFile)) {
    const oldMapPath = path.join(dir, mapFile);
    const newMapName = newName + '.map';
    const newMapPath = path.join(dir, newMapName);
    fs.renameSync(oldMapPath, newMapPath);
    console.log(`Renamed ${mapFile} -> ${newMapName}`);
  }

  return { oldName: `/static/${ext}/${mainFile}`, newName: `/static/${ext}/${newName}` };
}

const jsResult = renameMainFiles(jsDir, 'js');
const cssResult = renameMainFiles(cssDir, 'css');

if (!jsResult || !cssResult) {
  console.error('Failed to find main JS or CSS bundle');
  process.exit(1);
}

const htmlPath = path.join(buildDir, 'index.html');
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(jsResult.oldName, jsResult.newName);
  html = html.replace(cssResult.oldName, cssResult.newName);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`Updated assets in build/index.html`);
}

const manifestPath = path.join(buildDir, 'asset-manifest.json');
if (fs.existsSync(manifestPath)) {
  let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  if (manifest.files) {
    if (manifest.files['main.js'] === jsResult.oldName) {
      manifest.files['main.js'] = jsResult.newName;
    }
    if (manifest.files['main.css'] === cssResult.oldName) {
      manifest.files['main.css'] = cssResult.newName;
    }
    const oldJsMap = jsResult.oldName + '.map';
    const newJsMap = jsResult.newName + '.map';
    const oldCssMap = cssResult.oldName + '.map';
    const newCssMap = cssResult.newName + '.map';
    if (manifest.files['main.js.map'] === oldJsMap) {
      manifest.files['main.js.map'] = newJsMap;
    }
    if (manifest.files['main.css.map'] === oldCssMap) {
      manifest.files['main.css.map'] = newCssMap;
    }
  }
  
  if (Array.isArray(manifest.entrypoints)) {
    manifest.entrypoints = manifest.entrypoints.map(entry => {
      if (entry === `static/js/${path.basename(jsResult.oldName)}`) {
        return `static/js/${path.basename(jsResult.newName)}`;
      }
      if (entry === `static/css/${path.basename(cssResult.oldName)}`) {
        return `static/css/${path.basename(cssResult.newName)}`;
      }
      return entry;
    });
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Updated asset-manifest.json`);
}
