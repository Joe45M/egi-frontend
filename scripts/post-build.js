const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '../build');
const timestamp = Date.now();

const jsDir = path.join(buildDir, 'static/js');
const cssDir = path.join(buildDir, 'static/css');

const chunkFilesMap = new Map();

function renameChunks() {
  if (!fs.existsSync(jsDir)) return;
  const files = fs.readdirSync(jsDir);
  const chunkFiles = files.filter(f => f.endsWith('.chunk.js') && !f.endsWith('.map'));
  
  chunkFiles.forEach(file => {
    const oldPath = path.join(jsDir, file);
    const newName = file.replace('.chunk.js', `.${timestamp}.chunk.js`);
    const newPath = path.join(jsDir, newName);
    
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed chunk: ${file} -> ${newName}`);
    chunkFilesMap.set(`/static/js/${file}`, `/static/js/${newName}`);
    
    const mapFile = file + '.map';
    if (files.includes(mapFile)) {
      const oldMapPath = path.join(jsDir, mapFile);
      const newMapName = newName + '.map';
      const newMapPath = path.join(jsDir, newMapName);
      fs.renameSync(oldMapPath, newMapPath);
      console.log(`Renamed chunk map: ${mapFile} -> ${newMapName}`);
      chunkFilesMap.set(`/static/js/${mapFile}`, `/static/js/${newMapName}`);
    }
  });
}

renameChunks();

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
  console.log(`Renamed main file: ${mainFile} -> ${newName}`);

  if (ext === 'js') {
    const bundleDate = new Date(timestamp).toUTCString();
    const logStatement = `console.log("Bundle Date: ${bundleDate}");\n`;
    let jsContent = fs.readFileSync(newPath, 'utf8');
    
    jsContent = jsContent.replace('".chunk.js"', `".${timestamp}.chunk.js"`);
    
    fs.writeFileSync(newPath, logStatement + jsContent, 'utf8');
    console.log(`Injected bundle date log & updated chunk loading in ${newName}`);
  }

  const mapFile = mainFile + '.map';
  if (files.includes(mapFile)) {
    const oldMapPath = path.join(dir, mapFile);
    const newMapName = newName + '.map';
    const newMapPath = path.join(dir, newMapName);
    fs.renameSync(oldMapPath, newMapPath);
    console.log(`Renamed main map: ${mapFile} -> ${newMapName}`);
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
    const updatedFiles = {};
    Object.keys(manifest.files).forEach(key => {
      let newKey = key;
      let newVal = manifest.files[key];

      if (newVal === jsResult.oldName) newVal = jsResult.newName;
      else if (newVal === cssResult.oldName) newVal = cssResult.newName;
      else if (newVal === jsResult.oldName + '.map') newVal = jsResult.newName + '.map';
      else if (newVal === cssResult.oldName + '.map') newVal = cssResult.newName + '.map';
      
      if (chunkFilesMap.has(newVal)) {
        newVal = chunkFilesMap.get(newVal);
      }

      if (key.includes('main.js')) newKey = key.replace(path.basename(jsResult.oldName), path.basename(jsResult.newName));
      else if (key.includes('main.css')) newKey = key.replace(path.basename(cssResult.oldName), path.basename(cssResult.newName));
      else if (key.includes('.chunk.js')) {
        newKey = key.replace('.chunk.js', `.${timestamp}.chunk.js`);
      }

      updatedFiles[newKey] = newVal;
    });
    manifest.files = updatedFiles;
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
