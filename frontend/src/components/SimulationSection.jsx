import MultiQubitSimulator from './MultiQubitSimulator'
import StandardCircuitSimulation from './StandardCircuitSimulation'
import StateVisualizationLab from './StateVisualizationLab'
import GroverExplorer from './topic_simulators/GroverExplorer'
import NoiseModelExplorer from './topic_simulators/NoiseModelExplorer'
import QAOAExplorer from './topic_simulators/QAOAExplorer'
import SuperpositionExplorer from './topic_simulators/SuperpositionExplorer'
import MeasurementExplorer from './topic_simulators/MeasurementExplorer'

import QMLSimulator from './research_simulators/QMLSimulator'
import TopologicalSimulator from './research_simulators/TopologicalSimulator'
import QuantumChemistrySimulator from './research_simulators/QuantumChemistrySimulator'
import FaultTolerantSimulator from './research_simulators/FaultTolerantSimulator'
import QuantumNetworkSimulator from './research_simulators/QuantumNetworkSimulator'
import VQASimulator from './research_simulators/VQASimulator'

const RESEARCH_SIMULATORS = {
  quantum_machine_learning: QMLSimulator,
  topological_quantum_computing: TopologicalSimulator,
  quantum_chemistry: QuantumChemistrySimulator,
  fault_tolerant_quantum_computing: FaultTolerantSimulator,
  quantum_networking: QuantumNetworkSimulator,
  variational_quantum_algorithms: VQASimulator,
}

const TOPIC_LABS = {
  grovers_algorithm: {
    Component: GroverExplorer,
    includeStandard: true,
  },
  qaoa: {
    Component: QAOAExplorer,
    includeStandard: false,
  },
  noise_model: {
    Component: NoiseModelExplorer,
    includeStandard: false,
  },
  superposition: {
    Component: SuperpositionExplorer,
    includeStandard: false,
  },
  measurement: {
    Component: MeasurementExplorer,
    includeStandard: false,
  },
}

export default function SimulationSection({ topic, simulation, theory }) {
  if (!simulation) return null

  if (simulation.type === 'multi_qubit_interactive') {
    return <MultiQubitSimulator simulation={simulation} />
  }

  const ResearchComponent = RESEARCH_SIMULATORS[topic]
  if (ResearchComponent) {
    return <ResearchComponent simulation={simulation} />
  }

  if (simulation.type === 'state_visualization') {
    return <StateVisualizationLab key={topic} simulation={simulation} />
  }

  const topicLab = TOPIC_LABS[topic]
  if (!topicLab) {
    return <StandardCircuitSimulation key={topic} simulation={simulation} theory={theory} />
  }

  const TopicComponent = topicLab.Component

  if (topicLab.includeStandard === false) {
    return <TopicComponent />
  }

  return (
    <div className="space-y-6">
      <TopicComponent />
      <StandardCircuitSimulation key={`${topic}-standard`} simulation={simulation} theory={theory} />
    </div>
  )
}
