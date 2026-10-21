package me.totok.risklab.core;

import org.junit.jupiter.api.Test;

import java.util.Random;

import static org.junit.jupiter.api.Assertions.*;

class MonteCarloSimulatorTest {
    @Test
    void shouldCalculateFinalValueWithoutVolatility() {
        var request = new SimulationRequest(100_000, 0.10, 0.0, 1, 100, 0.95);
        var simulator = new MonteCarloSimulator(new Random(42));
        SimulationResult result = simulator.simulate(request);

        assertEquals(110_000.0, result.averageFinalValue(), 0.01);
        assertEquals(110_000.0, result.medianFinalValue(), 0.01);
        assertEquals(0.0, result.probabilityOfLoss(), 0.0);
    }

    @Test
    void shouldReturnValidProbabilityOfLoss() {
        var request = new SimulationRequest(100_000, 0.08, 0.20, 1, 10_000, 0.95);
        var simulator = new MonteCarloSimulator(new Random(42));
        SimulationResult result = simulator.simulate(request);

        assertTrue(result.probabilityOfLoss() >= 0.0);
        assertTrue(result.probabilityOfLoss() <= 1.0);
    }

    @Test
    void shouldCalculateRiskMetrics() {
        var request = new SimulationRequest(100_000, 0.08, 0.20, 1, 10_000, 0.95);
        var simulator = new MonteCarloSimulator(new Random(42));
        SimulationResult result = simulator.simulate(request);

        assertTrue(result.expectedShortfall() >= result.valueAtRisk());
        assertTrue(result.minimumFinalValue() <= result.medianFinalValue());
        assertTrue(result.medianFinalValue() <= result.maximumFinalValue());
    }

    @Test
    void shouldRejectInvalidInvestment() {
        assertThrows(IllegalArgumentException.class, () ->
                new SimulationRequest(0, 0.08, 0.20, 1, 100, 0.95)
        );
    }


    @Test
    void shouldCalculateFinalValueWithZeroExpectedReturnAndVolatility() {
        var request = new SimulationRequest(100_000, 0.0, 0.0, 5, 100, 0.95);
        var simulator = new MonteCarloSimulator(new Random(42));
        SimulationResult result = simulator.simulate(request);

        assertEquals(100_000.0, result.averageFinalValue(), 0.01);
        assertEquals(100_000.0, result.medianFinalValue(), 0.01);
        assertEquals(0.0, result.probabilityOfLoss(), 0.0);
    }

    @Test
    void shouldHandleSingleSimulation() {
        var request = new SimulationRequest(100_000, 0.08, 0.20, 1, 1, 0.95);
        var simulator = new MonteCarloSimulator(new Random(42));
        SimulationResult result = simulator.simulate(request);

        assertEquals(result.minimumFinalValue(), result.maximumFinalValue(), 0.0);
        assertEquals(result.minimumFinalValue(), result.medianFinalValue(), 0.0
        );
    }

    @Test
    void shouldRejectNegativeVolatility() {
        assertThrows(IllegalArgumentException.class, () ->
                new SimulationRequest(100_000, 0.08, -0.20, 1, 100, 0.95)
        );
    }

    @Test
    void shouldRejectInvalidConfidenceLevel() {
        assertThrows(IllegalArgumentException.class, () ->
                new SimulationRequest(100_000, 0.08, 0.20, 1, 100, 1.0)
        );
    }

    @Test
    void shouldCompoundArithmeticExpectedReturnWhenVolatilityIsZero() {
        var request = new SimulationRequest(100_000, 0.08, 0.0, 5, 100, 0.95);
        var simulator = new MonteCarloSimulator(new Random(42));
        SimulationResult result = simulator.simulate(request);

        double expectedValue = 100_000 * Math.pow(1.08, 5);

        assertEquals(expectedValue, result.averageFinalValue(), 0.01);
        assertEquals(expectedValue, result.medianFinalValue(), 0.01);
        assertEquals(0.0, result.probabilityOfLoss(), 0.0);
    }

}
