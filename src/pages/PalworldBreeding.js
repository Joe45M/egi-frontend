import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageMetadata, { SITE_URL } from '../components/PageMetadata';
import StructuredSchema, {
  generateWebPageSchema,
  generateBreadcrumbSchema,
  generateFAQPageSchema
} from '../components/StructuredSchema';
import FAQ from '../components/FAQ';

const FAQS = [
  {
    q: "How does breeding work in Palworld 1.0?",
    a: "Breeding in Palworld is based on a hidden 'Breeding Power' value assigned to each Pal. When you breed two parents, the offspring is determined by averaging the Breeding Power of both parents (Parent A + Parent B) / 2 and finding the Pal whose Breeding Power is closest to that average. Unique combinations exist that bypass this formula, such as Helzephyr and Frostallion to breed Frostallion Noct."
  },
  {
    q: "What is the new Mutation system in Palworld 1.0?",
    a: "The 1.0 update introduced the Mutation mechanic. During breeding, there is a low chance (around 1%) for an egg to mutate. A mutated egg overrides the standard breeding result to produce a powerful Alpha Pal with boosted base stats and unique, mutation-exclusive 'Rainbow' passive skills. You can increase these mutation chances up to 3% using Extravagant Vegetable Cakes."
  },
  {
    q: "What are the new mutation-exclusive 'Rainbow' passive skills?",
    a: "Mutated Pals can hatch with rare Rainbow-tier passive skills. These include Immortality (+5% Life Steal, +100% health regen, +15% Attack), Idiosyncratic (+50% health regen, +25% Defense, Poison/Burn immunity), Babysitter (+30% egg production & incubation speed), and Heavily Armored (Explosion damage immunity). Once you hatch one, you can breed it down to other Pals normally."
  },
  {
    q: "How can I guarantee passing down specific passive skills to offspring?",
    a: "To maximize passive skill inheritance, use 'clean' parents that only possess the exact skills you want to inherit. The sweet spot is having exactly 4 desired passives spread across the parent pool (e.g., 2 on Parent A, 2 on Parent B). Using Special Cake further improves the odds of a successful inheritance."
  },
  {
    q: "Can the new Palworld 1.0 Pals be bred?",
    a: "Yes, the new 1.0 Pals (such as Aegidron, Amione, Astralym, etc.) have been integrated into the breeding database. They follow the standard breeding power calculations and have specific unique combos. You can find all their breeding options here."
  }
];

const RAINBOW_PASSIVES = [
  { name: "Immortality", effect: "+5% Life Steal, +100% Pal Auto Health Regeneration, +15% Attack" },
  { name: "Idiosyncratic", effect: "+50% Pal/Player Auto Health Regeneration, +25% Defense, Immune to Poison/Burn" },
  { name: "Babysitter", effect: "+30% Egg Production speed, +30% Incubation speed at Breeding Farm" },
  { name: "Heavily Armored", effect: "Immune to Explosion damage" },
  { name: "Skymarcher", effect: "+2 Mounted jump count" },
  { name: "Ranch Master", effect: "+2 Farming work suitability level" },
  { name: "Lavish Hospitality", effect: "+100% dropped items while the Pal is active" }
];

export default function PalworldBreeding() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mode: 'offspring' (parent A + B -> offspring) or 'parents' (target -> parent combos)
  const [mode, setMode] = useState('offspring');

  // Offspring Calculator State
  const [parentA, setParentA] = useState('');
  const [parentB, setParentB] = useState('');
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');
  const [showDropdownA, setShowDropdownA] = useState(false);
  const [showDropdownB, setShowDropdownB] = useState(false);

  // Target Calculator State
  const [targetPal, setTargetPal] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [showDropdownTarget, setShowDropdownTarget] = useState(false);
  const [parentFilter, setParentFilter] = useState('');

  const dropdownRefA = useRef(null);
  const dropdownRefB = useRef(null);
  const dropdownRefTarget = useRef(null);

  // Fetch breeding data on mount
  useEffect(() => {
    async function loadBreedingData() {
      try {
        const response = await fetch('/assets/pals/breeding_data.json');
        if (!response.ok) {
          throw new Error('Failed to load breeding database.');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error('Error loading breeding data:', err);
        setError('Could not load breeding combinations data. Please check connection.');
      } finally {
        setLoading(false);
      }
    }
    loadBreedingData();
  }, []);

  // Dropdown click-outside listeners
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRefA.current && !dropdownRefA.current.contains(event.target)) {
        setShowDropdownA(false);
      }
      if (dropdownRefB.current && !dropdownRefB.current.contains(event.target)) {
        setShowDropdownB(false);
      }
      if (dropdownRefTarget.current && !dropdownRefTarget.current.contains(event.target)) {
        setShowDropdownTarget(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Pal lists filtered by search strings
  const filteredPalsA = useMemo(() => {
    if (!data?.pals) return [];
    const query = searchA.toLowerCase();
    return data.pals.filter(p => p.name.toLowerCase().includes(query));
  }, [data, searchA]);

  const filteredPalsB = useMemo(() => {
    if (!data?.pals) return [];
    const query = searchB.toLowerCase();
    return data.pals.filter(p => p.name.toLowerCase().includes(query));
  }, [data, searchB]);

  const filteredTargetPals = useMemo(() => {
    if (!data?.pals) return [];
    const query = searchTarget.toLowerCase();
    return data.pals.filter(p => p.name.toLowerCase().includes(query));
  }, [data, searchTarget]);

  // Calculate offspring from Parent A + B
  const calculatedOffspring = useMemo(() => {
    if (!data || !parentA || !parentB) return null;
    const key = `${parentA} | ${parentB}`;
    return data.parentToOffspring[key] || null;
  }, [data, parentA, parentB]);

  // Get parent combinations for target Pal
  const parentCombinations = useMemo(() => {
    if (!data || !targetPal) return [];
    const combos = data.offspringToParents[targetPal] || [];
    if (!parentFilter) return combos;
    const query = parentFilter.toLowerCase();
    return combos.filter(pair => 
      pair[0].name.toLowerCase().includes(query) || 
      pair[1].name.toLowerCase().includes(query)
    );
  }, [data, targetPal, parentFilter]);

  const getPageTitle = () => "Palworld Breeding Calculator (1.0 Mutation Update) | Elite Gamer Insights";
  const getPageDescription = () => "Interactive Palworld 1.0 Breeding Calculator. Select parents to discover offspring, find all parent combinations for a target Pal, and explore the new 1.0 mutation system & exclusive passives.";

  const schemas = [
    generateWebPageSchema({
      name: getPageTitle(),
      description: getPageDescription(),
      url: `${SITE_URL}/palworld/palworld-breeding`
    }),
    generateBreadcrumbSchema({
      items: [
        { name: "Home", url: SITE_URL },
        { name: "Palworld Hub", url: `${SITE_URL}/palworld` },
        { name: "Breeding Calculator", url: `${SITE_URL}/palworld/palworld-breeding` }
      ]
    }),
    generateFAQPageSchema({
      questions: FAQS.map(faq => ({
        question: faq.q,
        answer: faq.a
      }))
    })
  ];

  if (loading) {
    return (
      <>
        <PageMetadata
          title={getPageTitle()}
          description={getPageDescription()}
          image="/palworld-breeding-og.png"
          imageAlt="Palworld Breeding Calculator Tool"
          imageWidth={1200}
          imageHeight={630}
          keywords="palworld breeding calculator, palworld breeding combos, palworld 1.0 breeding, palworld breeding mutation, passive skill inheritance"
        />
        <StructuredSchema schemas={schemas} />
        <div className="pt-[200px] p-4 container mx-auto text-center">
          <div className="animate-pulse max-w-xl mx-auto">
            <div className="h-12 bg-base-800 rounded-lg mb-4 w-3/4 mx-auto"></div>
            <div className="h-6 bg-base-800 rounded mb-8 w-1/2 mx-auto"></div>
            <div className="h-48 bg-base-800 rounded-2xl"></div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageMetadata
          title={getPageTitle()}
          description={getPageDescription()}
          image="/palworld-breeding-og.png"
          imageAlt="Palworld Breeding Calculator Tool"
          imageWidth={1200}
          imageHeight={630}
          keywords="palworld breeding calculator, palworld breeding combos, palworld 1.0 breeding, palworld breeding mutation, passive skill inheritance"
        />
        <StructuredSchema schemas={schemas} />
        <div className="pt-[200px] p-4 container mx-auto text-center text-white">
          <div className="max-w-md mx-auto bg-red-950/20 border border-red-500/20 p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Data</h2>
            <p className="text-base-400 mb-4">{error}</p>
            <Link to="/palworld" className="text-accent-pink-400 hover:underline">Return to Palworld Hub</Link>
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
        image="/palworld-breeding-og.png"
        imageAlt="Palworld Breeding Calculator Tool"
        imageWidth={1200}
        imageHeight={630}
        keywords="palworld breeding calculator, palworld breeding combos, palworld 1.0 breeding, palworld breeding mutation, passive skill inheritance"
      />
      <StructuredSchema schemas={schemas} />

      <div className="relative min-h-screen bg-base-950 text-white pt-24 pb-20 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-accent-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          
          {/* Breadcrumb Trail Navigation */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-base-400 mb-6 bg-base-950/20 px-4 py-2.5 rounded-xl border border-base-800/40 w-fit">
            <Link to="/" className="hover:text-accent-violet-300 transition-colors">Home</Link>
            <span className="opacity-40">/</span>
            <Link to="/palworld" className="hover:text-accent-violet-300 transition-colors">Palworld Hub</Link>
            <span className="opacity-40">/</span>
            <span className="text-gray-200">Breeding Calculator</span>
          </nav>

          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              Palworld Breeding <span className="bg-gradient-to-r from-violet-400 to-accent-pink-400 bg-clip-text text-transparent">Calculator</span>
            </h1>
            <p className="text-base md:text-lg text-base-300 max-w-2xl mx-auto">
              Calculate offspring from parents, search possible parent combinations for a target Pal, and discover the new Palworld 1.0 mutations and rainbow passives.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex justify-center mb-8">
            <div className="bg-base-900 border border-base-800 p-1 rounded-2xl flex">
              <button
                onClick={() => setMode('offspring')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  mode === 'offspring' 
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30' 
                    : 'text-base-400 hover:text-white'
                }`}
              >
                Breed Parents
              </button>
              <button
                onClick={() => setMode('parents')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  mode === 'parents' 
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30' 
                    : 'text-base-400 hover:text-white'
                }`}
              >
                Find Combinations
              </button>
            </div>
          </div>

          {/* Calculator Section */}
          <div className="bg-base-900/60 border border-base-800/80 backdrop-blur-md rounded-3xl p-6 md:p-8 mb-12">
            
            {/* Mode A: Parents -> Offspring */}
            {mode === 'offspring' && (
              <div>
                <h2 className="text-xl md:text-2xl font-black mb-6 text-center">Select Parents to Calculate Offspring</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
                  
                  {/* Parent A Input */}
                  <div className="relative" ref={dropdownRefA}>
                    <label className="block text-xs font-bold text-base-400 uppercase tracking-wider mb-2">Parent A</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search Parent A..."
                        value={searchA}
                        onChange={(e) => {
                          setSearchA(e.target.value);
                          setShowDropdownA(true);
                        }}
                        onFocus={() => setShowDropdownA(true)}
                        className="w-full bg-base-950/80 border border-base-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                      {parentA && (
                        <button 
                          onClick={() => { setParentA(''); setSearchA(''); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-base-500 hover:text-white"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {showDropdownA && filteredPalsA.length > 0 && (
                      <div className="absolute z-20 w-full mt-2 bg-base-900 border border-base-800 rounded-xl max-h-60 overflow-y-auto shadow-2xl">
                        {filteredPalsA.map(pal => (
                          <button
                            key={pal.id}
                            onClick={() => {
                              setParentA(pal.name);
                              setSearchA(pal.name);
                              setShowDropdownA(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-base-800/50 transition-colors flex items-center gap-3 border-b border-base-800/30 last:border-0"
                          >
                            {pal.image_url ? (
                              <img src={pal.image_url} alt={pal.name} className="w-8 h-8 rounded-lg object-contain bg-base-950 p-1" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-base-950 flex items-center justify-center text-xs font-bold">Pal</div>
                            )}
                            <div>
                              <div className="font-bold text-sm text-white">{pal.name}</div>
                              <div className="flex gap-1 mt-0.5">
                                {pal.element_types.map(elem => (
                                  <span key={elem} className="text-[10px] px-1.5 py-0.5 rounded bg-base-950 text-base-300 border border-base-800">{elem}</span>
                                ))}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Plus Icon / Indicator */}
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-base-950 border border-base-800 flex items-center justify-center text-xl font-bold text-violet-400">
                      +
                    </div>
                  </div>

                  {/* Parent B Input */}
                  <div className="relative" ref={dropdownRefB}>
                    <label className="block text-xs font-bold text-base-400 uppercase tracking-wider mb-2">Parent B</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search Parent B..."
                        value={searchB}
                        onChange={(e) => {
                          setSearchB(e.target.value);
                          setShowDropdownB(true);
                        }}
                        onFocus={() => setShowDropdownB(true)}
                        className="w-full bg-base-950/80 border border-base-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                      {parentB && (
                        <button 
                          onClick={() => { setParentB(''); setSearchB(''); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-base-500 hover:text-white"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {showDropdownB && filteredPalsB.length > 0 && (
                      <div className="absolute z-20 w-full mt-2 bg-base-900 border border-base-800 rounded-xl max-h-60 overflow-y-auto shadow-2xl">
                        {filteredPalsB.map(pal => (
                          <button
                            key={pal.id}
                            onClick={() => {
                              setParentB(pal.name);
                              setSearchB(pal.name);
                              setShowDropdownB(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-base-800/50 transition-colors flex items-center gap-3 border-b border-base-800/30 last:border-0"
                          >
                            {pal.image_url ? (
                              <img src={pal.image_url} alt={pal.name} className="w-8 h-8 rounded-lg object-contain bg-base-950 p-1" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-base-950 flex items-center justify-center text-xs font-bold">Pal</div>
                            )}
                            <div>
                              <div className="font-bold text-sm text-white">{pal.name}</div>
                              <div className="flex gap-1 mt-0.5">
                                {pal.element_types.map(elem => (
                                  <span key={elem} className="text-[10px] px-1.5 py-0.5 rounded bg-base-950 text-base-300 border border-base-800">{elem}</span>
                                ))}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Offspring Results */}
                <div className="mt-12 pt-8 border-t border-base-800 flex flex-col items-center justify-center">
                  {!parentA || !parentB ? (
                    <div className="text-center py-6 text-base-400 text-sm">
                      Select both parents to calculate the offspring Pal.
                    </div>
                  ) : calculatedOffspring ? (
                    <div className="text-center flex flex-col items-center">
                      <div className="text-xs uppercase tracking-widest text-accent-pink-400 font-bold mb-4">Breeding Result</div>
                      
                      {calculatedOffspring.image_url ? (
                        <img 
                          src={calculatedOffspring.image_url} 
                          alt={calculatedOffspring.name} 
                          className="w-28 h-28 object-contain p-2 bg-base-950/80 border border-violet-500/20 rounded-3xl mb-4 shadow-xl shadow-violet-500/10"
                        />
                      ) : (
                        <div className="w-28 h-28 bg-base-950 flex items-center justify-center text-lg font-bold border border-base-800 rounded-3xl mb-4 text-base-400">
                          Pal Icon
                        </div>
                      )}
                      
                      <Link 
                        to={`/palworld/pals/${encodeURIComponent(calculatedOffspring.name)}`}
                        className="text-2xl font-black hover:text-accent-pink-450 transition-colors"
                      >
                        {calculatedOffspring.name}
                      </Link>

                      <div className="flex gap-2 justify-center mt-3">
                        {calculatedOffspring.element_types?.map(elem => (
                          <span key={elem} className="text-xs px-2.5 py-1 rounded-full bg-base-950 text-base-300 border border-base-800 font-medium">
                            {elem}
                          </span>
                        ))}
                      </div>
                      
                      <Link 
                        to={`/palworld/pals/${encodeURIComponent(calculatedOffspring.name)}`}
                        className="mt-6 text-sm text-accent-pink-400 hover:text-accent-pink-300 font-semibold border-b border-accent-pink-400/30 hover:border-accent-pink-300 transition-colors"
                      >
                        View Full Stats & Weaknesses →
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center text-red-500 font-semibold py-4">
                      Sorry, this combination cannot breed or is invalid.
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Mode B: Offspring -> Parents list */}
            {mode === 'parents' && (
              <div>
                <h2 className="text-xl md:text-2xl font-black mb-6 text-center">Find All Breeding Combos for Target Pal</h2>
                
                <div className="max-w-lg mx-auto grid grid-cols-1 gap-6 mb-8">
                  {/* Target Selector */}
                  <div className="relative" ref={dropdownRefTarget}>
                    <label className="block text-xs font-bold text-base-400 uppercase tracking-wider mb-2">Target Pal</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search Target Pal..."
                        value={searchTarget}
                        onChange={(e) => {
                          setSearchTarget(e.target.value);
                          setShowDropdownTarget(true);
                        }}
                        onFocus={() => setShowDropdownTarget(true)}
                        className="w-full bg-base-950/80 border border-base-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                      {targetPal && (
                        <button 
                          onClick={() => { setTargetPal(''); setSearchTarget(''); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-base-500 hover:text-white"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {showDropdownTarget && filteredTargetPals.length > 0 && (
                      <div className="absolute z-20 w-full mt-2 bg-base-900 border border-base-800 rounded-xl max-h-60 overflow-y-auto shadow-2xl">
                        {filteredTargetPals.map(pal => (
                          <button
                            key={pal.id}
                            onClick={() => {
                              setTargetPal(pal.name);
                              setSearchTarget(pal.name);
                              setShowDropdownTarget(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-base-800/50 transition-colors flex items-center gap-3 border-b border-base-800/30 last:border-0"
                          >
                            {pal.image_url ? (
                              <img src={pal.image_url} alt={pal.name} className="w-8 h-8 rounded-lg object-contain bg-base-950 p-1" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-base-950 flex items-center justify-center text-xs font-bold">Pal</div>
                            )}
                            <div>
                              <div className="font-bold text-sm text-white">{pal.name}</div>
                              <div className="flex gap-1 mt-0.5">
                                {pal.element_types.map(elem => (
                                  <span key={elem} className="text-[10px] px-1.5 py-0.5 rounded bg-base-950 text-base-300 border border-base-800">{elem}</span>
                                ))}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Combos list */}
                {targetPal ? (
                  <div className="border-t border-base-800 pt-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          Found {parentCombinations.length} combinations for <span className="text-accent-pink-400">{targetPal}</span>
                        </h3>
                        <p className="text-xs text-base-400">Showing combinations that result in {targetPal}</p>
                      </div>

                      {/* Parent filter */}
                      <input
                        type="text"
                        placeholder="Filter parents by name..."
                        value={parentFilter}
                        onChange={(e) => setParentFilter(e.target.value)}
                        className="bg-base-950/80 border border-base-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-violet-500/50 transition-colors w-full sm:w-60"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                      {parentCombinations.map((pair, index) => {
                        const [p1, p2] = pair;
                        return (
                          <div 
                            key={index} 
                            className="bg-base-950/40 border border-base-850 p-4 rounded-2xl flex items-center justify-between gap-4"
                          >
                            <Link 
                              to={`/palworld/pals/${encodeURIComponent(p1.name)}`}
                              className="flex-1 text-center font-bold text-white hover:text-accent-pink-450 transition-colors hover:underline truncate"
                            >
                              {p1.name}
                            </Link>
                            <span className="text-base-500 font-bold text-sm flex-shrink-0">+</span>
                            <Link 
                              to={`/palworld/pals/${encodeURIComponent(p2.name)}`}
                              className="flex-1 text-center font-bold text-white hover:text-accent-pink-450 transition-colors hover:underline truncate"
                            >
                              {p2.name}
                            </Link>
                          </div>
                        );
                      })}
                      {parentCombinations.length === 0 && (
                        <div className="text-center py-8 text-sm text-base-500 col-span-2">
                          No parent combinations match "{parentFilter}".
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-base-800 pt-8 text-center text-sm text-base-400 py-6">
                    Select a target offspring Pal to search all parent options.
                  </div>
                )}

              </div>
            )}

          </div>

          {/* 1.0 Mutation Guide and Passive Inheritance Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            
            {/* Guide Info */}
            <div className="lg:col-span-7 bg-base-900/40 border border-base-800/80 rounded-3xl p-6 md:p-8">
              <h2 className="text-2xl font-black mb-4">Palworld 1.0 Breeding & Mutation Guide</h2>
              <p className="text-sm text-base-300 mb-4 leading-relaxed">
                Breeding in Palworld allows players to craft the ultimate team by inheriting stats and passing down passive skills. With the official 1.0 update, the breeding farm has been elevated with advanced cakes and the legendary **Mutation System**.
              </p>
              
              <h3 className="text-lg font-bold text-violet-400 mt-6 mb-2">Passive Skill Inheritance</h3>
              <p className="text-sm text-base-300 mb-4 leading-relaxed">
                Offspring inherit passive skills directly from their parents. The ultimate strategy for clean inheritance is to breed parents possessing only the specific desired passive skills (e.g., 2 passives on Parent A, 2 on Parent B). 
              </p>
              <div className="bg-base-950/80 border border-base-850 p-4 rounded-2xl mb-6">
                <span className="block text-xs font-bold text-accent-pink-450 uppercase mb-1">Inheritance Pro-Tip</span>
                <p className="text-xs text-base-400 leading-relaxed">
                  Bake and feed a <strong className="text-white">Special Cake</strong> at the breeding farm to increase the passive inheritance rate, ensuring your optimal combat or work traits carry over successfully.
                </p>
              </div>

              <h3 className="text-lg font-bold text-violet-400 mt-6 mb-2">The Mutation Overhaul</h3>
              <p className="text-sm text-base-300 leading-relaxed">
                By feeding your Pals an <strong className="text-white">Extravagant Vegetable Cake</strong>, you increase the base 1% mutation rate up to 3%. A mutated egg overrides the standard combination and hatches a pre-condensed Alpha Pal containing a unique, tier-exclusive passive skill.
              </p>
            </div>

            {/* Mutation-Exclusive Passives Table */}
            <div className="lg:col-span-5 bg-base-900/40 border border-base-800/80 rounded-3xl p-6 md:p-8 flex flex-col">
              <h2 className="text-xl font-black mb-2">Mutation Exclusive Passives</h2>
              <p className="text-xs text-base-400 mb-6">These Rainbow-tier passives are unlocked via random breeding mutations.</p>
              
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-base-800 text-xs font-bold uppercase tracking-wider text-base-400">
                      <th className="py-3 px-2">Passive Name</th>
                      <th className="py-3 px-2">Effects / Buffs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RAINBOW_PASSIVES.map((passive, idx) => (
                      <tr key={idx} className="border-b border-base-800/50 hover:bg-base-800/20 transition-colors">
                        <td className="py-3.5 px-2 font-bold text-white text-xs">{passive.name}</td>
                        <td className="py-3.5 px-2 text-base-300 text-xs">{passive.effect}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* FAQs Accordion */}
          <div className="mb-16">
            <FAQ 
              faqs={FAQS} 
              title="Breeding & Mutations FAQ" 
              subtitle=""
              accentColorClass="text-accent-pink-400"
            />
          </div>

          {/* Wiki-Style Navigation Footer */}
          <div className="border-t border-base-800 pt-10 text-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-base-500 mb-6">Palworld Hub Directory</h3>
            <div className="flex flex-wrap justify-center items-center gap-4 text-sm font-bold">
              <Link to="/palworld" className="px-5 py-2.5 rounded-xl bg-base-900 border border-base-800 hover:border-violet-500/50 transition-colors">
                Palworld Hub
              </Link>
              <Link to="/palworld/pals" className="px-5 py-2.5 rounded-xl bg-base-900 border border-base-800 hover:border-violet-500/50 transition-colors">
                Paldex Directory
              </Link>
              <Link to="/palworld/tech" className="px-5 py-2.5 rounded-xl bg-base-900 border border-base-800 hover:border-violet-500/50 transition-colors">
                Technology Tree
              </Link>
              <Link to="/palworld/bingo" className="px-5 py-2.5 rounded-xl bg-base-900 border border-base-800 hover:border-violet-500/50 transition-colors">
                Seeded Bingo
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
