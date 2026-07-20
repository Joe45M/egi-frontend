const fs = require('fs');
const path = require('path');

const v1SpawnsPath = '/Users/joe/Documents/PALWORLD/palworld_pal_spawns_v1.0.0.json';
const breedingPath = path.join(__dirname, '../public/assets/pals/breeding_data.json');
const apiPalsPath = '/Users/joe/.gemini/antigravity/brain/c6174913-cd0a-444a-85f2-089b474f38f3/scratch/all_api_pals_complete.json';

const spawnsOutputPath = path.join(__dirname, '../public/assets/pals/spawns.json');
const richSpawnsOutputPath = path.join(__dirname, '../public/assets/pals/palworld_spawns.json');

function fileExists(p) {
  try {
    return fs.statSync(p).isFile();
  } catch (err) {
    return false;
  }
}

if (!fileExists(v1SpawnsPath)) {
  console.error(`Error: Source dataset not found at ${v1SpawnsPath}`);
  process.exit(1);
}

console.log(`Loading v1.0.0 spawns dataset from ${v1SpawnsPath}...`);
const v1Data = JSON.parse(fs.readFileSync(v1SpawnsPath, 'utf8'));

const breeding = JSON.parse(fs.readFileSync(breedingPath, 'utf8'));
let apiPals = breeding.pals;
if (fileExists(apiPalsPath)) {
  apiPals = JSON.parse(fs.readFileSync(apiPalsPath, 'utf8'));
}

// 2. Build name-to-internalID mapping
const nameToId = {};
breeding.pals.forEach(p => {
  nameToId[p.name.toLowerCase()] = p.internal_id;
});

// Name override mappings
nameToId['eikthyrdee'] = 'Deer';
nameToId['dynamolf'] = 'ThunderFluffyBird';
nameToId['gumoss (special)'] = 'PlantSlime';

// 3. Process spawns by internal ID
const spawnersById = {};
let totalWildSpawns = 0;
let totalBossSpawns = 0;

Object.keys(v1Data).forEach(palName => {
  const cleanName = palName.trim().toLowerCase();
  const id = nameToId[cleanName];

  if (!id) {
    console.log(`Warning: Could not match Pal name "${palName}" to an internal ID.`);
    return;
  }

  const palData = v1Data[palName];
  if (!palData.spawns || palData.spawns.length === 0) return;

  if (!spawnersById[id]) {
    spawnersById[id] = [];
  }

  palData.spawns.forEach((s, idx) => {
    const isBoss = s.encounter_type === 'alpha_boss';
    const day = !s.night_only;
    const night = true; // Night spawns active unless day-only
    const minLevel = s.level ? s.level.min : 1;
    const maxLevel = s.level ? s.level.max : 50;

    let newSpawner = null;

    if (isBoss) {
      totalBossSpawns++;
      newSpawner = {
        spawnerId: `v1_boss_${id}_${idx}`,
        x: s.world_xy.x,
        y: s.world_xy.y,
        z: 0,
        radius: 15000,
        minLevel,
        maxLevel,
        isBoss: true,
        day,
        night,
        map: s.area || 'Palpagos Islands',
        region: s.area || 'Palpagos Islands',
        biome: s.area || 'Palpagos Islands'
      };
    } else {
      totalWildSpawns++;
      newSpawner = {
        spawnerId: `v1_wild_${id}_${idx}`,
        x: s.world_xy.x,
        y: s.world_xy.y,
        z: 0,
        radius: 20000,
        minLevel,
        maxLevel,
        day,
        night,
        map: s.area || 'Palpagos Islands',
        biome: s.area || 'Palpagos Islands'
      };
    }
    if (newSpawner) {
      spawnersById[id].push(newSpawner);
    }
  });
});
// Copy Paladius boss location to Necromus if missing
if (spawnersById['SaintCentaur'] && (!spawnersById['BlackCentaur'] || spawnersById['BlackCentaur'].length === 0)) {
  spawnersById['BlackCentaur'] = spawnersById['SaintCentaur'].map(s => ({
    ...s,
    spawnerId: s.spawnerId.replace('SaintCentaur', 'BlackCentaur')
  }));
  totalBossSpawns += spawnersById['BlackCentaur'].length;
}

console.log(`\nImport Stats:`);
console.log(`- Wild Spawns parsed: ${totalWildSpawns}`);
console.log(`- Field Bosses parsed: ${totalBossSpawns}`);

// 4. Output spawns.json (Compact Map format)
const compactSpawns = {};
Object.keys(spawnersById).forEach(id => {
  compactSpawns[id] = spawnersById[id].map(s => {
    const compactObj = {
      spawnerId: s.spawnerId,
      x: s.x,
      y: s.y,
      z: s.z,
      radius: s.radius,
      minLevel: s.minLevel,
      maxLevel: s.maxLevel
    };
    if (s.isBoss) compactObj.isBoss = true;
    return compactObj;
  });
});

fs.writeFileSync(spawnsOutputPath, JSON.stringify(compactSpawns, null, 2), 'utf8');
console.log(`\nSuccessfully wrote compact map spawns database to ${spawnsOutputPath}`);

// 5. Output palworld_spawns.json (Rich format)
const richSpawns = {
  version: "1.0.0",
  generated: new Date().toISOString(),
  pals: {}
};

apiPals.forEach((pal, index) => {
  const id = pal.internal_id;
  const list = spawnersById[id] || [];
  
  const spawnLocations = list.filter(s => !s.isBoss).map(s => {
    // Convert Unreal back to in-game display map coordinates
    const gameX = Math.round((s.y - 158000) / 4.59) / 100;
    const gameY = Math.round((s.x - (-123888)) / 4.59) / 100;
    
    return {
      map: s.map,
      x: gameX,
      y: gameY,
      region: s.region,
      biome: s.biome,
      day: s.day,
      night: s.night,
      min_level: s.minLevel,
      max_level: s.maxLevel,
      spawn_type: "wild"
    };
  });

  const alphaBosses = list.filter(s => s.isBoss).map(s => {
    const gameX = Math.round((s.y - 158000) / 4.59) / 100;
    const gameY = Math.round((s.x - (-123888)) / 4.59) / 100;
    return {
      map: s.map,
      x: gameX,
      y: gameY,
      level: s.minLevel,
      day: s.day,
      night: s.night
    };
  });

  const isBreedingOnly = list.length === 0;

  // Extract paldeck number from v1 dataset if available
  let paldeckNum = index + 1;
  const v1MatchKey = Object.keys(v1Data).find(k => k.trim().toLowerCase() === pal.name.toLowerCase());
  if (v1MatchKey && v1Data[v1MatchKey].paldeck) {
    const rawDeck = String(v1Data[v1MatchKey].paldeck).replace('#', '').trim();
    if (rawDeck) paldeckNum = rawDeck;
  }

  richSpawns.pals[pal.name] = {
    id: pal.id,
    internal_name: pal.internal_id,
    element: pal.element_types || [],
    paldeck: paldeckNum,
    spawn_locations: spawnLocations,
    alpha_bosses: alphaBosses,
    dungeons: [],
    sanctuaries: [],
    breeding_only: isBreedingOnly,
    raid_only: false,
    event_only: false
  };
});

fs.writeFileSync(richSpawnsOutputPath, JSON.stringify(richSpawns, null, 2), 'utf8');
console.log(`Successfully wrote rich spawns database to ${richSpawnsOutputPath}`);
