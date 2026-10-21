package me.totok.risklab.core;

public record SimulationRequest(double initialInvestment, double annualExpectedReturn, double annualVolatility, int years, int simulations, double confidenceLevel) {
    public SimulationRequest {
        if (!Double.isFinite(initialInvestment) || initialInvestment <= 0) {
            throw new IllegalArgumentException("Investment must be positive.");
        }

        if (!Double.isFinite(annualExpectedReturn) || annualExpectedReturn <= -1) {
            throw new IllegalArgumentException("Invalid expected return.");
        }

        if (!Double.isFinite(annualVolatility) || annualVolatility < 0) {
            throw new IllegalArgumentException("Volatility cannot be negative.");
        }

        if (years <= 0 || simulations < 1) {
            throw new IllegalArgumentException("Years and simulations must be positive.");
        }

        if (!Double.isFinite(confidenceLevel) || confidenceLevel <= 0 || confidenceLevel >= 1) {
            throw new IllegalArgumentException("Confidence level must be between 0 and 1.");
        }
    }
}
