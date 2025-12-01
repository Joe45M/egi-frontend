import { useState, useEffect } from 'react';
import PageMetadata from '../components/PageMetadata';

function DownloadSpeedCalculator() {
  const [fileSize, setFileSize] = useState('');
  const [fileSizeUnit, setFileSizeUnit] = useState('GB');
  const [downloadSpeed, setDownloadSpeed] = useState('');
  const [speedUnit, setSpeedUnit] = useState('Mbps');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Calculate download time
  useEffect(() => {
    if (fileSize && downloadSpeed && parseFloat(fileSize) > 0 && parseFloat(downloadSpeed) > 0) {
      setError('');
      
      // Convert file size to MB
      let fileSizeMB;
      switch (fileSizeUnit) {
        case 'GB':
          fileSizeMB = parseFloat(fileSize) * 1024;
          break;
        case 'MB':
          fileSizeMB = parseFloat(fileSize);
          break;
        case 'KB':
          fileSizeMB = parseFloat(fileSize) / 1024;
          break;
        default:
          fileSizeMB = parseFloat(fileSize) * 1024;
      }

      // Convert speed to MB/s
      let speedMBps;
      switch (speedUnit) {
        case 'Mbps':
          // Mbps to MB/s: divide by 8
          speedMBps = parseFloat(downloadSpeed) / 8;
          break;
        case 'MB/s':
          speedMBps = parseFloat(downloadSpeed);
          break;
        case 'KB/s':
          speedMBps = parseFloat(downloadSpeed) / 1024;
          break;
        default:
          speedMBps = parseFloat(downloadSpeed) / 8;
      }

      if (speedMBps > 0) {
        const timeInSeconds = fileSizeMB / speedMBps;
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = Math.floor(timeInSeconds % 60);

        setResult({
          totalSeconds: timeInSeconds,
          hours,
          minutes,
          seconds,
          formatted: formatTime(hours, minutes, seconds)
        });
      } else {
        setError('Download speed must be greater than 0');
        setResult(null);
      }
    } else {
      setResult(null);
    }
  }, [fileSize, fileSizeUnit, downloadSpeed, speedUnit]);

  const formatTime = (hours, minutes, seconds) => {
    const parts = [];
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
    return parts.join(', ');
  };

  const handleQuickFill = (speed) => {
    setDownloadSpeed(speed.toString());
    setSpeedUnit('Mbps');
  };

  return (
    <>
      <PageMetadata
        title="Game Download Speed Calculator"
        description="Calculate how long it will take to download your games, patches, and updates. Maximize your gaming experience and never let slow downloads disrupt your gaming again."
        keywords="download speed calculator, game download time, download calculator, internet speed, gaming downloads"
      />
      <div className="min-h-screen py-20 pt-[175px] px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-accent-violet-400 to-accent-pink-400 bg-clip-text text-transparent">
            Game Download Speed Calculator
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Calculate how long it will take to download your games, patches, and updates. 
            Maximize your gaming experience and never let slow downloads disrupt your gaming again.
          </p>
        </div>

        {/* Calculator Card */}
        <div className="bg-base-800/50 backdrop-blur-xl rounded-2xl border border-gray-500/20 p-8 md:p-10 shadow-2xl mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* File Size Input */}
            <div>
              <label className="block text-white font-semibold mb-2 text-sm">
                File Size
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  placeholder="e.g., 50"
                  className="flex-1 px-4 py-3 bg-base-900/50 border border-gray-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:border-transparent transition-all"
                  min="0"
                  step="0.01"
                />
                <select
                  value={fileSizeUnit}
                  onChange={(e) => setFileSizeUnit(e.target.value)}
                  className="px-4 py-3 bg-base-900/50 border border-gray-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:border-transparent transition-all"
                >
                  <option value="GB">GB</option>
                  <option value="MB">MB</option>
                  <option value="KB">KB</option>
                </select>
              </div>
            </div>

            {/* Download Speed Input */}
            <div>
              <label className="block text-white font-semibold mb-2 text-sm">
                Download Speed
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={downloadSpeed}
                  onChange={(e) => setDownloadSpeed(e.target.value)}
                  placeholder="e.g., 180"
                  className="flex-1 px-4 py-3 bg-base-900/50 border border-gray-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:border-transparent transition-all"
                  min="0"
                  step="0.01"
                />
                <select
                  value={speedUnit}
                  onChange={(e) => setSpeedUnit(e.target.value)}
                  className="px-4 py-3 bg-base-900/50 border border-gray-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:border-transparent transition-all"
                >
                  <option value="Mbps">Mbps</option>
                  <option value="MB/s">MB/s</option>
                  <option value="KB/s">KB/s</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Fill Buttons */}
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-3">Quick fill with average speeds:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickFill(50)}
                className="px-4 py-2 bg-base-900/50 hover:bg-base-900 border border-gray-500/30 rounded-lg text-gray-300 hover:text-white transition-all text-sm"
              >
                50 Mbps
              </button>
              <button
                onClick={() => handleQuickFill(100)}
                className="px-4 py-2 bg-base-900/50 hover:bg-base-900 border border-gray-500/30 rounded-lg text-gray-300 hover:text-white transition-all text-sm"
              >
                100 Mbps
              </button>
              <button
                onClick={() => handleQuickFill(180)}
                className="px-4 py-2 bg-base-900/50 hover:bg-base-900 border border-gray-500/30 rounded-lg text-gray-300 hover:text-white transition-all text-sm"
              >
                180 Mbps (Avg USA)
              </button>
              <button
                onClick={() => handleQuickFill(500)}
                className="px-4 py-2 bg-base-900/50 hover:bg-base-900 border border-gray-500/30 rounded-lg text-gray-300 hover:text-white transition-all text-sm"
              >
                500 Mbps
              </button>
              <button
                onClick={() => handleQuickFill(1000)}
                className="px-4 py-2 bg-base-900/50 hover:bg-base-900 border border-gray-500/30 rounded-lg text-gray-300 hover:text-white transition-all text-sm"
              >
                1 Gbps
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="bg-gradient-to-br from-accent-violet-500/20 to-accent-pink-500/20 border border-accent-violet-500/30 rounded-xl p-6 md:p-8">
              <h3 className="text-white font-semibold mb-4 text-lg">Estimated Download Time</h3>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent-violet-300 to-accent-pink-300 bg-clip-text text-transparent mb-2">
                {result.formatted}
              </div>
              <div className="text-gray-400 text-sm mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500">Total time:</span>
                    <span className="ml-2 text-white">{Math.floor(result.totalSeconds)} seconds</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Speed:</span>
                    <span className="ml-2 text-white">
                      {speedUnit === 'Mbps' 
                        ? `${downloadSpeed} Mbps (${(parseFloat(downloadSpeed) / 8).toFixed(2)} MB/s)`
                        : speedUnit === 'MB/s'
                        ? `${downloadSpeed} MB/s (${(parseFloat(downloadSpeed) * 8).toFixed(2)} Mbps)`
                        : `${downloadSpeed} KB/s`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-base-800/50 backdrop-blur-xl rounded-xl border border-gray-500/20 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Average Internet Download Speeds</h2>
            <p className="text-gray-400 mb-4">
              As of September 2021, the average internet download speed in the USA was approximately <strong className="text-white">180 Mbps</strong> (megabits per second), according to Speedtest.net.
            </p>
            <p className="text-gray-400">
              However, download speeds can vary widely based on your location, service provider, and connection type (fiber, cable, DSL, or satellite).
            </p>
          </div>

          <div className="bg-base-800/50 backdrop-blur-xl rounded-xl border border-gray-500/20 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Understanding Speed Units</h2>
            <ul className="space-y-2 text-gray-400">
              <li>
                <strong className="text-white">Mbps</strong> (Megabits per second) - Most common unit for internet speeds
              </li>
              <li>
                <strong className="text-white">MB/s</strong> (Megabytes per second) - 1 MB/s = 8 Mbps
              </li>
              <li>
                <strong className="text-white">KB/s</strong> (Kilobytes per second) - Slower speeds
              </li>
            </ul>
            <p className="text-gray-400 mt-4 text-sm">
              <strong className="text-white">Tip:</strong> Internet providers advertise speeds in Mbps, but file sizes are typically shown in GB or MB. Remember that 1 byte = 8 bits!
            </p>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-base-800/50 backdrop-blur-xl rounded-xl border border-gray-500/20 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Tips for Faster Downloads</h2>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-start gap-3">
              <span className="text-accent-violet-400 mt-1">•</span>
              <span>Use a wired connection instead of Wi-Fi for more stable speeds</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent-violet-400 mt-1">•</span>
              <span>Close other applications and downloads to maximize bandwidth</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent-violet-400 mt-1">•</span>
              <span>Schedule large downloads during off-peak hours for better speeds</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent-violet-400 mt-1">•</span>
              <span>Check your router placement and consider upgrading your internet plan</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent-violet-400 mt-1">•</span>
              <span>Use a download manager or game launcher's scheduling feature</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    </>
  );
}

export default DownloadSpeedCalculator;

