import math

import stim
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector


class StimSimulator:
    def __init__(self):
        self.reset()

    def reset(self):
        self.circuit = stim.Circuit()

    # -------------------------
    # STIM GATE SUPPORT CHECK
    # -------------------------
    def _stim_supported(self, gate):
        return gate in [
            "H", "X", "Y", "Z",
            "S", "T",
            "CNOT", "CZ",
            "SWAP",
            "MEASURE"
        ]

    # -------------------------
    # STIM GATE APPLICATION
    # -------------------------
    def apply_gate_stim(self, op):
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

        elif gate == "SWAP":
            self.circuit.append("SWAP", [op["target1"], op["target2"]])

        elif gate == "MEASURE":
            self.circuit.append("M", [op["target"]])

        else:
            raise ValueError(f"STIM unsupported gate: {gate}")

    # -------------------------
    # MAIN RUN FUNCTION
    # -------------------------
    def run(self, operations, shots=1000):

        self.reset()

        # detect unsupported gates
        requires_qiskit = False

        for op in operations:
            if not self._stim_supported(op["gate"]):
                requires_qiskit = True
                break

        has_measurement = any(op["gate"] == "MEASURE" for op in operations)

        # -----------------------------------
        # USE STIM WHEN POSSIBLE
        # -----------------------------------
        if not requires_qiskit and has_measurement:

            for op in operations:
                self.apply_gate_stim(op)

            sampler = self.circuit.compile_sampler()
            samples = sampler.sample(shots=shots)

            result = self._format_measurement_results(samples)

            # show state before measurement
            pre_measurement_ops = [
                op for op in operations if op["gate"] != "MEASURE"
            ]

            result["pre_measurement_state"] = self._run_qiskit_statevector(
                pre_measurement_ops
            )

            result["simulator"] = "stim"
            return result

        # -----------------------------------
        # FALLBACK TO QISKIT
        # -----------------------------------
        if has_measurement:
            result = self._run_qiskit_measured(operations, shots=shots)
            result["simulator"] = "qiskit_statevector"
            return result

        result = self._run_qiskit_statevector(operations)
        return result

    # -------------------------
    # QISKIT STATEVECTOR ENGINE
    # -------------------------
    def _run_qiskit_statevector(self, operations):

        num_qubits = self._get_num_qubits(operations)

        qc = QuantumCircuit(num_qubits)

        for op in operations:

            gate = op["gate"]

            # ----------------
            # basic gates
            # ----------------
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

            # ----------------
            # rotations
            # ----------------
            elif gate == "RX":
                qc.rx(float(op["angle"]), op["target"])

            elif gate == "RY":
                qc.ry(float(op["angle"]), op["target"])

            elif gate == "RZ":
                qc.rz(float(op["angle"]), op["target"])

            # ----------------
            # controlled gates
            # ----------------
            elif gate == "CNOT":
                qc.cx(op["control"], op["target"])

            elif gate == "CZ":
                qc.cz(op["control"], op["target"])

            elif gate == "CRZ":
                qc.crz(
                    float(op["angle"]),
                    op["control"],
                    op["target"]
                )

            elif gate.startswith("CONTROLLED-U"):
                power = 1
                if "^" in gate:
                    try:
                        power = int(gate.split("^", 1)[1])
                    except ValueError:
                        power = 1

                base_angle = float(op.get("angle", math.pi / 2))
                qc.cp(base_angle * power, op["control"], op["target"])

            elif gate in ["QFT†", "IQFT"]:
                targets = op.get("targets") or ([op["target"]] if "target" in op else [])
                self._apply_inverse_qft(qc, targets)

            elif gate == "SHIFT_RIGHT":
                qc.cx(op["control"], op["target"])

            elif gate == "SHIFT_LEFT":
                qc.x(op["control"])
                qc.cx(op["control"], op["target"])
                qc.x(op["control"])

            elif gate == "SWAP":
                qc.swap(op["target1"], op["target2"])

            elif gate == "CCX":
                qc.ccx(
                    op["control1"],
                    op["control2"],
                    op["target"]
                )

            # ignore measurement for statevector
            elif gate == "MEASURE":
                pass

            else:
                raise ValueError(f"Unsupported gate: {gate}")

        state = Statevector.from_instruction(qc)

        return self._format_statevector(state, num_qubits)

    def _apply_inverse_qft(self, qc, targets):

        ordered_targets = list(targets)

        if not ordered_targets:
            raise ValueError("QFT† requires at least one target qubit")

        for i in range(len(ordered_targets) // 2):
            qc.swap(ordered_targets[i], ordered_targets[-i - 1])

        for j in reversed(range(len(ordered_targets))):
            target = ordered_targets[j]

            for k in reversed(range(j + 1, len(ordered_targets))):
                control = ordered_targets[k]
                angle = -math.pi / (2 ** (k - j))
                qc.cp(angle, control, target)

            qc.h(target)

    def _run_qiskit_measured(self, operations, shots=1000):

        pre_measurement_ops = [
            op for op in operations if op["gate"] != "MEASURE"
        ]
        measured_targets = [
            op["target"] for op in operations if op["gate"] == "MEASURE"
        ]

        pre_measurement_state = self._run_qiskit_statevector(pre_measurement_ops)
        num_qubits = self._get_num_qubits(operations)

        aggregated = {}

        for state, probability in pre_measurement_state["probabilities"].items():

            measured_state = "".join(
                state[num_qubits - 1 - target]
                for target in measured_targets
            )

            aggregated[measured_state] = aggregated.get(measured_state, 0) + probability

        probabilities = {
            state: round(probability, 6)
            for state, probability in sorted(aggregated.items())
            if probability > 1e-10
        }

        counts = self._probabilities_to_counts(aggregated, shots)

        return {
            "counts": counts,
            "probabilities": probabilities,
            "shots": shots,
            "pre_measurement_state": pre_measurement_state,
            "basis_order": "measurement_order"
        }

    def _probabilities_to_counts(self, probabilities, shots):

        if not probabilities:
            return {}

        raw_counts = {
            state: probability * shots
            for state, probability in probabilities.items()
        }
        counts = {
            state: int(math.floor(value))
            for state, value in raw_counts.items()
        }

        remaining = shots - sum(counts.values())

        if remaining > 0:
            ranked_states = sorted(
                raw_counts,
                key=lambda state: raw_counts[state] - counts[state],
                reverse=True
            )

            for i in range(remaining):
                state = ranked_states[i % len(ranked_states)]
                counts[state] += 1

        return {
            state: count for state, count in counts.items() if count > 0
        }

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

            amplitudes[bitstring] = {
                "real": round(float(amp.real), 6),
                "imag": round(float(amp.imag), 6),
            }

            probabilities[bitstring] = round(
                float(abs(amp) ** 2),
                6
            )

        return {

            "amplitudes": amplitudes,

            "probabilities": probabilities,

            "basis_order": "big_endian"
        }

    # -------------------------
    # FORMAT MEASUREMENTS
    # -------------------------
    def _format_measurement_results(self, samples):

        results = [
            "".join(map(str, sample))
            for sample in samples
        ]

        counts = {}

        for r in results:
            counts[r] = counts.get(r, 0) + 1

        total = len(results)

        probabilities = {

            state: count / total
            for state, count in counts.items()
        }

        return {

            "counts": counts,

            "probabilities": probabilities,

            "shots": total,

            "preview": results[:10]
        }

    # -------------------------
    # UTILITY
    # -------------------------
    def _get_num_qubits(self, operations):

        max_q = 0

        for op in operations:

            if "target" in op:
                max_q = max(max_q, op["target"])

            if "control" in op:
                max_q = max(max_q, op["control"])

            if "control1" in op:
                max_q = max(max_q, op["control1"])

            if "control2" in op:
                max_q = max(max_q, op["control2"])

            if "target1" in op:
                max_q = max(max_q, op["target1"])

            if "target2" in op:
                max_q = max(max_q, op["target2"])

            if "targets" in op and op["targets"]:
                max_q = max(max_q, *op["targets"])

        return max_q + 1
