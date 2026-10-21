package me.totok.risklab.core;

import java.util.List;

public record SimulationResult(double averageFinalValue, double medianFinalValue, double probabilityOfLoss, double valueAtRisk, double expectedShortfall, double minimumFinalValue, double maximumFinalValue, List<HistogramBin> distribution) {
}