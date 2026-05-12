import { useState, useEffect } from 'react'
import { BrainCircuit, Play } from 'lucide-react'

export default function QMLSimulator({ simulation }) {
  const [running, setRunning] = useState(false)
  const [epoch, setEpoch] = useState(0)
  const [loss, setLoss] = useState(1.0)
  const [accuracy, setAccuracy] = useState(0.4)
  
  useEffect(() => {
    let timer
    if (running && epoch < 20) {
      timer = setTimeout(() => {
        setEpoch(e => e + 1)
        setLoss(l => Math.max(0.05, l * 0.85)) // Decay loss
        setAccuracy(a => Math.min(0.98, a + (0.98 - a) * 0.2)) // Increase accuracy towards 98%
      }, 300)
    } else if (epoch >= 20) {
      setRunning(false)
    }
    return () => clearTimeout(timer)
  }, [running, epoch])

  const reset = () => {
    setRunning(false)
    setEpoch(0)
    setLoss(1.0)
    setAccuracy(0.4)
  }

  return (
    <div className="space-y-6">
      <div className="section-heading">
        <p className="section-eyebrow" style={{ color: 'var(--accent)' }}>Quantum Machine Learning</p>
        <h3 className="section-title">{simulation?.title || 'Quantum Neural Network'}</h3>
        <p className="section-subtitle text-sm md:text-base">
          {simulation?.description || 'Train a variational quantum circuit to classify 2D data. The classical optimization loop updates the quantum circuit parameters (weights).'}
        </p>
      </div>

      <div className="soft-panel p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (epoch >= 20) reset()
                setRunning(!running)
              }}
              style={{
                background: running ? 'var(--surface-soft)' : 'var(--accent)',
                color: running ? 'var(--text-primary)' : 'var(--text-inverse)',
                border: `1px solid ${running ? 'var(--border)' : 'var(--accent)'}`,
                padding: '8px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600,
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
            >
              <Play size={16} /> {running ? 'Pause Training' : (epoch >= 20 ? 'Retrain' : 'Start Training')}
            </button>
            <span className="font-mono text-sm text-gray-400">
              Epoch: {epoch}/20
            </span>
          </div>
          
          <div className="flex gap-4 font-mono text-sm">
            <div className="bg-rose-500/10 text-rose-400 px-3 py-1 rounded border border-rose-500/20">
              Loss: {loss.toFixed(3)}
            </div>
            <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded border border-emerald-500/20">
              Accuracy: {(accuracy * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Classification boundary visualization */}
          <div className="border border-gray-800 rounded-xl bg-gray-900 p-4 aspect-square relative overflow-hidden flex flex-col">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Classification Decision Boundary</h5>
            <div className="flex-1 relative border border-gray-800 rounded" style={{
              background: `radial-gradient(circle at 50% 50%, rgba(59, 130, 246, ${accuracy * 0.4}) 0%, rgba(239, 68, 68, ${accuracy * 0.4}) ${100 - epoch * 2}%)`
            }}>
              {/* Fake scatter data */}
              <div className="absolute top-[30%] left-[30%] w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
              <div className="absolute top-[40%] left-[20%] w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
              <div className="absolute top-[25%] left-[45%] w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
              
              <div className="absolute top-[70%] left-[70%] w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
              <div className="absolute top-[60%] left-[80%] w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
              <div className="absolute top-[85%] left-[60%] w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
            </div>
          </div>

          <div className="border border-gray-800 rounded-xl bg-gray-900 p-4 relative overflow-hidden flex flex-col justify-center items-center">
            <BrainCircuit size={48} className={`mb-4 ${running ? 'text-indigo-400 animate-pulse' : 'text-gray-600'}`} />
            <div className="text-center">
              <h5 className="font-semibold text-white mb-2">Ansatz Circuit Weights</h5>
              <div className="flex justify-center gap-2 mb-4">
                <div className="w-8 h-8 rounded bg-indigo-900 flex items-center justify-center border border-indigo-700 text-xs font-mono">θ₁</div>
                <div className="w-8 h-8 rounded bg-indigo-900 flex items-center justify-center border border-indigo-700 text-xs font-mono">θ₂</div>
                <div className="w-8 h-8 rounded bg-indigo-900 flex items-center justify-center border border-indigo-700 text-xs font-mono">θ₃</div>
              </div>
              <p className="text-xs text-gray-400 max-w-[200px] mx-auto">
                {running ? 'Classical optimizer updating gradients...' : 'Ready to start training loop'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
