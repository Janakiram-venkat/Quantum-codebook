import React from 'react';

export default function VisualizationPanel({ history, isOptimizing }) {
  if (history.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-500 text-sm border border-gray-800 rounded-lg bg-gray-900/50">
        Run optimization to see cost convergence graph
      </div>
    );
  }

  const padding = 20;
  const width = 400;
  const height = 200;
  
  const minCost = Math.min(...history) - 0.1;
  const maxCost = Math.max(...history) + 0.1;
  const rangeY = maxCost - minCost || 1;
  const rangeX = Math.max(history.length - 1, 1);

  const getX = (index) => padding + (index / rangeX) * (width - 2 * padding);
  const getY = (val) => height - padding - ((val - minCost) / rangeY) * (height - 2 * padding);

  const pathD = history.map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(val)}`).join(' ');

  const currentCost = history[history.length - 1];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex justify-betweentext-sm mb-2 px-2 items-center">
        <span className="text-gray-400 font-semibold text-xs tracking-wider uppercase">Cost vs Iteration</span>
        <span className={`font-mono text-sm ${isOptimizing ? 'text-yellow-400 animate-pulse' : 'text-emerald-400'}`}>
          Cost: {currentCost.toFixed(4)}
        </span>
      </div>
      
      <div className="w-full border border-gray-800 rounded-lg bg-gray-900/80 p-2 overflow-hidden shadow-inner">
         <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-md">
            {/* Axes */}
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#374151" strokeWidth="1" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#374151" strokeWidth="1" />
            
            {/* Expected Minimum Line Grid */}
            <line x1={padding} y1={getY(minCost + 0.1)} x2={width-padding} y2={getY(minCost + 0.1)} stroke="rgba(34,197,94,0.15)" strokeDasharray="3 3" />
            <text x={padding + 5} y={getY(minCost + 0.1) - 5} fill="rgba(34,197,94,0.5)" fontSize="8" fontFamily="monospace">Theoretical Min</text>

            {/* Trajectory */}
            <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Points */}
            {history.map((val, idx) => (
              <circle key={idx} cx={getX(idx)} cy={getY(val)} r="1.5" fill="white" />
            ))}
            
            {/* Current Point pulsing */}
            <circle cx={getX(history.length - 1)} cy={getY(currentCost)} r="3" fill="var(--accent)" className={isOptimizing ? "animate-ping" : ""} />
            <circle cx={getX(history.length - 1)} cy={getY(currentCost)} r="3" fill="var(--accent)" />
         </svg>
      </div>
    </div>
  );
}
