import axios from 'axios';
import { generateAnsatz } from './ansatzGenerator';

/**
 * Calculates expectation value from statevector amplitudes.
 * Expects amplitudes in big-endian bitstring format (e.g. '00', '01' for 2 qubits).
 * Qubit 0 is the rightmost bit in standard Qiskit/Stim. Wait, Qiskit ordering: bit 0 is rightmost.
 */
function expectationZ(amplitudes, targetQubit) {
  let expVal = 0.0;
  for (const [bitstring, amp] of Object.entries(amplitudes)) {
    const prob = (amp.real * amp.real) + (amp.imag * amp.imag);
    // Find value of targetQubit. If bitstring="10", string length is 2. 
    // Rightmost is index length-1. In Qiskit, bit 0 is the rightmost bit.
    const bit = bitstring[bitstring.length - 1 - targetQubit];
    const eigenvalue = bit === '1' ? -1 : 1;
    expVal += prob * eigenvalue;
  }
  return expVal;
}

export async function computeCost(params, numQubits, depth, hamiltonianType) {
  const { operations } = generateAnsatz(numQubits, depth, params);

  try {
    const res = await axios.post('/api/simulate/custom', {
      operations,
      shots: 1000 // Even though statevector doesn't use shots, API requires it
    });

    const result = res.data.result;
    const amplitudes = result?.amplitudes;

    if (!amplitudes) {
      throw new Error("Backend did not return amplitudes. Ensure MEASURE gates are omitted for statevector simulation.");
    }

    let cost = 0.0;
    
    switch (hamiltonianType) {
      case 'Z0':
        cost = expectationZ(amplitudes, 0);
        break;
      case 'Z0+Z1':
        if (numQubits < 2) throw new Error("Need >= 2 qubits for Z0+Z1");
        cost = expectationZ(amplitudes, 0) + expectationZ(amplitudes, 1);
        break;
      case 'Ising':
        // Simplified Ising: summation of Zi Z_{i+1} + Xi
        // A full Ising model expectation involves X terms which require basis changes in the circuit.
        // For simplicity in this demo without augmenting the circuit array dynamically per term, 
        // we'll approximate a ZZ coupling: sum( Zi * Zi+1 ).
        if (numQubits < 2) throw new Error("Need >= 2 qubits for Ising");
        cost = 0;
        for (let i = 0; i < numQubits - 1; i++) {
           let zz_term_val = 0;
           for (const [bitstring, amp] of Object.entries(amplitudes)) {
              const prob = (amp.real * amp.real) + (amp.imag * amp.imag);
              const bit_i = bitstring[bitstring.length - 1 - i];
              const bit_next = bitstring[bitstring.length - 1 - (i+1)];
              const b_i = bit_i === '1' ? -1 : 1;
              const b_next = bit_next === '1' ? -1 : 1;
              zz_term_val += prob * (b_i * b_next);
           }
           cost += zz_term_val;
        }
        break;
      default:
        cost = expectationZ(amplitudes, 0);
    }

    return cost;

  } catch (error) {
    console.error("Simulation error:", error);
    return 0; // Fallback
  }
}
