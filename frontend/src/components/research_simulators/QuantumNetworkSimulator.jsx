import { useState } from 'react'
import { Network, Send, Zap } from 'lucide-react'

export default function QuantumNetworkSimulator({ simulation }) {
  const [entangled, setEntangled] = useState(false)
  const [teleporting, setTeleporting] = useState(false)
  const [stateTransmitted, setStateTransmitted] = useState(false)

  const handleEntangle = () => {
    setEntangled(true)
    setStateTransmitted(false)
  }

  const handleTeleport = () => {
    if (!entangled) return
    setTeleporting(true)
    setTimeout(() => {
      setTeleporting(false)
      setEntangled(false)
      setStateTransmitted(true)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="section-heading">
        <p className="section-eyebrow" style={{ color: 'var(--accent)' }}>Quantum Networking</p>
        <h3 className="section-title">{simulation?.title || 'Quantum Teleportation Network'}</h3>
        <p className="section-subtitle text-sm md:text-base">
          {simulation?.description || 'Establish an entangled link between two remote nodes, then use it to faithfully teleport an unknown quantum state, destroying the link in the process.'}
        </p>
      </div>

      <div className="soft-panel p-5">
        <div className="flex items-center justify-between mb-8">
          <h4 className="font-bold text-lg flex items-center gap-2">
            <Network size={20} className="text-fuchsia-400" />
            Entanglement Distribution
          </h4>
          <span className={`font-mono text-xs px-3 py-1 rounded-full uppercase tracking-wider
            ${entangled ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/50' 
              : stateTransmitted ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
            {entangled ? 'Link Active' : stateTransmitted ? 'Transfer Complete' : 'Nodes Disconnected'}
          </span>
        </div>

        {/* Network Diagram */}
        <div className="relative h-40 flex items-center justify-between px-4 sm:px-12 bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden mb-8">
          {/* Node Alice */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-colors
              ${stateTransmitted ? 'bg-gray-800 text-gray-500' : 'bg-blue-600/20 text-blue-400 border-2 border-blue-500'}`}>
              {!stateTransmitted && <span className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 rounded-full animate-pulse blur-[2px]"></span>}
              Alice
            </div>
            <span className="text-xs font-mono text-gray-400">{stateTransmitted ? 'Classical' : '|ψ⟩'}</span>
          </div>

          {/* Connection Channel */}
          <div className="flex-1 relative mx-4">
            <div className={`h-1 w-full bg-gray-800 relative overflow-hidden rounded-full`}>
               {entangled && !teleporting && (
                  <div className="absolute inset-0 bg-fuchsia-500/40 w-full animate-pulse"></div>
               )}
               {teleporting && (
                  <div className="absolute h-full w-1/3 bg-yellow-400 blur-[4px] shadow-[0_0_15px_#facc15]
                    animate-[slideRight_1.5s_ease-in-out_forwards]">
                  </div>
               )}
            </div>
            {entangled && !teleporting && (
              <p className="absolute -top-6 w-full text-center text-xs text-fuchsia-400 font-mono tracking-widest animate-pulse">
                ~ EPR PAIR SHARED ~
              </p>
            )}
            {teleporting && (
              <p className="absolute -bottom-6 w-full text-center text-xs text-yellow-400 font-mono">
                Transmitting Classical Bits & Teleporting State...
              </p>
            )}
          </div>

          {/* Node Bob */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-colors
              ${stateTransmitted ? 'bg-green-600/20 text-green-400 border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'bg-gray-800 text-gray-500 border-2 border-gray-700'}`}>
              {stateTransmitted && <span className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 rounded-full blur-[2px]"></span>}
              Bob
            </div>
            <span className="text-xs font-mono text-gray-400">{stateTransmitted ? '|ψ⟩' : 'Waiting'}</span>
          </div>

          {/* Inline keyframes for animation */}
          <style>{`
            @keyframes slideRight {
              0% { left: 0%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { left: 100%; opacity: 0; }
            }
          `}</style>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleEntangle}
            disabled={entangled || teleporting}
            className={`flex-1 rounded-lg py-3 flex items-center justify-center gap-2 font-medium transition-colors
              ${(!entangled && !teleporting) ? 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}
          >
            <Zap size={18} />
            Generate Entanglement
          </button>
          
          <button
            onClick={handleTeleport}
            disabled={!entangled || teleporting}
            className={`flex-1 rounded-lg py-3 flex items-center justify-center gap-2 font-medium transition-colors
              ${(entangled && !teleporting) ? 'bg-[var(--accent)] text-[var(--text-inverse)] shadow-[var(--accent-shadow)] hover:opacity-90' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}
          >
            <Send size={18} />
            Teleport State
          </button>
        </div>
        
        {stateTransmitted && (
           <div className="mt-4 text-center">
             <button onClick={() => { setEntangled(false); setStateTransmitted(false) }} className="text-sm text-gray-400 hover:text-white underline underline-offset-4">Reset Network</button>
           </div>
        )}
      </div>
    </div>
  )
}
