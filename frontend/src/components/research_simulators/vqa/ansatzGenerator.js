/**
 * Generates operations for a layered VQA circuit.
 * Structure:
 * Layer 1: RY(theta) on all qubits
 * Layer 2: CNOT chain (q0->q1, q1->q2...)
 * repeats based on depth, ending with a final RY layer.
 */
export function generateAnsatz(numQubits, depth, params) {
  const operations = [];
  let paramIndex = 0;

  for (let d = 0; d < depth; d++) {
    // Rotation Layer
    for (let q = 0; q < numQubits; q++) {
      operations.push({
        gate: "RY",
        target: q,
        angle: params[paramIndex] !== undefined ? params[paramIndex] : 0.0
      });
      paramIndex++;
    }

    // Entanglement Layer (skip for 1 qubit or on final layer if we only want depth-1 style, 
    // but typically we entangle between every rotation layer except the last)
    if (numQubits > 1) {
      for (let q = 0; q < numQubits - 1; q++) {
        operations.push({
          gate: "CNOT",
          control: q,
          target: q + 1
        });
      }
      // Close the ring if > 2 qubits
      if (numQubits > 2) {
         operations.push({
          gate: "CNOT",
          control: numQubits - 1,
          target: 0
        });
      }
    }
  }

  // Final Rotation Layer to close out the ansatz
  for (let q = 0; q < numQubits; q++) {
    operations.push({
      gate: "RY",
      target: q,
      angle: params[paramIndex] !== undefined ? params[paramIndex] : 0.0
    });
    paramIndex++;
  }

  return { operations, numParams: paramIndex };
}

export function getExpectedParamCount(numQubits, depth) {
  // depth layers of RY, plus 1 final layer of RY
  return (depth + 1) * numQubits; 
}
