import { useState, useCallback } from 'react'
import { ShieldCheck, BugPlay } from 'lucide-react'

export default function FaultTolerantSimulator({ simulation }) {
  const [noiseLevel, setNoiseLevel] = useState(10)
  const [grid, setGrid] = useState(Array(9).fill({ error: false, corrected: false }))

  const injectErrors = useCallback(() => {
    const newGrid = grid.map(() => {
      const isError = Math.random() < (noiseLevel / 100)
      return { error: isError, corrected: false }
    })
    setGrid(newGrid)
  }, [noiseLevel, grid])

  const correctErrors = useCallback(() => {
    const newGrid = grid.map(cell => {
      if (cell.error) return { error: false, corrected: true }
      return cell
    })
    setGrid(newGrid)
  }, [grid])

  const errorCount = grid.filter(c => c.error).length

  return (
    <div className="space-y-6">
      <div className="section-heading">
        <p className="section-eyebrow" style={{ color: 'var(--accent)' }}>Fault Tolerant Computing</p>
        <h3 className="section-title">{simulation?.title || 'Surface Code Error Correction'}</h3>
        <p className="section-subtitle text-sm md:text-base">
          {simulation?.description || 'Inject noise into a grid of physical qubits. Watch how measurement syndromes detect errors and the decoder corrects them to protect the logical information.'}
        </p>
      </div>

      <div className="soft-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-lg flex items-center gap-2">
            Surface Code Patch
          </h4>
          <span className={`font-mono px-3 py-1 rounded-full text-sm border ${errorCount > 0 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
            {errorCount > 0 ? `${errorCount} Errors Detected` : 'Logical State Safe'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <div className="flex flex-col gap-6">
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
              <label className="text-sm font-semibold text-gray-300 mb-2 block">
                Noise Probability: {noiseLevel}%
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={injectErrors}
                className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white rounded-lg py-3 flex items-center justify-center gap-2 transition-colors"
              >
                <BugPlay size={18} className="text-orange-400" />
                Inject Noise
              </button>
              <button
                onClick={correctErrors}
                disabled={errorCount === 0}
                className={`flex-1 rounded-lg py-3 flex items-center justify-center gap-2 transition-colors font-medium
                  ${errorCount > 0 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-800'}`}
              >
                <ShieldCheck size={18} />
                Run Decoder
              </button>
            </div>

            <div className="text-sm text-gray-400 leading-relaxed bg-gray-800/40 p-4 rounded-lg">
              <p>Physical Error Rate (p) must remain below the <strong>fault-tolerance threshold</strong> (~1% for surface codes) for error correction to successfully scale.</p>
            </div>
          </div>

          <div className="flex justify-center items-center p-4 bg-gray-900/80 rounded-xl border border-gray-800">
            <div className="grid grid-cols-3 gap-3">
              {grid.map((cell, idx) => (
                <div 
                  key={idx}
                  className={`w-16 h-16 rounded-xl flex justify-center items-center text-xs font-mono transition-all duration-300
                    ${cell.error 
                      ? 'bg-red-500/20 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-110' 
                      : cell.corrected 
                        ? 'bg-emerald-500/20 border-2 border-emerald-500' 
                        : 'bg-gray-800 border border-gray-700'
                    }`}
                >
                  {cell.error ? 'ERR' : cell.corrected ? 'FIX' : 'Id'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
