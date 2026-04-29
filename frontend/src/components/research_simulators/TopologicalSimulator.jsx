import { useState } from 'react'
import { GitCommit, History } from 'lucide-react'

export default function TopologicalSimulator({ topic, simulation, theory }) {
  const [braidPath, setBraidPath] = useState([])
  const [isBraiding, setIsBraiding] = useState(false)

  const handleBraid = (point) => {
    setIsBraiding(true)
    setBraidPath(prev => [...prev, point])
    setTimeout(() => setIsBraiding(false), 500)
  }

  const reset = () => setBraidPath([])

  // Basic representation of logical operations based on braid length/complexity
  const getLogicalState = () => {
    const len = braidPath.length
    if (len === 0) return '|0⟩_L'
    if (len % 4 === 1) return '(|0⟩_L + |1⟩_L)/√2'
    if (len % 4 === 2) return '|1⟩_L'
    if (len % 4 === 3) return '(|0⟩_L - |1⟩_L)/√2'
    return '|0⟩_L'
  }

  return (
    <div className="space-y-6">
      <div className="section-heading">
        <p className="section-eyebrow" style={{ color: 'var(--accent)' }}>Topological Quantum Computing</p>
        <h3 className="section-title">{simulation?.title || 'Anyon Braider'}</h3>
        <p className="section-subtitle text-sm md:text-base">
          {simulation?.description || 'Click the anyon positions to braid their world-lines. Notice how the logical state of the topological qubit changes based only on the topology of the braids, making it highly robust to local errors.'}
        </p>
      </div>

      <div className="soft-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-lg">Logical Qubit State</h4>
          <div className="flex items-center gap-3">
            <span className="font-mono bg-teal-500/10 text-teal-400 px-3 py-1 rounded-full text-lg border border-teal-500/20">
              {getLogicalState()}
            </span>
            {braidPath.length > 0 && (
              <button 
                onClick={reset}
                className="text-gray-400 hover:text-white transition-colors"
                title="Reset Braids"
              >
                <History size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50 p-8 relative flex justify-center items-center h-64">
          {/* Anyon Grid */}
          <div className="flex gap-12 relative z-10">
            {[0, 1, 2].map(id => (
              <div key={id} className="flex flex-col items-center gap-2">
                <button
                  onClick={() => handleBraid(id)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all 
                    ${isBraiding ? 'scale-90 border-teal-600 bg-teal-900/50' : 'hover:scale-110 border-teal-500 bg-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.4)]'}`}
                >
                  <GitCommit className="text-teal-400" />
                </button>
                <span className="text-xs text-gray-500 font-mono">Anyon {id + 1}</span>
              </div>
            ))}
          </div>

          {/* Braid visualization overlay */}
          <div className="absolute inset-x-0 bottom-0 top-[60%] pointer-events-none flex justify-center opacity-50">
            <svg width="300" height="100" viewBox="0 0 300 100">
              {braidPath.map((point, idx) => {
                if (idx === 0) return null
                const prev = braidPath[idx - 1]
                // Simple visual abstraction of crossing lines
                return (
                  <path 
                    key={idx}
                    d={`M ${prev * 100 + 50} 0 Q ${prev * 100 + 50} 50 ${point * 100 + 50} 100`}
                    stroke="rgba(20,184,166,0.6)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                )
              })}
            </svg>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-gray-800/40 border border-gray-700/50">
          <p className="text-sm text-gray-300">
            <strong>Braid History:</strong> {braidPath.length === 0 ? 'None' : braidPath.map(p => `A${p+1}`).join(' → ')}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            In a real topological quantum computer, specific braiding sequences correspond to applying logical gates like Hadamard or CNOT.
          </p>
        </div>
      </div>
    </div>
  )
}
