import { useState, useEffect, useRef } from 'react'
import { Play, RotateCcw, Shuffle, SlidersHorizontal, Settings2, Activity } from 'lucide-react'
import { generateAnsatz, getExpectedParamCount } from './vqa/ansatzGenerator'
import { computeCost } from './vqa/costFunction'
import { optimizerStep } from './vqa/optimizer'
import VisualizationPanel from './vqa/VisualizationPanel'
import CircuitRenderer from '../CircuitRenderer'

export default function VQASimulator() {
  // A. Circuit Controls
  const [numQubits, setNumQubits] = useState(2)
  const [depth, setDepth] = useState(2)
  const [ansatzLayerArray, setAnsatzLayerArray] = useState([])
  
  // Custom Circuit rendering
  const loadAnsatzCircuit = () => {
     const { operations } = generateAnsatz(numQubits, depth, params)
     setAnsatzLayerArray(operations)
  }

  // B. Parameter Panel
  const expectParamsCount = getExpectedParamCount(numQubits, depth)
  const [params, setParams] = useState(Array(expectParamsCount).fill(0.0))

  const randomizeParams = () => {
    setParams(Array.from({length: expectParamsCount}, () => (Math.random() * 2 * Math.PI) - Math.PI))
  }

  useEffect(() => {
    // When qubits/depth changes, adjust parameter array and re-generate the circuit display
    const newCount = getExpectedParamCount(numQubits, depth)
    setParams(prev => {
       const next = [...prev]
       while(next.length < newCount) next.push(0.0)
       return next.slice(0, newCount)
    })
  }, [numQubits, depth])

  useEffect(() => {
     loadAnsatzCircuit()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, numQubits, depth])

  // C. Optimization Controls
  const [hamiltonian, setHamiltonian] = useState('Z0+Z1')
  const [learningRate, setLearningRate] = useState(0.2)
  const [maxIterations, setMaxIterations] = useState(30) // Set lower initially to avoid overwhelming backend timeout
  const [iteration, setIteration] = useState(0)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [costHistory, setCostHistory] = useState([])

  const optimizingRef = useRef(false)

  const stopOptimization = () => {
     optimizingRef.current = false
     setIsOptimizing(false)
  }

  const runHybridLoop = async () => {
    if (isOptimizing) return stopOptimization()

    setIsOptimizing(true)
    optimizingRef.current = true
    setIteration(0)
    
    // First, clear history and get initial cost
    const initialCost = await computeCost(params, numQubits, depth, hamiltonian)
    setCostHistory([initialCost])
    
    let currentParams = [...params]

    for (let i = 1; i <= maxIterations; i++) {
       if (!optimizingRef.current) break

       // Single Gradient Descent Step
       const { newParams, baseCost } = await optimizerStep(currentParams, numQubits, depth, hamiltonian, learningRate)
       
       currentParams = newParams
       setParams(currentParams) // Update UI parameters
       setIteration(i)
       setCostHistory(prev => [...prev, baseCost]) // Record cost

       // Update circuit visually with new params
       loadAnsatzCircuit()
    }

    setIsOptimizing(false)
    optimizingRef.current = false
  }

  const resetVQA = () => {
    stopOptimization()
    setCostHistory([])
    setIteration(0)
    setParams(Array(getExpectedParamCount(numQubits, depth)).fill(0.0))
  }

  return (
    <div className="space-y-6">
      <div className="section-heading">
        <p className="section-eyebrow" style={{ color: 'var(--accent)' }}>Advanced Simulator</p>
        <h3 className="section-title">Variational Quantum Algorithms</h3>
        <p className="section-subtitle text-sm md:text-base">
          Build a parameterized pure-state Ansatz. A classical optimizer handles gradient descent via multiple API calls to the Python simulator, adjusting angles iteratively to tune toward the minimal energy expectation (Cost Function).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Controls & Parameters */}
        <div className="space-y-6">
           
           {/* Section A: Circuit Controls */}
           <div className="soft-panel p-5 border border-gray-800">
             <div className="flex items-center gap-2 mb-4 text-gray-300">
               <SlidersHorizontal size={18} />
               <h4 className="font-bold text-lg">A. Ansatz Architecture</h4>
             </div>
             
             <div className="space-y-4">
                <div>
                   <label className="text-xs font-semibold text-gray-400 block mb-1">Qubits (Width): {numQubits}</label>
                   <input type="range" min="1" max="4" value={numQubits} onChange={e => setNumQubits(Number(e.target.value))} className="w-full" disabled={isOptimizing} />
                </div>
                <div>
                   <label className="text-xs font-semibold text-gray-400 block mb-1">Layers (Depth): {depth}</label>
                   <input type="range" min="1" max="5" value={depth} onChange={e => setDepth(Number(e.target.value))} className="w-full" disabled={isOptimizing} />
                </div>
             </div>
           </div>

           {/* Section C: Optimization Configuration */}
           <div className="soft-panel p-5 border border-amber-900/30 bg-amber-900/5">
             <div className="flex items-center gap-2 mb-4 text-amber-500">
               <Settings2 size={18} />
               <h4 className="font-bold text-lg">C. Classical Optimizer</h4>
             </div>
             
             <div className="space-y-4">
                <div>
                   <label className="text-xs font-semibold text-amber-500/70 block mb-1">Observable (Hamiltonian)</label>
                   <select value={hamiltonian} onChange={e => setHamiltonian(e.target.value)} disabled={isOptimizing} className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-sm text-gray-300">
                      <option value="Z0">Local Z0</option>
                      <option value="Z0+Z1" disabled={numQubits < 2}>Z0 + Z1</option>
                      <option value="Ising" disabled={numQubits < 2}>Simple ZZ Ising</option>
                   </select>
                </div>
                <div>
                   <label className="text-xs font-semibold text-amber-500/70 block mb-1">Learning Rate (α): {learningRate}</label>
                   <input type="range" min="0.01" max="1.0" step="0.01" value={learningRate} onChange={e => setLearningRate(Number(e.target.value))} className="w-full" disabled={isOptimizing} />
                </div>
                <div>
                   <label className="text-xs font-semibold text-amber-500/70 block mb-1">Max Iterations: {maxIterations}</label>
                   <input type="range" min="10" max="100" step="10" value={maxIterations} onChange={e => setMaxIterations(Number(e.target.value))} className="w-full" disabled={isOptimizing} />
                </div>
             </div>
           </div>

           {/* Section B: Parameter Matrix Viewer */}
           <div className="soft-panel p-5 border border-indigo-900/30 bg-indigo-900/5">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2 text-indigo-400">
                   <Activity size={18} />
                   <h4 className="font-bold text-lg">B. Parameters ($\theta$)</h4>
                 </div>
                 <button onClick={randomizeParams} disabled={isOptimizing} className="text-xs bg-indigo-900/50 hover:bg-indigo-800 text-indigo-200 px-3 py-1 rounded transition-colors flex items-center gap-1">
                   <Shuffle size={12}/> Randomize
                 </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                 {params.map((p, idx) => (
                    <div key={idx} className="bg-gray-900 rounded border border-gray-800 px-2 py-1 flex items-center justify-between">
                       <span className="text-[10px] text-gray-500 font-mono">θ{idx}</span>
                       <span className="text-xs font-mono text-gray-300">{p.toFixed(2)}</span>
                    </div>
                 ))}
              </div>
           </div>

        </div>

        {/* RIGHT COLUMN: Visuals */}
        <div className="space-y-6">

           {/* Main Control Strip */}
           <div className="soft-panel p-4 flex items-center justify-between border-b-2 border-[var(--accent)] bg-gray-900/30">
              <div className="flex flex-col">
                 <span className="text-xs text-gray-500 font-mono tracking-widest uppercase">Hybrid Loop Status</span>
                 <span className={`font-medium ${isOptimizing ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isOptimizing ? `Iterating... ${iteration}/${maxIterations}` : iteration === 0 ? 'Ready to Start' : 'Optimization Complete'}
                 </span>
              </div>
              <div className="flex gap-2">
                 {iteration > 0 && !isOptimizing && (
                    <button onClick={resetVQA} className="text-gray-400 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors border border-gray-700">
                       <RotateCcw size={16}/> Reset
                    </button>
                 )}
                 <button onClick={runHybridLoop} className={`px-5 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors
                    ${isOptimizing ? 'bg-red-500/20 text-red-400 cursor-pointer hover:bg-red-500/30 border border-red-500/50' : 'bg-[var(--accent)] text-white shadow-[var(--accent-shadow)] hover:opacity-90'}
                 `}>
                    {isOptimizing ? <><RotateCcw size={16}/> Stop Loop</> : <><Play size={16}/> Run Optimizer</>}
                 </button>
              </div>
           </div>

           {/* Section D: Cost Convergence */}
           <div className="soft-panel p-5">
              <VisualizationPanel history={costHistory} isOptimizing={isOptimizing} />
           </div>

           {/* Circuit Diagram preview */}
           <div className="soft-panel p-5" style={{ minHeight: '200px' }}>
              <p className="section-eyebrow mb-4">Live Ansatz preview</p>
              {ansatzLayerArray.length > 0 ? (
                 <div className="scale-90 transform origin-top-left -ml-4">
                    <CircuitRenderer operations={ansatzLayerArray} initialState={"|0⟩".repeat(numQubits)} activeStep={null} />
                 </div>
              ) : (
                 <p className="text-gray-500 text-sm">No circuit configured.</p>
              )}
           </div>

        </div>
      </div>
    </div>
  )
}
