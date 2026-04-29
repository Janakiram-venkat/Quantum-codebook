import { computeCost } from './costFunction';

/**
 * Perform a single step of gradient descent using parallel async calls 
 * for parameter-shift or finite differences to calculate the gradient.
 * 
 * We use a small finite difference h to approximate the gradient.
 */
export async function optimizerStep(params, numQubits, depth, hamiltonianType, learningRate) {
  const h = Math.PI / 100; // Small shift
  
  // 1. Evaluate baseline cost
  const baseCost = await computeCost(params, numQubits, depth, hamiltonianType);

  // 2. Evaluate shifted costs to find gradient for each parameter
  // We use Promise.all to hit the backend in parallel, making it vastly faster.
  const gradientPromises = params.map(async (theta, i) => {
    const shiftedParams = [...params];
    shiftedParams[i] += h;
    const shiftedCost = await computeCost(shiftedParams, numQubits, depth, hamiltonianType);
    const grad = (shiftedCost - baseCost) / h;
    return grad;
  });

  const gradients = await Promise.all(gradientPromises);

  // 3. Apply gradient descent step: θ_new = θ_old - lr * gradient
  const newParams = params.map((theta, i) => theta - (learningRate * gradients[i]));

  return {
    baseCost,
    newParams,
    gradients
  };
}
