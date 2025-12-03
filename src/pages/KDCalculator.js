import { useState, useMemo } from 'react';
import PageMetadata from '../components/PageMetadata';

function KDCalculator() {
  const [kills, setKills] = useState('');
  const [deaths, setDeaths] = useState('');
  const [assists, setAssists] = useState('');
  const [targetKD, setTargetKD] = useState('');

  const parsed = useMemo(() => {
    const k = parseFloat(kills || '0');
    const d = parseFloat(deaths || '0');
    const a = parseFloat(assists || '0');
    const t = parseFloat(targetKD || '0');

    return {
      kills: isNaN(k) ? 0 : k,
      deaths: isNaN(d) ? 0 : d,
      assists: isNaN(a) ? 0 : a,
      targetKD: isNaN(t) ? 0 : t,
    };
  }, [kills, deaths, assists, targetKD]);

  const hasInputs = kills !== '' || deaths !== '' || assists !== '';

  const kd = useMemo(() => {
    if (!hasInputs || parsed.deaths === 0) return null;
    return parsed.kills / parsed.deaths;
  }, [parsed, hasInputs]);

  const kda = useMemo(() => {
    if (!hasInputs || parsed.deaths === 0) return null;
    return (parsed.kills + parsed.assists) / parsed.deaths;
  }, [parsed, hasInputs]);

  const isPerfectGame = hasInputs && parsed.deaths === 0 && (parsed.kills > 0 || parsed.assists > 0);

  const extraKillsNeeded = useMemo(() => {
    if (!targetKD || parsed.deaths <= 0 || parsed.targetKD <= 0) return null;
    const requiredTotalKills = parsed.targetKD * parsed.deaths;
    const extra = requiredTotalKills - parsed.kills;
    if (extra <= 0) return 0;
    return extra;
  }, [parsed, targetKD]);

  return (
    <>
      <PageMetadata
        title="KD Calculator - Calculate Your Kill / Death Ratio"
        description="Use our KD Calculator to calculate your Kill / Death (K/D) and KDA ratios for games like Call of Duty. Track your performance and see how many more kills you need to reach your target K/D."
        keywords="kd calculator, k/d calculator, kill death ratio, kda calculator, call of duty kd, gaming stats"
      />
      <div className="min-h-screen py-20 pt-[175px] px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-accent-violet-400 to-accent-pink-400 bg-clip-text text-transparent">
              K/D Calculator
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Use our Kill / Death (K/D) and KDA calculator to track your performance in multiplayer games like Call of Duty.
              Enter your kills, deaths, and assists to see your ratios, or set a target K/D to find out how many more kills you need.
            </p>
          </div>

          {/* Calculator Card */}
          <div className="bg-base-800/50 backdrop-blur-xl rounded-2xl border border-gray-500/20 p-8 md:p-10 shadow-2xl mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Kills */}
              <div>
                <label className="block text-white font-semibold mb-2 text-sm">
                  Kills
                </label>
                <input
                  type="number"
                  value={kills}
                  onChange={(e) => setKills(e.target.value)}
                  placeholder="e.g., 10"
                  className="w-full px-4 py-3 bg-base-900/50 border border-gray-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:border-transparent transition-all"
                  min="0"
                  step="1"
                />
              </div>

              {/* Deaths */}
              <div>
                <label className="block text-white font-semibold mb-2 text-sm">
                  Deaths
                </label>
                <input
                  type="number"
                  value={deaths}
                  onChange={(e) => setDeaths(e.target.value)}
                  placeholder="e.g., 5"
                  className="w-full px-4 py-3 bg-base-900/50 border border-gray-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-pink-500 focus:border-transparent transition-all"
                  min="0"
                  step="1"
                />
              </div>

              {/* Assists */}
              <div>
                <label className="block text-white font-semibold mb-2 text-sm">
                  Assists <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  value={assists}
                  onChange={(e) => setAssists(e.target.value)}
                  placeholder="e.g., 3"
                  className="w-full px-4 py-3 bg-base-900/50 border border-gray-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:border-transparent transition-all"
                  min="0"
                  step="1"
                />
              </div>

              {/* Target KD */}
              <div>
                <label className="block text-white font-semibold mb-2 text-sm">
                  Target K/D <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  value={targetKD}
                  onChange={(e) => setTargetKD(e.target.value)}
                  placeholder="e.g., 2.0"
                  className="w-full px-4 py-3 bg-base-900/50 border border-gray-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-pink-500 focus:border-transparent transition-all"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Result Display */}
            {(hasInputs || targetKD) && (
              <div className="bg-gradient-to-br from-accent-violet-500/20 to-accent-pink-500/20 border border-accent-violet-500/30 rounded-xl p-6 md:p-8">
                <h3 className="text-white font-semibold mb-4 text-lg">Your Stats</h3>

                {isPerfectGame && (
                  <div className="mb-4 text-sm text-accent-violet-200">
                    You recorded zero deaths this game – that&apos;s a perfect match!
                    K/D is technically infinite when you never die.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">K/D Ratio</div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-accent-violet-300 to-accent-pink-300 bg-clip-text text-transparent">
                      {kd !== null
                        ? kd.toFixed(2)
                        : isPerfectGame
                        ? '∞'
                        : '--'}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Calculated as <span className="text-white font-semibold">kills ÷ deaths</span>.
                    </p>
                  </div>

                  <div>
                    <div className="text-gray-400 text-sm mb-1">KDA Ratio</div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-accent-violet-300 to-accent-pink-300 bg-clip-text text-transparent">
                      {kda !== null
                        ? kda.toFixed(2)
                        : isPerfectGame
                        ? '∞'
                        : '--'}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Calculated as <span className="text-white font-semibold">(kills + assists) ÷ deaths</span>.
                    </p>
                  </div>

                  <div>
                    <div className="text-gray-400 text-sm mb-1">Target K/D Progress</div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-accent-violet-300 to-accent-pink-300 bg-clip-text text-transparent">
                      {extraKillsNeeded === null
                        ? '--'
                        : extraKillsNeeded === 0
                        ? 'Achieved'
                        : `+${Math.ceil(extraKillsNeeded)} kills`}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {extraKillsNeeded === null && (
                        <>Enter a target K/D plus your kills and deaths to see how many more kills you need.</>
                      )}
                      {extraKillsNeeded === 0 && parsed.targetKD > 0 && (
                        <>You&apos;ve already reached or exceeded your target K/D this game.</>
                      )}
                      {extraKillsNeeded > 0 && (
                        <>
                          You need approximately{' '}
                          <span className="text-white font-semibold">
                            {Math.ceil(extraKillsNeeded)} more kill
                            {Math.ceil(extraKillsNeeded) !== 1 ? 's' : ''}
                          </span>{' '}
                          (without adding deaths) to reach a K/D of{' '}
                          <span className="text-white font-semibold">
                            {parsed.targetKD.toFixed(2)}
                          </span>
                          .
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-base-800/50 backdrop-blur-xl rounded-xl border border-gray-500/20 p-6">
              <h2 className="text-xl font-bold text-white mb-4">What is K/D ratio?</h2>
              <p className="text-gray-400 mb-4">
                Your Kill / Death (K/D) ratio is calculated by dividing your total kills by your total deaths. For example,
                if you get <span className="text-white font-semibold">10 kills</span> and{' '}
                <span className="text-white font-semibold">5 deaths</span> in a match, your K/D would be{' '}
                <span className="text-white font-semibold">2.0</span>.
              </p>
              <p className="text-gray-400">
                A K/D of <span className="text-white font-semibold">1.0</span> means you get one kill for every death.
                Higher K/D ratios usually indicate stronger fragging performance, especially in shooters like Call of Duty.
              </p>
            </div>

            <div className="bg-base-800/50 backdrop-blur-xl rounded-xl border border-gray-500/20 p-6">
              <h2 className="text-xl font-bold text-white mb-4">What&apos;s the difference between K/D and KDA?</h2>
              <p className="text-gray-400 mb-3">
                K/D only looks at kills and deaths, but many modern shooters and MOBAs reward team play. That&apos;s where
                KDA comes in – it uses the formula{' '}
                <span className="text-white font-semibold">(kills + assists) ÷ deaths</span>.
              </p>
              <p className="text-gray-400">
                Because it includes assists, KDA usually ends up higher than your pure K/D. If you play a supportive role,
                your KDA is often a much better indicator of how much you&apos;re helping your team win
                than raw kills alone. Learn more on our original{' '}
                <a
                  href="https://api.elitegamerinsights.com/k-d-calculator-calculate-your-kill-death-ratio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-pink-300 hover:text-accent-pink-200 underline"
                >
                  K/D Calculator guide
                </a>
                .
              </p>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-base-800/50 backdrop-blur-xl rounded-xl border border-gray-500/20 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Are K/D ratios important?</h2>
            <p className="text-gray-400 mb-3">
              In the grand scheme of things, your K/D isn&apos;t everything – what really matters is whether you&apos;re
              having fun. But if you&apos;re a competitive player, tracking your K/D and KDA is a great way to understand
              how well you&apos;re performing from match to match.
            </p>
            <p className="text-gray-400">
              Use this calculator after each session to spot trends in your gameplay. If your K/D is dropping, it might be
              time to adjust your loadouts, positioning, or playstyle. If it&apos;s climbing, you&apos;re on the right
              track – keep grinding.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default KDCalculator;


