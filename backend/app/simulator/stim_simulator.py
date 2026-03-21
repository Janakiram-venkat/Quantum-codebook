import stim
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector


class StimSimulator:
    def __init__(self):
        self.reset()

    def reset(self):
        self.circuit = stim.Circuit()

    # -------------------------
    # STIM GATE APPLICATION
    # -------------------------
    def apply_gate(self, op):
        gate = op["gate"]

        if gate == "H":
            self.circuit.append("H", [op["target"]])

        elif gate == "X":
            self.circuit.append("X", [op["target"]])

        elif gate == "Y":
            self.circuit.append("Y", [op["target"]])

        elif gate == "Z":
            self.circuit.append("Z", [op["target"]])

        elif gate == "S":
            self.circuit.append("S", [op["target"]])

        elif gate == "T":
            self.circuit.append("SQRT_Z", [op["target"]])

        elif gate == "CNOT":
            self.circuit.append("CX", [op["control"], op["target"]])

        elif gate == "CZ":
            self.circuit.append("CZ", [op["control"], op["target"]])

        elif gate == "MEASURE":
            self.circuit.append("M", [op["target"]])

        else:
            raise ValueError(f"Unsupported gate: {gate}")

    # -------------------------
    # MAIN RUN FUNCTION
    # -------------------------
    def run(self, operations, shots=1000):
        self.reset()

        for op in operations:
            self.apply_gate(op)

        has_measurement = any(op.get("gate") == "MEASURE" for op in operations)

        # ✅ Use STIM for measurement simulation
        if has_measurement:
            sampler = self.circuit.compile_sampler()
            samples = sampler.sample(shots=shots)
            measurement_result = self._format_measurement_results(samples)

            pre_measurement_ops = []
            for op in operations:
                if op.get("gate") == "MEASURE":
                    break
                pre_measurement_ops.append(op)

            measurement_result["pre_measurement_state"] = self._run_qiskit_statevector(pre_measurement_ops)
            return measurement_result

        # ✅ Use QISKIT for statevector simulation
        return self._run_qiskit_statevector(operations)

    # -------------------------
    # QISKIT STATEVECTOR
    # -------------------------
    def _run_qiskit_statevector(self, operations):
        num_qubits = self._get_num_qubits(operations)

        qc = QuantumCircuit(num_qubits)

        for op in operations:
            gate = op["gate"]

            if gate == "H":
                qc.h(op["target"])

            elif gate == "X":
                qc.x(op["target"])

            elif gate == "Y":
                qc.y(op["target"])

            elif gate == "Z":
                qc.z(op["target"])

            elif gate == "S":
                qc.s(op["target"])

            elif gate == "T":
                qc.t(op["target"])

            elif gate == "CNOT":
                qc.cx(op["control"], op["target"])

            elif gate == "CZ":
                qc.cz(op["control"], op["target"])

            # ignore MEASURE for statevector

        state = Statevector.from_instruction(qc)

        return self._format_statevector(state, num_qubits)

    # -------------------------
    # FORMAT STATEVECTOR
    # -------------------------
    def _format_statevector(self, state, num_qubits):
        amplitudes = {}
        probabilities = {}

        for i, amp in enumerate(state.data):
            if abs(amp) < 1e-10:
                continue

            bitstring = format(i, f"0{num_qubits}b")

            real = round(float(amp.real), 6)
            imag = round(float(amp.imag), 6)
            prob = round(float(abs(amp) ** 2), 6)

            amplitudes[bitstring] = {
                "real": real,
                "imag": imag,
            }

            probabilities[bitstring] = prob

        return {
            "amplitudes": amplitudes,
            "probabilities": probabilities,
            "basis_order": "big_endian",
        }

    # -------------------------
    # FORMAT MEASUREMENTS
    # -------------------------
    def _format_measurement_results(self, samples):
        results = ["".join(map(str, sample)) for sample in samples]

        counts = {}
        for bitstring in results:
            counts[bitstring] = counts.get(bitstring, 0) + 1

        total = len(results)

        probabilities = {
            state: count / total for state, count in counts.items()
        }

        return {
            "counts": counts,
            "probabilities": probabilities,
            "raw": results[:10],
        }

    # -------------------------
    # UTILITY
    # -------------------------
    def _get_num_qubits(self, operations):
        max_q = 0

        for op in operations:
            max_q = max(max_q, op.get("target", 0))

            if "control" in op:
                max_q = max(max_q, op["control"])

        return max_q + 1
