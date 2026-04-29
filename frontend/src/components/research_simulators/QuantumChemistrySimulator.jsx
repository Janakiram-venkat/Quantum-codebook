import { useState } from 'react'
import { FlaskConical } from 'lucide-react'

export default function QuantumChemistrySimulator({ topic, simulation, theory }) {
  const [distance, setDistance] = useState(0.74) // Default H2 bond length
  
  // Fake Morse potential calculation for H2
  const D_e = 0.174 // depth
  const a = 1.94 // width
  const r_e = 0.74 // equilibrium distance
  const energy = D_e * Math.pow(1 - Math.exp(-a * (distance - r_e)), 2) - D_e
  
  return (
    <div className="space-y-6">
      <div className="section-heading">
        <p className="section-eyebrow" style={{ color: 'var(--accent)' }}>Quantum Chemistry</p>
        <h3 className="section-title">{simulation?.title || 'Molecular Ground State Estimator'}</h3>
        <p className="section-subtitle text-sm md:text-base">
          {simulation?.description || 'Adjust the interatomic distance of an H₂ molecule. The quantum simulator computes the ground state energy at each distance using VQE resulting in a potential energy surface.'}
        </p>
      </div>

      <div className="soft-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-lg flex items-center gap-2">
            <FlaskConical size={20} className="text-cyan-400" />
            H₂ Molecule Energy
          </h4>
          <span className="font-mono bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-sm">
            E = {energy.toFixed(4)} Hartree
          </span>
        </div>

        <div className="relative pt-6 pb-2">
          <input
            type="range"
            min="0.3"
            max="2.5"
            step="0.05"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2 font-mono">
            <span>R = 0.3 Å</span>
            <span className={distance === 0.74 ? 'text-cyan-400' : ''}>R = {distance.toFixed(2)} Å</span>
            <span>R = 2.5 Å</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 border border-gray-800 rounded-xl bg-gray-900/50 p-4 flex flex-col justify-center items-center min-h-[160px]">
            <h5 className="text-xs font-bold text-gray-500 mb-4 uppercase">Atomic Structure</h5>
            {/* H2 Visualizer */}
            <div className="relative w-full h-12 flex justify-center items-center opacity-80">
              <div 
                className="absolute w-6 h-6 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)]"
                style={{ transform: `translateX(-${Math.max(10, distance * 20)}px)` }}
              ></div>
              <div 
                className="absolute h-1 bg-cyan-900/50"
                style={{ 
                  width: `${Math.max(0, distance * 40 - 12)}px`,
                  opacity: distance < 2.0 ? 1 : 0 
                }}
              ></div>
              <div 
                className="absolute w-6 h-6 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)]"
                style={{ transform: `translateX(${Math.max(10, distance * 20)}px)` }}
              ></div>
            </div>
          </div>
          
          <div className="md:col-span-2 border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50 p-4 relative min-h-[160px]">
            <h5 className="text-xs font-bold text-gray-500 mb-2 uppercase">Potential Energy Surface</h5>
            <div className="absolute inset-0 pt-8 px-4 pb-2">
              <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                {/* Axes */}
                <line x1="10" y1="90" x2="100" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="10" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="2 2" />
                
                {/* Minimum energy line */}
                <line x1="10" y1="80" x2="100" y2="80" stroke="rgba(34,211,238,0.3)" strokeWidth="1" strokeDasharray="4 4" />
                
                {/* The Morse curve approximation */}
                <path 
                  d="M 12 10 Q 15 80 20 80 T 100 20" 
                  fill="none" 
                  stroke="rgba(255,255,255,0.2)" 
                  strokeWidth="2" 
                />
                
                {/* Current point */}
                <circle 
                  cx={10 + ((distance - 0.3) / 2.2) * 90} 
                  cy={80 - ((energy + D_e) / D_e) * 70 + 70} 
                  r="4" 
                  fill="var(--accent)" 
                  style={{ transition: 'all 0.1s ease-out' }} 
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
