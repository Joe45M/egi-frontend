import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PageMetadata, { SITE_URL } from '../components/PageMetadata';
import StructuredSchema, { 
  generateWebPageSchema, 
  generateBreadcrumbSchema,
  generateSoftwareApplicationSchema,
  generateFAQPageSchema
} from '../components/StructuredSchema';
import { palworldApi } from '../services/palworldApi';
import wordpressApi from '../services/wordpressApi';

// Seeded PRNG Mulberry32
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 90+ Curated Static Tasks for Palworld Bingo
const STATIC_TASKS = [
  // Easy Pal Tasks
  { id: 'p_lamball', name: 'Catch a Lamball', type: 'pal', target: 'Lamball', difficulty: 'easy', icon: '🐑' },
  { id: 'p_cattiva', name: 'Catch a Cattiva', type: 'pal', target: 'Cattiva', difficulty: 'easy', icon: '🐱' },
  { id: 'p_chikipi', name: 'Catch a Chikipi', type: 'pal', target: 'Chikipi', difficulty: 'easy', icon: '🐔' },
  { id: 'p_lifmunk', name: 'Catch a Lifmunk', type: 'pal', target: 'Lifmunk', difficulty: 'easy', icon: '🐿️' },
  { id: 'p_foxparks', name: 'Catch a Foxparks', type: 'pal', target: 'Foxparks', difficulty: 'easy', icon: '🦊' },
  { id: 'p_pengullet', name: 'Catch a Pengullet', type: 'pal', target: 'Pengullet', difficulty: 'easy', icon: '🐧' },
  { id: 'p_fuack', name: 'Catch a Fuack', type: 'pal', target: 'Fuack', difficulty: 'easy', icon: '🦆' },
  { id: 'p_gumoss', name: 'Catch a Gumoss', type: 'pal', target: 'Gumoss', difficulty: 'easy', icon: '🍄' },
  { id: 'p_teafant', name: 'Catch a Teafant', type: 'pal', target: 'Teafant', difficulty: 'easy', icon: '🐘' },
  { id: 'p_depresso', name: 'Catch a Depresso', type: 'pal', target: 'Depresso', difficulty: 'easy', icon: '☕' },
  { id: 'p_cremis', name: 'Catch a Cremis', type: 'pal', target: 'Cremis', difficulty: 'easy', icon: '🐑' },
  { id: 'p_tanzee', name: 'Catch a Tanzee', type: 'pal', target: 'Tanzee', difficulty: 'easy', icon: '🐒' },
  { id: 'p_sparkit', name: 'Catch a Sparkit', type: 'pal', target: 'Sparkit', difficulty: 'easy', icon: '⚡' },
  
  // Easy Crafting & Building
  { id: 'c_pickaxe', name: 'Craft a Stone Pickaxe', type: 'craft', difficulty: 'easy', icon: '⛏️' },
  { id: 'c_axe', name: 'Craft a Stone Axe', type: 'craft', difficulty: 'easy', icon: '🪓' },
  { id: 'c_club', name: 'Craft a Wooden Club', type: 'craft', difficulty: 'easy', icon: '🪵' },
  { id: 'c_bow', name: 'Craft an Old Bow', type: 'craft', difficulty: 'easy', icon: '🏹' },
  { id: 'c_shield', name: 'Craft a Common Shield', type: 'craft', difficulty: 'easy', icon: '🛡️' },
  { id: 'b_workbench', name: 'Build a Primitive Workbench', type: 'build', difficulty: 'easy', icon: '🛠️' },
  { id: 'b_palbox', name: 'Build a Palbox', type: 'build', difficulty: 'easy', icon: '📦' },
  { id: 'b_campfire', name: 'Build a Campfire', type: 'build', difficulty: 'easy', icon: '🔥' },
  { id: 'b_bed', name: 'Build a Straw Pal Bed', type: 'build', difficulty: 'easy', icon: '🛏️' },
  { id: 'b_feedbox', name: 'Build a Feed Box', type: 'build', difficulty: 'easy', icon: '🌾' },

  // Easy Collection, Cooking & Exploration
  { id: 'col_paldium', name: 'Obtain 10 Paldium Fragments', type: 'collect', difficulty: 'easy', icon: '💎' },
  { id: 'col_wool', name: 'Obtain 5 Wool', type: 'collect', difficulty: 'easy', icon: '☁️' },
  { id: 'col_berries', name: 'Obtain 20 Red Berries', type: 'collect', difficulty: 'easy', icon: '🍒' },
  { id: 'cook_berries', name: 'Cook 10 Baked Berries', type: 'cook', difficulty: 'easy', icon: '🥣' },
  { id: 'exp_fasttravel_2', name: 'Unlock 3 Fast Travel Points', type: 'explore', difficulty: 'easy', icon: '✈️' },
  { id: 'm_capture_5', name: 'Capture 5 Unique Pals', type: 'milestone', difficulty: 'easy', icon: '🦁' },
  { id: 'col_effigy_2', name: 'Collect 2 Lifmunk Effigies', type: 'collect', difficulty: 'easy', icon: '🟢' },
  { id: 'def_thug', name: 'Defeat a Syndicate Thug', type: 'defeat', difficulty: 'easy', icon: '👤' },

  // Medium Pal Tasks
  { id: 'p_melpaca', name: 'Catch a Melpaca', type: 'pal', target: 'Melpaca', difficulty: 'medium', icon: '🦙' },
  { id: 'p_rushoar', name: 'Catch a Rushoar', type: 'pal', target: 'Rushoar', difficulty: 'medium', icon: '🐗' },
  { id: 'p_direhowl', name: 'Catch a Direhowl', type: 'pal', target: 'Direhowl', difficulty: 'medium', icon: '🐺' },
  { id: 'p_nitewing', name: 'Catch a Nitewing', type: 'pal', target: 'Nitewing', difficulty: 'medium', icon: '🦅' },
  { id: 'p_celaray', name: 'Catch a Celaray', type: 'pal', target: 'Celaray', difficulty: 'medium', icon: '🐟' },
  { id: 'p_daedream', name: 'Catch a Daedream', type: 'pal', target: 'Daedream', difficulty: 'medium', icon: '🔮' },
  { id: 'p_jolthog', name: 'Catch a Jolthog', type: 'pal', target: 'Jolthog', difficulty: 'medium', icon: '🦔' },
  { id: 'p_rooby', name: 'Catch a Rooby', type: 'pal', target: 'Rooby', difficulty: 'medium', icon: '🐕' },
  { id: 'p_gobfin', name: 'Catch a Gobfin', type: 'pal', target: 'Gobfin', difficulty: 'medium', icon: '🦈' },

  // Medium Bosses
  { id: 'p_chillet', name: 'Defeat Chillet (Alpha Boss)', type: 'boss', target: 'Chillet', difficulty: 'medium', icon: '🐉' },
  { id: 'p_penking', name: 'Defeat Penking (Alpha Boss)', type: 'boss', target: 'Penking', difficulty: 'medium', icon: '👑' },
  { id: 'p_gumoss_boss', name: 'Defeat Gumoss (Alpha Boss)', type: 'boss', target: 'Gumoss', difficulty: 'medium', icon: '🍄' },
  { id: 'p_sweepa_boss', name: 'Defeat Sweepa (Alpha Boss)', type: 'boss', target: 'Sweepa', difficulty: 'medium', icon: '👑' },

  // Medium Crafting & Building
  { id: 'c_grappling', name: 'Craft a Grappling Gun', type: 'craft', difficulty: 'medium', icon: '⚓' },
  { id: 'c_glider', name: 'Craft a Normal Glider', type: 'craft', difficulty: 'medium', icon: '🪂' },
  { id: 'c_megasphere', name: 'Craft a Mega Sphere', type: 'craft', difficulty: 'medium', icon: '🔵' },
  { id: 'c_outfit', name: 'Craft a Cloth Outfit', type: 'craft', difficulty: 'medium', icon: '👕' },
  { id: 'c_triplebow', name: 'Craft a Triple-Shot Bow', type: 'craft', difficulty: 'medium', icon: '🏹' },
  { id: 'b_logging', name: 'Build a Logging Site', type: 'build', difficulty: 'medium', icon: '🌲' },
  { id: 'b_stonepit', name: 'Build a Stone Pit', type: 'build', difficulty: 'medium', icon: '🪨' },
  { id: 'b_crusher', name: 'Build a Crusher', type: 'build', difficulty: 'medium', icon: '⚙️' },
  { id: 'b_ranch', name: 'Build a Ranch', type: 'build', difficulty: 'medium', icon: '🏡' },
  { id: 'b_berryplant', name: 'Build a Berry Plantation', type: 'build', difficulty: 'medium', icon: '🍓' },
  { id: 'b_furnace', name: 'Build a Primitive Furnace', type: 'build', difficulty: 'medium', icon: '🪵' },

  // Medium Collection, Cooking & Exploration
  { id: 'col_fluids', name: 'Obtain 5 Pal Fluids', type: 'collect', difficulty: 'medium', icon: '🧪' },
  { id: 'col_flame', name: 'Obtain 5 Flame Organs', type: 'collect', difficulty: 'medium', icon: '🔥' },
  { id: 'col_ice', name: 'Obtain 5 Ice Organs', type: 'collect', difficulty: 'medium', icon: '❄️' },
  { id: 'col_electric', name: 'Obtain 5 Electric Organs', type: 'collect', difficulty: 'medium', icon: '⚡' },
  { id: 'col_leather', name: 'Obtain 10 Leather', type: 'collect', difficulty: 'medium', icon: '💼' },
  { id: 'col_honey', name: 'Obtain 5 Honey', type: 'collect', difficulty: 'medium', icon: '🍯' },
  { id: 'cook_meat', name: 'Cook 5 Grilled Meat', type: 'cook', difficulty: 'medium', icon: '🍖' },
  { id: 'exp_fasttravel_5', name: 'Unlock 6 Fast Travel Points', type: 'explore', difficulty: 'medium', icon: '✈️' },
  { id: 'm_base_7', name: 'Upgrade Base to Level 7', type: 'milestone', difficulty: 'medium', icon: '🏰' },
  { id: 'col_hugeegg', name: 'Collect any Huge Egg', type: 'collect', difficulty: 'medium', icon: '🥚' },
  { id: 'm_lucky', name: 'Capture a Lucky Pal', type: 'milestone', difficulty: 'medium', icon: '⭐' },

  // Hard Pal Tasks
  { id: 'p_anubis', name: 'Catch an Anubis', type: 'pal', target: 'Anubis', difficulty: 'hard', icon: '⚖️' },
  { id: 'p_mossanda', name: 'Catch a Mossanda', type: 'pal', target: 'Mossanda', difficulty: 'hard', icon: '🐼' },
  { id: 'p_digtoise', name: 'Catch a Digtoise', type: 'pal', target: 'Digtoise', difficulty: 'hard', icon: '🐢' },
  { id: 'p_broncherry', name: 'Catch a Broncherry', type: 'pal', target: 'Broncherry', difficulty: 'hard', icon: '🦕' },
  { id: 'p_reptyro', name: 'Catch a Reptyro', type: 'pal', target: 'Reptyro', difficulty: 'hard', icon: '🌋' },
  { id: 'p_mammorest', name: 'Catch a Mammorest', type: 'pal', target: 'Mammorest', difficulty: 'hard', icon: '🐘' },
  { id: 'p_wumpo', name: 'Catch a Wumpo', type: 'pal', target: 'Wumpo', difficulty: 'hard', icon: '❄️' },
  { id: 'p_fenglope', name: 'Catch a Fenglope', type: 'pal', target: 'Fenglope', difficulty: 'hard', icon: '🦌' },

  // Hard Bosses
  { id: 'boss_zoe', name: 'Defeat Zoe & Grizzbolt (Tower)', type: 'boss', difficulty: 'hard', icon: '⚡' },
  { id: 'p_katress_boss', name: 'Defeat Katress (Alpha Boss)', type: 'boss', target: 'Katress', difficulty: 'hard', icon: '🔮' },
  { id: 'p_bushi_boss', name: 'Defeat Bushi (Alpha Boss)', type: 'boss', target: 'Bushi', difficulty: 'hard', icon: '⚔️' },
  { id: 'p_quivern_boss', name: 'Defeat Quivern (Alpha Boss)', type: 'boss', target: 'Quivern', difficulty: 'hard', icon: '🐉' },

  // Hard Crafting & Building
  { id: 'c_gigasphere', name: 'Craft a Giga Sphere', type: 'craft', difficulty: 'hard', icon: '🟡' },
  { id: 'c_handgun', name: 'Craft a Handgun', type: 'craft', difficulty: 'hard', icon: '🔫' },
  { id: 'c_metalarmor', name: 'Craft a Metal Armor', type: 'craft', difficulty: 'hard', icon: '🦺' },
  { id: 'c_megashield', name: 'Craft a Mega Shield', type: 'craft', difficulty: 'hard', icon: '🛡️' },
  { id: 'b_incubator', name: 'Build an Egg Incubator', type: 'build', difficulty: 'hard', icon: '🥚' },
  { id: 'b_wheatplant', name: 'Build a Wheat Plantation', type: 'build', difficulty: 'hard', icon: '🌾' },
  { id: 'b_hotspring_hq', name: 'Build High Quality Hot Spring', type: 'build', difficulty: 'hard', icon: '♨️' },
  { id: 'b_weaponbench', name: 'Build Weapon Workbench', type: 'build', difficulty: 'hard', icon: '🔨' },
  { id: 'b_generator', name: 'Build a Power Generator', type: 'build', difficulty: 'hard', icon: '⚡' },
  { id: 'b_furnace_imp', name: 'Build an Improved Furnace', type: 'build', difficulty: 'hard', icon: '🧱' },

  // Hard Collection, Cooking & Exploration
  { id: 'col_wheatseeds', name: 'Obtain 5 Wheat Seeds', type: 'collect', difficulty: 'hard', icon: '🌾' },
  { id: 'col_bones', name: 'Obtain 5 Bones', type: 'collect', difficulty: 'hard', icon: '🦴' },
  { id: 'col_flower', name: 'Obtain 2 Beautiful Flowers', type: 'collect', difficulty: 'hard', icon: '🌸' },
  { id: 'cook_cake', name: 'Cook a Cake', type: 'cook', difficulty: 'hard', icon: '🎂' },
  { id: 'exp_fasttravel_10', name: 'Unlock 10 Fast Travel Points', type: 'explore', difficulty: 'hard', icon: '✈️' },
  { id: 'm_base_12', name: 'Upgrade Base to Level 12', type: 'milestone', difficulty: 'hard', icon: '🏰' },
  { id: 'col_effigy_5', name: 'Collect 5 Lifmunk Effigies', type: 'collect', difficulty: 'hard', icon: '🟢' },
  { id: 'm_passives_3', name: 'Catch Pal with 3+ Passive Skills', type: 'milestone', difficulty: 'hard', icon: '⭐' }
];

const WINNING_COMBINATIONS = [
  // Rows
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  // Columns
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  // Diagonals
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20]
];

// Seeding board generator algorithm
function generateBoardItems(seed, difficulty, mode, apiPals) {
  const prng = mulberry32(seed);

  // Seed-based shuffle
  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  let pool = [];

  if (mode === 'pals') {
    // Pals Only mode (using API Pals if available, else static Pals)
    const palsSource = apiPals && apiPals.length > 0 
      ? apiPals 
      : STATIC_TASKS.filter(t => t.type === 'pal' || t.type === 'boss');

    if (apiPals && apiPals.length > 0) {
      pool = palsSource.filter(pal => {
        const rarity = pal.rarity || 1;
        if (difficulty === 'easy') return rarity <= 3;
        if (difficulty === 'medium') return rarity >= 4 && rarity <= 7;
        if (difficulty === 'hard') return rarity >= 8;
        return true;
      }).map(pal => ({
        id: `api_pal_${pal.id}`,
        name: `Catch ${pal.name}`,
        type: 'pal',
        target: pal.name,
        difficulty: pal.rarity <= 3 ? 'easy' : (pal.rarity <= 7 ? 'medium' : 'hard'),
        icon: '🐾',
        image_url: pal.image_url
      }));
    } else {
      pool = palsSource.filter(t => {
        if (difficulty === 'easy') return t.difficulty === 'easy';
        if (difficulty === 'medium') return t.difficulty === 'medium';
        if (difficulty === 'hard') return t.difficulty === 'hard';
        return true;
      });
    }

    if (pool.length < 25) {
      const fallback = apiPals && apiPals.length > 0
        ? apiPals.map(p => ({
            id: `api_pal_${p.id}`,
            name: `Catch ${p.name}`,
            type: 'pal',
            target: p.name,
            difficulty: 'mixed',
            icon: '🐾',
            image_url: p.image_url
          }))
        : STATIC_TASKS.filter(t => t.type === 'pal' || t.type === 'boss');
      pool = [...pool, ...fallback];
    }
  } else if (mode === 'survival') {
    // Survival / Crafting Only
    pool = STATIC_TASKS.filter(t => t.type !== 'pal' && t.type !== 'boss');
    pool = pool.filter(t => {
      if (difficulty === 'easy') return t.difficulty === 'easy';
      if (difficulty === 'medium') return t.difficulty === 'medium';
      if (difficulty === 'hard') return t.difficulty === 'hard';
      return true;
    });

    if (pool.length < 25) {
      pool = STATIC_TASKS.filter(t => t.type !== 'pal' && t.type !== 'boss');
    }
  } else {
    // Balanced Mix
    pool = STATIC_TASKS.filter(t => {
      if (difficulty === 'easy') return t.difficulty === 'easy';
      if (difficulty === 'medium') return t.difficulty === 'medium';
      if (difficulty === 'hard') return t.difficulty === 'hard';
      return true;
    });

    if (pool.length < 25) {
      pool = STATIC_TASKS;
    }
  }

  const shuffled = shuffle(pool);
  
  // Deduplicate by name
  const seen = new Set();
  const uniqueItems = [];
  for (const item of shuffled) {
    if (!seen.has(item.name)) {
      seen.add(item.name);
      uniqueItems.push(item);
    }
    if (uniqueItems.length === 25) break;
  }

  // Backfill if needed
  if (uniqueItems.length < 25) {
    const remaining = shuffled.filter(item => !seen.has(item.name));
    uniqueItems.push(...remaining.slice(0, 25 - uniqueItems.length));
  }

  return uniqueItems.slice(0, 25);
}

function PalworldBingo() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse state from URL search params
  const seedParam = searchParams.get('seed') || searchParams.get('s');
  const diffParam = searchParams.get('diff') || 'mixed';
  const modeParam = searchParams.get('mode') || 'balanced';
  const popoutParam = searchParams.get('popout') === 'true';

  // Seed state
  const seed = useMemo(() => {
    if (!seedParam) return null;
    const parsed = parseInt(seedParam, 10);
    return isNaN(parsed) ? 12345 : parsed;
  }, [seedParam]);

  // Settings state
  const [difficulty, setDifficulty] = useState(diffParam);
  const [mode, setMode] = useState(modeParam);

  // Pals database cache for image resolution
  const [palsData, setPalsData] = useState({});
  const [allPalsList, setAllPalsList] = useState([]);
  const [loadingPals, setLoadingPals] = useState(true);

  // WordPress Articles state
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(true);

  // Chroma key selection state for streamer overlay
  const [chromaKey, setChromaKey] = useState('dark');

  // Generate share link status
  const [copied, setCopied] = useState(false);

  // Fetch Pals list from API on mount
  useEffect(() => {
    let active = true;
    
    // Safety timeout to turn off skeleton grid if API is down
    const safetyTimeout = setTimeout(() => {
      if (active) {
        setLoadingPals(false);
      }
    }, 3000);

    async function loadPals() {
      try {
        const response = await palworldApi.getPals({ limit: 300 });
        if (response && response.data && active) {
          const palMap = {};
          response.data.forEach(pal => {
            palMap[pal.name.toLowerCase()] = pal;
          });
          setPalsData(palMap);
          setAllPalsList(response.data);
        }
      } catch (err) {
        console.error("Failed to load Pal images:", err);
      } finally {
        if (active) {
          setLoadingPals(false);
          clearTimeout(safetyTimeout);
        }
      }
    }
    loadPals();
    return () => {
      active = false;
      clearTimeout(safetyTimeout);
    };
  }, []);

  // Fetch Palworld articles from WordPress Api
  useEffect(() => {
    let active = true;

    // Safety timeout to turn off article skeleton loader if API is down
    const safetyTimeout = setTimeout(() => {
      if (active) {
        setLoadingArticles(false);
      }
    }, 3000);

    async function loadPalworldArticles() {
      try {
        setLoadingArticles(true);
        const gameTerm = await wordpressApi.taxonomies.getBySlug('game', 'palworld');
        if (gameTerm && gameTerm.id && active) {
          const response = await wordpressApi.posts.getByPostType('games', {
            taxonomyFilter: { game: gameTerm.id },
            perPage: 3,
            includeImages: true
          });
          const posts = Array.isArray(response) ? response : (response?.posts || []);
          if (active) setArticles(posts);
        }
      } catch (err) {
        console.error("Failed to load Palworld articles:", err);
        // Fallback: load general gaming posts
        try {
          const response = await wordpressApi.posts.getByPostType('games', {
            perPage: 3,
            includeImages: true
          });
          const posts = Array.isArray(response) ? response : (response?.posts || []);
          if (active) setArticles(posts);
        } catch (err2) {
          console.error("Fallback articles failed:", err2);
        }
      } finally {
        if (active) {
          setLoadingArticles(false);
          clearTimeout(safetyTimeout);
        }
      }
    }
    loadPalworldArticles();
    return () => {
      active = false;
      clearTimeout(safetyTimeout);
    };
  }, []);

  // Sync state changes from selectors into URL
  const updateURLParams = useCallback((newSeed, newDiff, newMode) => {
    setSearchParams({
      seed: String(newSeed),
      diff: newDiff,
      mode: newMode
    }, { replace: true });
  }, [setSearchParams]);

  // Roll a new seed
  const handleGenerateNewCard = useCallback((customSeed = null) => {
    const rolledSeed = customSeed !== null ? customSeed : Math.floor(Math.random() * 900000) + 100000;
    updateURLParams(rolledSeed, difficulty, mode);
  }, [difficulty, mode, updateURLParams]);

  // Initialize seed on load if missing
  useEffect(() => {
    if (!seed) {
      handleGenerateNewCard();
    }
  }, [seed, handleGenerateNewCard]);

  // Generate the 25 cells for the active seed, difficulty and mode
  const boardCells = useMemo(() => {
    if (!seed) return [];
    return generateBoardItems(seed, difficulty, mode, allPalsList);
  }, [seed, difficulty, mode, allPalsList]);

  // Setup completion progress state from local storage or empty
  const progressKey = useMemo(() => {
    return `palworld_bingo_v1_progress_${seed}_${difficulty}_${mode}`;
  }, [seed, difficulty, mode]);

  const [cellStates, setCellStates] = useState(() => Array(25).fill(null));

  // Load progress when board settings change
  useEffect(() => {
    if (!seed) return;
    try {
      const saved = localStorage.getItem(progressKey);
      if (saved) {
        setCellStates(JSON.parse(saved));
      } else {
        setCellStates(Array(25).fill(null));
      }
    } catch (e) {
      console.error("Error reading localStorage:", e);
      setCellStates(Array(25).fill(null));
    }
  }, [progressKey, seed]);

  // Synchronize board progress across open windows/tabs (for streamer overlays)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === progressKey && e.newValue) {
        try {
          setCellStates(JSON.parse(e.newValue));
        } catch (err) {
          console.error("Failed to parse storage update:", err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [progressKey]);

  // Save progress changes to local storage
  const saveProgress = useCallback((newStates) => {
    setCellStates(newStates);
    try {
      localStorage.setItem(progressKey, JSON.stringify(newStates));
    } catch (e) {
      console.error("Error saving progress:", e);
    }
  }, [progressKey]);

  // Cell click handler: toggles Unchecked -> Checked -> Unchecked
  const handleCellClick = useCallback((index) => {
    const nextStates = [...cellStates];
    nextStates[index] = nextStates[index] ? null : 'checked';
    saveProgress(nextStates);
  }, [cellStates, saveProgress]);

  // Clear progress
  const handleResetProgress = useCallback(() => {
    saveProgress(Array(25).fill(null));
  }, [saveProgress]);

  // Check for win state
  const winState = useMemo(() => {
    for (const combo of WINNING_COMBINATIONS) {
      if (combo.every(idx => cellStates[idx] !== null)) {
        return {
          winner: 'checked',
          combo: combo
        };
      }
    }
    return null;
  }, [cellStates]);

  // Handle sharing URL copy
  const handleCopyLink = useCallback(() => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("Could not copy link:", err);
      });
  }, []);

  const getPageTitle = () => "Palworld Bingo Card Generator & Board Maker - EliteGamerInsights";
  const getPageDescription = () => "Free online Palworld Bingo generator. Create customized Palworld Bingo cards based on random seeds, with easy, medium, and hard difficulties for speedruns and challenges.";

  const schemas = [
    generateWebPageSchema({
      name: getPageTitle(),
      description: getPageDescription(),
      url: `${SITE_URL}/palworld/bingo`
    }),
    generateBreadcrumbSchema({
      items: [
        { name: "Home", url: SITE_URL },
        { name: "Palworld Pals", url: `${SITE_URL}/palworld/pals` },
        { name: "Bingo Generator", url: `${SITE_URL}/palworld/bingo` }
      ]
    }),
    generateSoftwareApplicationSchema({
      name: "Palworld Bingo Card Generator",
      description: getPageDescription(),
      applicationCategory: "GameApplication",
      operatingSystem: "Web Browser",
      url: `${SITE_URL}/palworld/bingo`,
      screenshot: `${SITE_URL}/palworld-bingo-og.png`
    }),
    generateFAQPageSchema({
      questions: [
        {
          question: "What is Palworld Bingo?",
          answer: "Palworld Bingo is an interactive speedrun and scavenger hunt companion game where players generate a seed-based board of 25 tasks to complete in a new survival world."
        },
        {
          question: "Can I play Palworld Bingo co-op with friends?",
          answer: "Yes, you can share the URL seed with a friend to generate the exact same board structure on their browser, allowing you to race each other in real-time."
        },
        {
          question: "What difficulties are available on the Palworld Bingo Generator?",
          answer: "The card generator supports Easy (early game), Medium (mid game), and Hard (end game) difficulties, scaling task requirements and targets to match your gameplay progression."
        }
      ]
    })
  ];

  if (!seed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-24 bg-base-950">
        <div className="w-12 h-12 border-4 border-accent-violet-900 border-t-accent-pink-500 rounded-full animate-spin mb-4"></div>
        <p className="text-base-300 text-sm">Generating Bingo Board...</p>
      </div>
    );
  }

  if (popoutParam) {
    return (
      <>
        <PageMetadata
          title={`Palworld Bingo Overlay - Seed ${seed}`}
          description="Streamer overlay view for Palworld Bingo."
          image="/palworld-bingo-og.png"
          imageAlt={`Palworld Bingo Overlay - Seed ${seed}`}
          imageWidth={1200}
          imageHeight={630}
        />
        <div className={`min-h-screen p-4 flex flex-col items-center justify-center transition-colors duration-350 ${
          chromaKey === 'green' ? 'bg-[#00FF00]' : 
          chromaKey === 'blue' ? 'bg-[#0000FF]' : 
          chromaKey === 'magenta' ? 'bg-[#FF00FF]' : 
          'bg-base-950'
        }`}>
          {/* Chroma key picker for OBS overlays */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-base-900/90 text-white border border-base-800/80 p-1.5 rounded-xl text-[10px] z-30 opacity-20 hover:opacity-100 transition-opacity duration-200">
            <span className="font-semibold px-1 text-gray-400">Background Key:</span>
            <button onClick={() => setChromaKey('dark')} className={`px-2 py-0.5 rounded-md font-medium transition-colors ${chromaKey === 'dark' ? 'bg-accent-violet-600 text-white' : 'bg-base-800 hover:bg-base-750 text-gray-300'}`}>Dark</button>
            <button onClick={() => setChromaKey('green')} className={`px-2 py-0.5 rounded-md font-medium transition-colors ${chromaKey === 'green' ? 'bg-accent-violet-600 text-white' : 'bg-base-800 hover:bg-base-750 text-gray-300'}`}>Green</button>
            <button onClick={() => setChromaKey('blue')} className={`px-2 py-0.5 rounded-md font-medium transition-colors ${chromaKey === 'blue' ? 'bg-accent-violet-600 text-white' : 'bg-base-800 hover:bg-base-750 text-gray-300'}`}>Blue</button>
            <button onClick={() => setChromaKey('magenta')} className={`px-2 py-0.5 rounded-md font-medium transition-colors ${chromaKey === 'magenta' ? 'bg-accent-violet-600 text-white' : 'bg-base-800 hover:bg-base-750 text-gray-300'}`}>Magenta</button>
          </div>

          <div className="w-full max-w-[500px]">
            {/* The 5x5 Grid */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 bg-base-950/90 p-2 sm:p-3 rounded-2xl border border-base-800 shadow-2xl relative">
              {boardCells.map((cell, idx) => {
                const cellColor = cellStates[idx];
                const isWinningCell = winState && winState.combo.includes(idx);
                
                let imgUrl = cell.image_url;
                if (cell.type === 'pal' || cell.type === 'boss') {
                  const normalizedTarget = (cell.target || "").toLowerCase();
                  if (palsData[normalizedTarget]) {
                    imgUrl = palsData[normalizedTarget].image_url;
                  }
                }

                let stateClasses = "bg-base-900/40 border-base-800/60 text-gray-300 hover:bg-base-800/30 hover:border-accent-violet-500/30";
                
                if (cellColor === 'checked') {
                  stateClasses = "bg-accent-violet-500/15 border-accent-violet-500/80 text-white ring-1 ring-accent-violet-500/30 shadow-lg";
                }

                if (isWinningCell) {
                  stateClasses += " ring-2 ring-amber-400 shadow-2xl shadow-amber-500/20 z-10 scale-[1.03]";
                }

                return (
                  <div
                    key={`popout_${cell.id}_${idx}`}
                    onClick={() => handleCellClick(idx)}
                    className={`aspect-square relative flex flex-col justify-between items-center text-center p-1 sm:p-2 rounded-xl border select-none cursor-pointer transition-all duration-300 ${stateClasses}`}
                  >
                    {isWinningCell && (
                      <span className="absolute -top-1 -left-1 w-3 h-3 bg-amber-400 rotate-45 transform origin-top-left shadow-md z-20"></span>
                    )}

                    {/* Top Badge: Type / Difficulty */}
                    <div className="w-full flex items-center justify-between text-[7px] sm:text-[9px] font-bold uppercase tracking-wider opacity-60">
                      <span className="truncate">{cell.type}</span>
                      <span className={`px-1 rounded-sm ${
                        cell.difficulty === 'hard' ? 'text-red-400' : (cell.difficulty === 'medium' ? 'text-amber-400' : 'text-emerald-400')
                      }`}>
                        {cell.difficulty[0]}
                      </span>
                    </div>

                    {/* Task Image or Emoji Fallback */}
                    <div className="my-1 sm:my-1.5 flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 relative">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={cell.target || cell.name}
                          className="w-full h-full object-contain pointer-events-none"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-lg sm:text-xl filter drop-shadow">
                          {cell.icon}
                        </span>
                      )}

                      {/* Completion Check Overlay */}
                      {cellColor && (
                        <div className="absolute inset-0 flex items-center justify-center bg-base-950/20 backdrop-blur-[0.5px] rounded-full">
                          <span className="text-xs sm:text-sm font-bold flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full shadow-md text-white bg-accent-violet-600/90">
                            ✓
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Task Label */}
                    <div className="w-full text-center leading-normal min-h-[24px] sm:min-h-[32px] flex items-center justify-center px-0.5">
                      <p className="text-[9px] sm:text-xs font-bold text-gray-150 line-clamp-2 select-none tracking-tight leading-snug">
                        {cell.name}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMetadata
        title={getPageTitle()}
        description={getPageDescription()}
        image="/palworld-bingo-og.png"
        imageAlt="Palworld Bingo Card Generator"
        imageWidth={1200}
        imageHeight={630}
        keywords="palworld bingo, palworld bingo card, palworld bingo generator, palworld bingo board, palworld speedrun bingo, palworld challenge board, palworld race, free palworld board generator, palworld bingo maker, play palworld bingo online"
      />
      <StructuredSchema schemas={schemas} />

      {/* Subtle Palworld Map Background Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/assets/pals/T_WorldMap.png" 
          alt="" 
          className="w-full h-full object-cover opacity-[0.1] filter blur-[1px]" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-base-900/10 via-base-950/80 to-base-950"></div>
      </div>

      <div className="min-h-screen pt-[120px] pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="container mx-auto max-w-4xl relative z-10">
          
          {/* Header */}
          <div className="text-center mb-8 relative">
            {/* Visual background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] bg-accent-violet-500/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 pb-2 bg-gradient-to-r from-accent-violet-400 via-accent-pink-400 to-amber-300 bg-clip-text text-transparent tracking-tight leading-normal sm:leading-normal">
              Palworld Bingo Board Generator
            </h1>
            <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Generate custom Palworld Bingo cards for speedruns, scavenger hunts, and co-op races. 
              Use our free seed-based Palworld Bingo board maker to create unique challenges instantly. Click cells to mark off completed tasks!
            </p>
          </div>

          {/* Bingo Completion Success Box */}
          {winState && (
            <div className="mb-8 p-6 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 border-2 border-amber-200 rounded-3xl text-center shadow-[0_0_40px_rgba(245,158,11,0.45)] text-base-950 relative overflow-hidden transition-all">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_40%)] pointer-events-none"></div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-widest text-base-950 uppercase animate-bounce mb-1">
                🎉 BINGO ACHIEVED! 🎉
              </h3>
              <p className="text-xs sm:text-sm font-extrabold text-base-950/90 tracking-wide uppercase">
                Congratulations! You completed a winning line of tasks!
              </p>
            </div>
          )}

          {/* 5x5 Bingo Grid (Full Width & Seed-Loaded) */}
          {loadingPals ? (
            /* Skeleton Board Grid matching real layout exactly */
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 bg-base-950/80 p-2 sm:p-4 rounded-3xl border border-base-800/80 shadow-2xl relative mb-6">
              {Array(25).fill(0).map((_, idx) => (
                <div
                  key={`skeleton_${idx}`}
                  className="aspect-square bg-base-900/20 border border-base-800/40 rounded-xl p-1.5 sm:p-2.5 flex flex-col justify-between items-center animate-pulse"
                >
                  <div className="w-8 sm:w-12 h-2 bg-base-800 rounded opacity-65"></div>
                  <div className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-base-800 my-1 sm:my-1.5 opacity-40"></div>
                  <div className="w-10 sm:w-16 h-2 bg-base-800 rounded opacity-65"></div>
                </div>
              ))}
            </div>
          ) : (
            /* Real Board Grid Container */
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 bg-base-950/80 p-2 sm:p-4 rounded-3xl border border-base-800/80 shadow-2xl relative mb-6">
              
              {/* Winning combination visual trace lines */}
              {winState && (
                <div className="absolute inset-0 border border-amber-500/30 rounded-3xl pointer-events-none bg-gradient-to-r from-amber-500/[0.02] to-amber-300/[0.02]"></div>
              )}

              {boardCells.map((cell, idx) => {
                const cellColor = cellStates[idx];
                const isWinningCell = winState && winState.combo.includes(idx);
                
                // Resolve custom image URL for Pals
                let imgUrl = cell.image_url;
                if (cell.type === 'pal' || cell.type === 'boss') {
                  const normalizedTarget = (cell.target || "").toLowerCase();
                  if (palsData[normalizedTarget]) {
                    imgUrl = palsData[normalizedTarget].image_url;
                  }
                }

                // CSS styling for check states
                let stateClasses = "bg-base-900/40 border-base-800/60 text-gray-300 hover:bg-base-800/30 hover:border-accent-violet-500/30 hover:-translate-y-[2px]";
                
                if (cellColor === 'checked') {
                  stateClasses = "bg-accent-violet-500/15 border-accent-violet-500/80 text-white shadow-lg shadow-accent-violet-500/5 ring-1 ring-accent-violet-500/30";
                }

                if (isWinningCell) {
                  stateClasses += " ring-2 ring-amber-400 shadow-2xl shadow-amber-500/20 z-10 scale-[1.03]";
                }

                return (
                  <div
                    key={`${cell.id}_${idx}`}
                    onClick={() => handleCellClick(idx)}
                    className={`aspect-square relative flex flex-col justify-between items-center text-center p-1 sm:p-2 rounded-xl border select-none cursor-pointer transition-all duration-300 ${stateClasses}`}
                  >
                    {/* Winning golden corner badge */}
                    {isWinningCell && (
                      <span className="absolute -top-1 -left-1 w-3 h-3 bg-amber-400 rotate-45 transform origin-top-left shadow-md z-20"></span>
                    )}

                    {/* Book Icon linking to Palworld Directory for Pal Items */}
                    {(cell.type === 'pal' || cell.type === 'boss') && cell.target && (
                      <Link
                        to={`/palworld/pals/${encodeURIComponent(cell.target)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-1 right-1 p-0.5 rounded bg-base-950/80 hover:bg-accent-violet-600 border border-base-750 hover:border-accent-violet-500 text-[10px] text-gray-400 hover:text-white transition-all z-20 flex items-center justify-center"
                        title={`View ${cell.target} details in Paldex`}
                      >
                        📖
                      </Link>
                    )}

                    {/* Top Badge: Type / Difficulty */}
                    <div className="w-full flex items-center justify-between text-[8px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-wider opacity-60">
                      <span className="truncate">{cell.type}</span>
                      <span className={`px-1 rounded-sm ${
                        cell.difficulty === 'hard' ? 'text-red-400' : (cell.difficulty === 'medium' ? 'text-amber-400' : 'text-emerald-400')
                      }`}>
                        {cell.difficulty[0]}
                      </span>
                    </div>

                    {/* Task Image or Emoji Fallback */}
                    <div className="my-1 sm:my-1.5 flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 relative">
                      {loadingPals && (cell.type === 'pal' || cell.type === 'boss') ? (
                        <div className="w-4 h-4 rounded-full border border-base-800 border-t-accent-violet-500 animate-spin"></div>
                      ) : imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={cell.target || cell.name}
                          className="w-full h-full object-contain pointer-events-none transition-transform group-hover:scale-105 duration-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-lg sm:text-xl md:text-2xl filter drop-shadow">
                          {cell.icon}
                        </span>
                      )}

                      {/* Completion Check Overlay */}
                      {cellColor && (
                        <div className="absolute inset-0 flex items-center justify-center bg-base-950/20 backdrop-blur-[0.5px] rounded-full">
                          <span className="text-xs sm:text-sm font-bold flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full shadow-md text-white bg-accent-violet-600/90">
                            ✓
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Task Label */}
                    <div className="w-full text-center leading-normal min-h-[24px] sm:min-h-[32px] md:min-h-[44px] flex items-center justify-center px-0.5">
                      <p className="text-[9.5px] sm:text-xs md:text-sm font-bold text-gray-150 line-clamp-2 select-none tracking-tight leading-snug">
                        {cell.name}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Interactive Legend (Simplified) */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-6 px-4 py-2 bg-base-950/20 rounded-2xl border border-base-800/40 text-xs text-base-300">
            <span className="font-semibold text-white">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-base-900 border border-base-750 inline-block"></span>
              <span>Unmarked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-accent-violet-500/20 border border-accent-violet-500/60 inline-block shadow-sm"></span>
              <span className="font-medium text-accent-violet-400">Completed (✓)</span>
            </div>
          </div>

          {/* Configuration and Controls Panel */}
          <div className="bg-base-950/40 backdrop-blur-xl border border-base-800 rounded-2xl p-4 sm:p-6 mb-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              
              {/* Mode Select */}
              <div>
                <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">Game Mode</label>
                <select
                  value={mode}
                  onChange={(e) => {
                    const nextMode = e.target.value;
                    setMode(nextMode);
                    updateURLParams(seed, difficulty, nextMode);
                  }}
                  className="w-full bg-base-900 border border-base-700 hover:border-base-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-violet-500/40 transition-colors"
                >
                  <option value="balanced">Balanced Mix (All Tasks)</option>
                  <option value="pals">Pals Only (Scavenger Hunt)</option>
                  <option value="survival">Survival Only (Craft/Build/Items)</option>
                </select>
              </div>

              {/* Difficulty Select */}
              <div>
                <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => {
                    const nextDiff = e.target.value;
                    setDifficulty(nextDiff);
                    updateURLParams(seed, nextDiff, mode);
                  }}
                  className="w-full bg-base-900 border border-base-700 hover:border-base-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-violet-500/40 transition-colors"
                >
                  <option value="mixed">Mixed (All Difficulties)</option>
                  <option value="easy">Easy (Early Game / Windswept Hills)</option>
                  <option value="medium">Medium (Mid Game / Level 15-30)</option>
                  <option value="hard">Hard (End Game / Level 30+)</option>
                </select>
              </div>

              {/* Seed Configuration */}
              <div>
                <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">Board Seed</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        updateURLParams(val, difficulty, mode);
                      }
                    }}
                    className="w-full bg-base-900 border border-base-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-violet-500/40"
                    placeholder="Enter seed"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 items-center justify-between border-t border-base-800 pt-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleGenerateNewCard()}
                  className="bg-accent-violet-600 hover:bg-accent-violet-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-accent-violet-500/10 hover:shadow-accent-violet-500/20 active:scale-95 transition-all"
                >
                  🎲 Roll New Card
                </button>
                <button
                  onClick={handleCopyLink}
                  className="bg-base-800 hover:bg-base-700 border border-base-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
                >
                  🔗 {copied ? "Copied Link!" : "Copy Share Link"}
                </button>
                <button
                  onClick={() => {
                    const url = window.location.pathname + window.location.search + '&popout=true';
                    window.open(url, 'palworld_bingo_popout', 'width=550,height=630,menubar=no,status=no,toolbar=no,location=no');
                  }}
                  className="bg-base-800 hover:bg-base-700 border border-base-700 hover:border-accent-violet-500/30 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
                  title="Open streamer-friendly overlay screen"
                >
                  📺 Streamer Popout
                </button>
              </div>
              
              <button
                onClick={handleResetProgress}
                className="text-base-400 hover:text-red-400 text-xs font-medium border border-transparent hover:border-red-500/20 px-3 py-2 rounded-xl hover:bg-red-500/5 transition-all"
              >
                🗑️ Clear board progress
              </button>
            </div>
          </div>

          {/* Instructions / Info Panel */}
          <div className="bg-base-950/20 border border-base-800/60 rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
              How to Play Palworld Bingo Races
            </h2>
            
            <div className="space-y-4 text-sm text-base-300">
              <p>
                <strong>Palworld Bingo</strong> is an interactive speedrun companion game. Players spawn in a new Palworld game and complete tasks on their custom Palworld Bingo card.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="bg-base-950/40 p-4 rounded-2xl border border-base-800/40">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-1.5">
                    <span>🟢</span> Solo Challenge
                  </h4>
                  <p className="text-xs">
                    Try to get 5 tasks in a row (vertical, horizontal, or diagonal) as fast as possible on your own. It's a great way to spice up a new survival file!
                  </p>
                </div>
                <div className="bg-base-950/40 p-4 rounded-2xl border border-base-800/40">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-1.5">
                    <span>⚔️</span> Speedrun Race
                  </h4>
                  <p className="text-xs">
                    Share the URL with a friend. Since the card generates identically from the seed, you start simultaneously on separate games to see who gets a line first!
                  </p>
                </div>
                <div className="bg-base-950/40 p-4 rounded-2xl border border-base-800/40">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-1.5">
                    <span>📚</span> Paldex Insights
                  </h4>
                  <p className="text-xs">
                    Need help finding a Pal or checking its traits? Click the 📖 book icon on any Pal card to jump directly to its entry in the database.
                  </p>
                </div>
              </div>

              <div className="border-t border-base-800/50 pt-4 mt-6">
                <h3 className="font-semibold text-white text-base mb-2">Game Configurations</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-base-400">
                  <li><strong>Balanced Mix:</strong> A curated balance of catching Pals, building production bases, crafting gear, exploration travel, and defeating Alpha bosses.</li>
                  <li><strong>Pals Only:</strong> Pure scavenger hunt. Fetches Pals from the official Paldex and randomly assigns 25 tamables to capture matching your difficulty.</li>
                  <li><strong>Survival Only:</strong> Focuses strictly on base milestones, tech unlocks, farming plantation, crafting tools, and hunting resources.</li>
                  <li><strong>Easy/Medium/Hard filters:</strong> Scale the card according to how long you want to play. Easy is completeable in under 30-45 minutes. Hard might take hours of progression!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Latest Palworld Articles section */}
          {loadingArticles ? (
            <div className="mt-12 border-t border-base-800 pt-10 animate-pulse">
              <h2 className="text-2xl font-extrabold text-white mb-6 text-center">
                Latest <span className="text-accent-pink-400">Palworld</span> News & Guides
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {Array(3).fill(0).map((_, idx) => (
                  <div
                    key={`article_skeleton_${idx}`}
                    className="bg-base-950/40 border border-base-800/80 rounded-2xl overflow-hidden flex flex-col h-[280px]"
                  >
                    <div className="aspect-video bg-base-900/40"></div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="h-4 bg-base-800 rounded w-full"></div>
                        <div className="h-4 bg-base-800 rounded w-5/6"></div>
                      </div>
                      <div className="h-3 bg-base-800 rounded w-1/3 mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : articles.length > 0 ? (
            <div className="mt-12 border-t border-base-800 pt-10">
              <h2 className="text-2xl font-extrabold text-white mb-6 text-center">
                Latest <span className="text-accent-pink-400">Palworld</span> News & Guides
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {articles.map(article => (
                  <Link
                    key={article.id}
                    to={`/games/${article.slug}/`}
                    className="group bg-base-950/40 hover:bg-base-900/60 border border-base-800/80 hover:border-accent-violet-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-accent-violet-500/5 flex flex-col"
                  >
                    {article.image ? (
                      <div className="aspect-video overflow-hidden bg-base-900">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-base-800 to-base-900 flex items-center justify-center">
                        <span className="text-3xl">🎮</span>
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <h3
                        className="text-sm font-bold text-white group-hover:text-accent-violet-300 transition-colors line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: article.title }}
                      />
                      <span className="mt-3 text-[11px] font-semibold text-accent-pink-400 uppercase tracking-wider flex items-center gap-1">
                        Read Article <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

        </div>
      </div>
    </>
  );
}

export default PalworldBingo;
