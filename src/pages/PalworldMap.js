import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageMetadata, { SITE_URL } from '../components/PageMetadata';
import StructuredSchema, { generateWebPageSchema, generateBreadcrumbSchema } from '../components/StructuredSchema';
import { palworldApi } from '../services/palworldApi';

const MAP_SIZE = 2048;

// Calibrated world coordinate extents of the Palworld map image.
// Derived via least-squares regression over 23 known alpha boss positions
// mapping world_xy (Unreal Engine coords in cm) to in-game HUD display coords.
// hx = 0.002178 * world_xy.y - 344.07   (canvas horizontal / HUD X)
// hy = 0.002178 * world_xy.x + 269.81   (canvas vertical / HUD Y)
const WY_MIN = -312119;   // world_xy.y at left edge of map canvas
const WY_RANGE = 940129;  // total world_xy.y span across canvas width
const WX_MIN = -593906;   // world_xy.x at bottom edge of map canvas
const WX_RANGE = 940104;  // total world_xy.x span across canvas height

// HUD display range (preserved for mouse coordinate tooltip display)
const HUD_RANGE = 2048;
const HUD_MIN = -1024;

const ELEMENT_TYPES = [
  "neutral", "fire", "water", "grass", "electric", "earth", "ice", "dragon", "dark"
];

function PalworldMap() {
  const [pals, setPals] = useState([]);
  const [spawnsData, setSpawnsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPal, setSelectedPal] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedElement, setSelectedElement] = useState("all");
  const [showNormalSpawns, setShowNormalSpawns] = useState(true);
  const [showBossSpawns, setShowBossSpawns] = useState(true);
  const [minLevelFilter, setMinLevelFilter] = useState(1);
  const [maxLevelFilter, setMaxLevelFilter] = useState(80);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Zoom & Pan Viewport State
  const [zoom, setZoom] = useState(0.35); // Initial zoom to fit map
  const [pan, setPan] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [hoverCoords, setHoverCoords] = useState(null);

  const viewportRef = useRef(null);
  const canvasRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Load Pals list and spawns json
  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [palsRes, spawnsRes] = await Promise.all([
          palworldApi.getPals({ limit: 400 }),
          fetch('/assets/pals/spawns.json').then(res => res.json())
        ]);

        if (active) {
          // Sort pals alphabetically
          const sortedPals = (palsRes.data || []).sort((a, b) => a.name.localeCompare(b.name));
          setPals(sortedPals);
          setSpawnsData(spawnsRes);

          // Select first Pal in the list as default if available
          if (sortedPals.length > 0) {
            setSelectedPal(sortedPals[0]);
          }
        }
      } catch (err) {
        console.error("Error loading Palworld Map datasets:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  // Filtered Pals list for sidebar selection
  const filteredPals = useMemo(() => {
    return pals.filter(pal => {
      const matchesSearch = pal.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesElement = selectedElement === "all" || 
        pal.element_types?.some(el => el.toLowerCase() === selectedElement.toLowerCase());
      return matchesSearch && matchesElement;
    });
  }, [pals, searchQuery, selectedElement]);

  // Extract spawns for the currently selected Pal
  const currentPalSpawns = useMemo(() => {
    if (!spawnsData || !selectedPal) return [];
    const spawns = spawnsData[selectedPal.internal_id] || [];
    
    // Filter spawns based on active filter toggles & levels
    return spawns.filter(pt => {
      if (pt.isBoss && !showBossSpawns) return false;
      if (!pt.isBoss && !showNormalSpawns) return false;
      
      const ptMinLevel = pt.minLevel || 1;
      const ptMaxLevel = pt.maxLevel || 80;
      
      return ptMinLevel >= minLevelFilter && ptMaxLevel <= maxLevelFilter;
    });
  }, [spawnsData, selectedPal, showNormalSpawns, showBossSpawns, minLevelFilter, maxLevelFilter]);

  // Coordinate conversion: world_xy (Unreal cm) -> canvas relX/relY [0..1]
  // and HUD display X/Y values matching the in-game coordinate display.
  const getSpawnerMapCoords = useCallback((pt) => {
    // pt.x = world_xy.x, pt.y = world_xy.y (Unreal Engine world coordinates)
    const relX = (pt.y - WY_MIN) / WY_RANGE;         // horizontal (left=0, right=1)
    const relY = 1.0 - (pt.x - WX_MIN) / WX_RANGE;  // vertical (top=0, bottom=1)

    // In-game HUD display coordinates (matches xy field in v1 dataset)
    const gameX = Math.round(0.002178 * pt.y - 344.07);
    const gameY = Math.round(0.002178 * pt.x + 269.81);

    return { relX, relY, gameX, gameY };
  }, []);

  // Redraw spawns on canvas overlay
  const drawSpawns = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, MAP_SIZE, MAP_SIZE);

    if (currentPalSpawns.length === 0) return;

    currentPalSpawns.forEach(pt => {
      const { relX, relY } = getSpawnerMapCoords(pt);

      const px = relX * MAP_SIZE;
      const py = relY * MAP_SIZE;

      // Spawner Radius in relative pixel units
      const radiusPx = Math.max(8, (pt.radius / WY_RANGE) * MAP_SIZE);

      ctx.beginPath();
      ctx.arc(px, py, radiusPx, 0, 2 * Math.PI);

      if (pt.isBoss) {
        // Red glowing rings for bosses
        ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.95)';
        ctx.lineWidth = 4;
        ctx.fill();
        ctx.stroke();

        // Inner marker dot
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      } else {
        // Vibrant gold/orange for regular spawn zones
        ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      }
    });
  }, [currentPalSpawns, getSpawnerMapCoords]);

  // Redraw whenever filtered spawns list changes
  useEffect(() => {
    drawSpawns();
  }, [drawSpawns]);

  // Centering & Zoom fit presets
  const handleResetView = () => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const fitZoom = Math.min(rect.width, rect.height) / MAP_SIZE;
    setZoom(fitZoom * 0.95);
    setPan({
      x: (rect.width - MAP_SIZE * fitZoom * 0.95) / 2,
      y: (rect.height - MAP_SIZE * fitZoom * 0.95) / 2
    });
  };

  // Center view on current spawners
  const handleCenterOnSpawns = () => {
    if (currentPalSpawns.length === 0 || !viewportRef.current) return;

    // Find bounding box of spawns
    let minX = MAP_SIZE;
    let maxX = 0;
    let minY = MAP_SIZE;
    let maxY = 0;

    currentPalSpawns.forEach(pt => {
      const { relX, relY } = getSpawnerMapCoords(pt);
      const px = relX * MAP_SIZE;
      const py = relY * MAP_SIZE;

      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const rect = viewportRef.current.getBoundingClientRect();
    const newZoom = 1.2; // Focus level
    setZoom(newZoom);
    setPan({
      x: rect.width / 2 - centerX * newZoom,
      y: rect.height / 2 - centerY * newZoom
    });
  };

  // Run initial fit preset on load
  useEffect(() => {
    if (!loading) {
      setTimeout(handleResetView, 100);
    }
  }, [loading]);

  // Drag Pan Events Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left-click
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e) => {
    // Coordinate HUD tracking
    if (viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const mapX = (mouseX - pan.x) / zoom;
      const mapY = (mouseY - pan.y) / zoom;

      if (mapX >= 0 && mapX <= MAP_SIZE && mapY >= 0 && mapY <= MAP_SIZE) {
        const relX = mapX / MAP_SIZE;
        const relY = mapY / MAP_SIZE;

        // Convert canvas position back to in-game HUD display coordinates
        const worldY = relX * WY_RANGE + WY_MIN;
        const worldX = (1.0 - relY) * WX_RANGE + WX_MIN;
        const gameX = Math.round(0.002178 * worldY - 344.07);
        const gameY = Math.round(0.002178 * worldX + 269.81);

        setHoverCoords({ x: gameX, y: gameY });
      } else {
        setHoverCoords(null);
      }
    }

    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Mobile Touch Support
  const touchStartRef = useRef({ x: 0, y: 0 });
  const lastTouchDistRef = useRef(0);

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      touchStartRef.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y };
    } else if (e.touches.length === 2) {
      // Pinch zoom prep
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistRef.current = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - touchStartRef.current.x,
        y: e.touches[0].clientY - touchStartRef.current.y
      });
    } else if (e.touches.length === 2 && viewportRef.current) {
      // Pinch zoom gesture logic
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const rect = viewportRef.current.getBoundingClientRect();
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

      const mapX = (midX - pan.x) / zoom;
      const mapY = (midY - pan.y) / zoom;

      const factor = dist / lastTouchDistRef.current;
      const nextZoom = Math.min(Math.max(zoom * factor, 0.15), 5.0);

      setZoom(nextZoom);
      setPan({
        x: midX - mapX * nextZoom,
        y: midY - mapY * nextZoom
      });

      lastTouchDistRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    lastTouchDistRef.current = 0;
  };

  // Scroll Wheel Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    if (!viewportRef.current) return;

    const rect = viewportRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const mapX = (mouseX - pan.x) / zoom;
    const mapY = (mouseY - pan.y) / zoom;

    const zoomFactor = 1.15;
    const nextZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    const boundedZoom = Math.min(Math.max(nextZoom, 0.15), 5.0);

    setZoom(boundedZoom);
    setPan({
      x: mouseX - mapX * boundedZoom,
      y: mouseY - mapY * boundedZoom
    });
  };

  const handleZoomBtn = (zoomIn) => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const mapX = (centerX - pan.x) / zoom;
    const mapY = (centerY - pan.y) / zoom;

    const zoomFactor = 1.3;
    const nextZoom = zoomIn ? zoom * zoomFactor : zoom / zoomFactor;
    const boundedZoom = Math.min(Math.max(nextZoom, 0.15), 5.0);

    setZoom(boundedZoom);
    setPan({
      x: centerX - mapX * boundedZoom,
      y: centerY - mapY * boundedZoom
    });
  };

  const getPageTitle = () => "Interactive Palworld Spawn Map - Realtime Paldex Locations";
  const getPageDescription = () => "Trace coordinate locations, capture rates, and spawner level spreads for wild Pals. Filter, search, zoom, and pan across Sunreach Sky Islands and the World Tree regions.";

  const schemas = [
    generateWebPageSchema({
      name: getPageTitle(),
      description: getPageDescription(),
      url: `${SITE_URL}/palworld/map`
    }),
    generateBreadcrumbSchema({
      items: [
        { name: "Home", url: SITE_URL },
        { name: "Palworld Hub", url: `${SITE_URL}/palworld` },
        { name: "Interactive Map", url: `${SITE_URL}/palworld/map` }
      ]
    })
  ];

  return (
    <>
      <PageMetadata
        title={getPageTitle()}
        description={getPageDescription()}
        image="/palworld-hub-og.png"
        keywords="palworld spawn map, interactive palworld map, palworld alpha boss coordinates, wild spawn zones, palworld world tree, sunreach islands map"
      />
      <StructuredSchema schemas={schemas} />

      <div className="h-screen pt-[80px] flex overflow-hidden bg-base-950 text-gray-200">
        
        {/* Toggle Sidebar Control Floating Button for Mobile Viewports */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-6 left-6 z-45 bg-accent-violet-600 hover:bg-accent-violet-500 text-white p-4 rounded-full shadow-2xl transition-all duration-300 border border-accent-violet-400/20"
          aria-label="Toggle Control Sidebar"
        >
          {sidebarOpen ? "❌ Hide Controls" : "🛠️ Control Board"}
        </button>

        {/* Control Panel Sidebar */}
        <div 
          className={`shrink-0 w-80 sm:w-96 border-r border-base-800 bg-base-950/90 backdrop-blur-xl flex flex-col h-full z-30 transition-all duration-300 ${
            sidebarOpen ? 'translate-x-0 ml-0' : '-translate-x-full -ml-80 sm:-ml-96 lg:translate-x-0 lg:ml-0'
          } fixed lg:relative top-[80px] bottom-0 lg:top-0`}
        >
          {/* Header Title */}
          <div className="p-4 sm:p-6 border-b border-base-800/80">
            <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-accent-violet-300 via-accent-pink-300 to-amber-300 bg-clip-text text-transparent tracking-tight">
              Interactive Paldex Map
            </h1>
            <p className="text-xs text-base-400 mt-1">Real-time Wild Spawn Distributions &amp; Levels</p>
          </div>

          {/* Search inputs & filters */}
          <div className="p-4 border-b border-base-850 space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Search Pals</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Pals by name..."
                className="w-full bg-base-900 border border-base-805 hover:border-base-750 focus:border-accent-violet-500/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Filter Element</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedElement("all")}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all border ${
                    selectedElement === "all"
                      ? 'bg-accent-violet-600 border-accent-violet-500 text-white shadow'
                      : 'bg-base-900/50 border-base-800 text-gray-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                {ELEMENT_TYPES.map(elem => (
                  <button
                    key={elem}
                    onClick={() => setSelectedElement(elem)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all border ${
                      selectedElement === elem
                        ? 'bg-accent-violet-600 border-accent-violet-500 text-white shadow'
                        : 'bg-base-900/50 border-base-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {elem}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pals scrolling grid list */}
          <div className="flex-1 overflow-y-auto divide-y divide-base-900 custom-scrollbar p-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <div className="w-8 h-8 border-4 border-accent-pink-900 border-t-accent-violet-500 rounded-full animate-spin"></div>
                <p className="text-xs text-base-400 italic">Paldex records parsing...</p>
              </div>
            ) : filteredPals.length > 0 ? (
              filteredPals.map(pal => {
                const isSelected = selectedPal?.id === pal.id;
                const hasSpawns = spawnsData && spawnsData[pal.internal_id] && spawnsData[pal.internal_id].length > 0;
                
                return (
                  <button
                    key={pal.id}
                    onClick={() => setSelectedPal(pal)}
                    className={`w-full text-left flex items-center gap-3 p-2.5 rounded-xl transition-all border ${
                      isSelected 
                        ? 'bg-gradient-to-r from-accent-violet-950/20 to-base-900/40 border-accent-violet-500/30' 
                        : 'border-transparent hover:bg-white/5'
                    }`}
                  >
                    <div className="w-9 h-9 bg-base-900/60 p-1.5 rounded-xl shrink-0 flex items-center justify-center border border-base-800">
                      {pal.image_url ? (
                        <img src={pal.image_url} alt={pal.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-base">🐾</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-accent-violet-300' : 'text-white'}`}>
                          {pal.name}
                        </p>
                        {!hasSpawns && (
                          <span className="text-[8px] font-black text-accent-pink-400 bg-accent-pink-950/30 border border-accent-pink-900/30 px-1 py-0.5 rounded uppercase shrink-0">
                            Breeding Only
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 mt-0.5">
                        {pal.element_types?.map(el => (
                          <span key={el} className="text-[8px] font-bold text-base-400 uppercase tracking-wide">
                            {el}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-base-400 italic">No Pals match search query.</div>
            )}
          </div>

          {/* Active selection stats panel */}
          {selectedPal && (
            <div className="p-4 sm:p-5 bg-base-900/40 border-t border-base-850 space-y-4 shadow-2xl shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-base-800/40 rounded-xl p-1.5 flex items-center justify-center border border-base-800">
                  {selectedPal.image_url ? (
                    <img src={selectedPal.image_url} alt={selectedPal.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xl">🐾</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white leading-tight truncate">{selectedPal.name}</h3>
                  <div className="flex gap-1.5 mt-0.5">
                    {selectedPal.element_types?.map(el => (
                      <span key={el} className="text-[9px] font-extrabold text-accent-violet-300 uppercase bg-accent-violet-950/20 border border-accent-violet-900/20 px-1.5 py-0.5 rounded">
                        {el}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Spawn Level range filters */}
              <div className="space-y-3 pt-2 border-t border-base-850">
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase">
                  <span>Toggle Spawner Types</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowNormalSpawns(!showNormalSpawns)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                      showNormalSpawns
                        ? 'bg-amber-600/10 border-amber-500/40 text-amber-300'
                        : 'bg-base-950 border-base-850 text-gray-500'
                    }`}
                  >
                    🟡 Normal ({currentPalSpawns.filter(s => !s.isBoss).length})
                  </button>
                  <button
                    onClick={() => setShowBossSpawns(!showBossSpawns)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                      showBossSpawns
                        ? 'bg-red-600/10 border-red-500/40 text-red-300'
                        : 'bg-base-950 border-base-850 text-gray-500'
                    }`}
                  >
                    🔴 Alpha ({currentPalSpawns.filter(s => s.isBoss).length})
                  </button>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                    <span>Spawn Level Filters</span>
                    <span className="text-white font-mono">{minLevelFilter} - {maxLevelFilter}</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min="1"
                      max="80"
                      value={minLevelFilter}
                      onChange={(e) => setMinLevelFilter(Math.min(parseInt(e.target.value, 10), maxLevelFilter))}
                      className="w-full accent-accent-violet-500 bg-base-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="range"
                      min="1"
                      max="80"
                      value={maxLevelFilter}
                      onChange={(e) => setMaxLevelFilter(Math.max(parseInt(e.target.value, 10), minLevelFilter))}
                      className="w-full accent-accent-pink-500 bg-base-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2.5 pt-3 border-t border-base-850">
                <Link
                  to={`/palworld/pals/${encodeURIComponent(selectedPal.name)}`}
                  className="flex-1 text-center bg-base-900 border border-base-800 hover:border-base-750 text-xs font-bold text-gray-200 py-2.5 rounded-xl transition"
                >
                  View Paldex
                </Link>
                {currentPalSpawns.length > 0 ? (
                  <button
                    onClick={handleCenterOnSpawns}
                    className="flex-1 bg-gradient-to-r from-accent-violet-600 to-accent-pink-600 hover:from-accent-violet-500 hover:to-accent-pink-500 text-xs font-bold text-white py-2.5 rounded-xl transition shadow-lg shadow-accent-violet-600/10"
                  >
                    Center on Spawns
                  </button>
                ) : (
                  <Link
                    to="/palworld/palworld-breeding"
                    className="flex-1 text-center bg-gradient-to-r from-accent-pink-600 to-accent-violet-600 hover:scale-[1.02] text-xs font-bold text-white py-2.5 rounded-xl transition"
                  >
                    Breeding Guide
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Interactive Map Viewport Area */}
        <div className="flex-1 relative h-full bg-base-950 overflow-hidden select-none">
          
          {/* Viewport Window Wrapper */}
          <div
            ref={viewportRef}
            className="w-full h-full cursor-grab active:cursor-grabbing outline-none overflow-hidden relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            {/* Viewport content scaler */}
            <div
              style={{
                width: `${MAP_SIZE}px`,
                height: `${MAP_SIZE}px`,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'top left',
              }}
              className="absolute pointer-events-none select-none"
            >
              {/* Native browser image handling */}
              <img
                src="/assets/pals/T_WorldMap.png"
                alt="Palworld Map"
                className="w-full h-full object-cover select-none pointer-events-none"
              />

              {/* Dynamic canvas graphics overlay */}
              <canvas
                ref={canvasRef}
                width={MAP_SIZE}
                height={MAP_SIZE}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
            </div>

            {/* In-Game Coordinates Tracker HUD Box */}
            <div className="absolute top-6 left-6 z-20 bg-base-950/80 backdrop-blur-xl border border-base-800 rounded-2xl px-5 py-3 shadow-2xl flex flex-col gap-0.5">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Map Coordinates</span>
              <span className="text-sm sm:text-base font-bold text-white font-mono leading-none mt-1">
                {hoverCoords ? `[ X: ${hoverCoords.x}, Y: ${hoverCoords.y} ]` : "[ Hover Map to Read ]"}
              </span>
            </div>

            {/* Map Interaction Toolbar */}
            <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2 bg-base-950/80 backdrop-blur-xl border border-base-800 rounded-2xl p-2 shadow-2xl">
              <button
                onClick={() => handleZoomBtn(true)}
                className="w-10 h-10 bg-base-900 hover:bg-base-800 hover:text-white border border-base-800/80 rounded-xl transition flex items-center justify-center font-bold text-lg"
                title="Zoom In"
              >
                ＋
              </button>
              <button
                onClick={() => handleZoomBtn(false)}
                className="w-10 h-10 bg-base-900 hover:bg-base-800 hover:text-white border border-base-800/80 rounded-xl transition flex items-center justify-center font-bold text-lg"
                title="Zoom Out"
              >
                －
              </button>
              <button
                onClick={handleResetView}
                className="w-10 h-10 bg-base-900 hover:bg-base-800 hover:text-white border border-base-800/80 rounded-xl transition flex items-center justify-center text-sm"
                title="Fit View"
              >
                🏠
              </button>
            </div>

            {/* No Spawns Overlay Banner Warning */}
            {selectedPal && (!spawnsData || !spawnsData[selectedPal.internal_id] || spawnsData[selectedPal.internal_id].length === 0) && (
              <div className="absolute inset-x-0 top-24 z-20 flex justify-center px-4">
                <div className="max-w-md w-full bg-gradient-to-r from-accent-pink-950/40 to-accent-violet-950/40 border border-accent-pink-500/25 px-5 py-4 rounded-2xl backdrop-blur-xl text-center shadow-2xl">
                  <h4 className="text-sm font-bold text-white">No Wild Spawns Discovered</h4>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    <strong>{selectedPal.name}</strong> is a legendary boss or a specialized breeding species that does not spawn under normal spawners. 
                    Unlock it via breeding combos!
                  </p>
                  <Link
                    to="/palworld/palworld-breeding"
                    className="inline-block mt-3 bg-gradient-to-r from-accent-pink-600 to-accent-violet-600 hover:from-accent-pink-500 hover:to-accent-pink-500 text-[10px] font-black text-white px-4 py-2 rounded-full uppercase tracking-wider transition shadow-lg shadow-accent-pink-500/10"
                  >
                    Find Breeding Combos →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}

export default PalworldMap;
