const fs = require('fs');
const path = require('path');

const game8Path = path.join(__dirname, '../public/assets/pals/game8_spawns_pretty.json');
const breedingPath = path.join(__dirname, '../public/assets/pals/breeding_data.json');
const spawnsPath = path.join(__dirname, '../public/assets/pals/spawns.json');

// 1. Load datasets
const game8 = JSON.parse(fs.readFileSync(game8Path, 'utf8'));
const breeding = JSON.parse(fs.readFileSync(breedingPath, 'utf8'));
const spawns = JSON.parse(fs.readFileSync(spawnsPath, 'utf8'));

// 2. Build name-to-id mapping
const nameToId = {};
breeding.pals.forEach(p => {
  nameToId[p.name.toLowerCase()] = p.internal_id;
});

// Manual correction override mapping
nameToId['eikthyrdee'] = 'Deer';

// 3. Process Game8 coordinate pins
const coords = game8.coordinateArraySchema.coordinates;
const game8WildSpawns = coords.filter(c => c.classification === 'Pal Spawn' && c.area === 'Palpagos');

console.log(`Processing ${game8WildSpawns.length} Game8 wild spawns in Palpagos area...`);

// Group Game8 coordinates by internal_id
const game8SpawnsById = {};
let unmatchedCount = 0;
const unmatchedNames = new Set();

game8WildSpawns.forEach(pin => {
  const cleanName = pin.title.split('(')[0].trim();
  if (cleanName === '☆ Select ☆') return;

  const id = nameToId[cleanName.toLowerCase()];
  if (!id) {
    unmatchedCount++;
    unmatchedNames.add(cleanName);
    return;
  }

  // Parse coordinate "y,x" from Game8
  const [gy, gx] = pin.coordinate.split(',').map(Number);
  if (isNaN(gy) || isNaN(gx)) {
    console.error(`Invalid coordinates for pin ${pin.id}: ${pin.coordinate}`);
    return;
  }

  // Convert to in-game coordinates
  const gameX = gx * 7.8125 - 1000;
  const gameY = gy * 7.8125 - 1000;

  // Convert in-game coordinates to Unreal Engine coordinate space
  const ptY = gameX * 459 + 158000;
  const ptX = gameY * 459 - 123888;

  const newSpawner = {
    spawnerId: `game8_scraped_${pin.id}`,
    x: ptX,
    y: ptY,
    z: 0,
    radius: 20000,
    minLevel: 1,
    maxLevel: 50
  };

  if (!game8SpawnsById[id]) {
    game8SpawnsById[id] = [];
  }
  game8SpawnsById[id].push(newSpawner);
});

if (unmatchedCount > 0) {
  console.log(`Warning: Found ${unmatchedCount} pins with unmatched Pal names:`, Array.from(unmatchedNames));
}

// 4. Merge with existing spawns database
const updatedSpawns = {};

// Keep track of which Pals are updated
const allIds = new Set([...Object.keys(spawns), ...Object.keys(game8SpawnsById)]);

let bossPreservedCount = 0;
let wildReplacedCount = 0;
let newPalsAddedCount = 0;
let noWildSpawnsCount = 0;

allIds.forEach(id => {
  const existingSpawns = spawns[id] || [];
  const bossSpawns = existingSpawns.filter(s => s.isBoss);
  bossPreservedCount += bossSpawns.length;

  const newWildSpawns = game8SpawnsById[id] || [];

  if (newWildSpawns.length > 0) {
    updatedSpawns[id] = [...bossSpawns, ...newWildSpawns];
    wildReplacedCount += newWildSpawns.length;
    if (!spawns[id]) {
      newPalsAddedCount++;
    }
  } else {
    // No new wild spawns from Game8.
    // If the Pal already had boss spawns, we keep them!
    if (bossSpawns.length > 0) {
      updatedSpawns[id] = bossSpawns;
    } else {
      // If it had no boss spawns and no Game8 wild spawns, we omit the key or leave it empty?
      // Let's see: some Pals in spawns.json had wild spawns but they are not wild spawns anymore.
      // Let's log these Pals.
      noWildSpawnsCount++;
    }
  }
});

console.log(`\nMerge Summary:`);
console.log(`- Boss spawners preserved: ${bossPreservedCount}`);
console.log(`- New wild spawn locations integrated: ${wildReplacedCount}`);
console.log(`- New Pals added to database: ${newPalsAddedCount}`);
console.log(`- Pals with no wild spawns now: ${noWildSpawnsCount}`);

// 5. Write updated spawns back to spawns.json
fs.writeFileSync(spawnsPath, JSON.stringify(updatedSpawns, null, 2), 'utf8');
console.log(`\nSuccessfully wrote merged database to ${spawnsPath}`);
