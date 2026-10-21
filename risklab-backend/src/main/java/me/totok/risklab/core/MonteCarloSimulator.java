package me.totok.risklab.core;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.random.RandomGenerator;

public class MonteCarloSimulator {
    private final RandomGenerator random;

    public MonteCarloSimulator(RandomGenerator random) {
        this.random = random;
    }

    public SimulationResult simulate(SimulationRequest request) {
        int count = request.simulations();

        double initial = request.initialInvestment();
        double mu = request.annualExpectedReturn();
        double sigma = request.annualVolatility();

        double expectedGrossReturn = 1.0 + mu;

        double logVariance = Math.log1p((sigma * sigma) / (expectedGrossReturn * expectedGrossReturn));

        double logVolatility = Math.sqrt(logVariance);
        double logDrift = Math.log1p(mu) - 0.5 * logVariance;

        double[] finalValues = new double[count];
        double[] losses = new double[count];

        int lossCount = 0;
        double total = 0.0;

        for (int i = 0; i < count; i++) {
            double value = initial;

            for (int year = 0; year < request.years(); year++) {
                double z = random.nextGaussian();

                double annualGrossReturn = Math.exp(
                        logDrift + logVolatility * z
                );

                value *= annualGrossReturn;
            }

            finalValues[i] = value;
            losses[i] = initial - value;
            total += value;

            if (value < initial) lossCount++;
        }

        Arrays.sort(finalValues);
        Arrays.sort(losses);

        double average = total / count;
        double median = median(finalValues);
        double probabilityOfLoss = (double) lossCount / count;

        int varIndex = (int) Math.ceil(request.confidenceLevel() * count) - 1;

        double var = losses[varIndex];

        int tailCount = Math.max(1, (int) Math.ceil((1.0 - request.confidenceLevel()) * count));

        double tailSum = 0.0;

        for (int i = count - tailCount; i < count; i++) tailSum += losses[i];

        double expectedShortfall = tailSum / tailCount;

        List<HistogramBin> distribution = buildHistogram(finalValues);
        return new SimulationResult(average, median, probabilityOfLoss, var, expectedShortfall, finalValues[0], finalValues[count - 1], distribution);
    }

    private double median(double[] sortedValues) {
        int middle = sortedValues.length / 2;

        if (sortedValues.length % 2 == 1) return sortedValues[middle];

        return (sortedValues[middle - 1] + sortedValues[middle]) / 2.0;
    }


    private List<HistogramBin> buildHistogram(double[] sortedValues) {
        int count = sortedValues.length;

        double min = sortedValues[0];
        double max = sortedValues[count - 1];

        if (min == max) return List.of(new HistogramBin(min, max, count));

        int binCount = 20;
        double width = (max - min) / binCount;

        int[] counts = new int[binCount];

        for (double value : sortedValues) {
            int index = (int) ((value - min) / width);

            if (index >= binCount) index = binCount - 1;

            counts[index]++;
        }

        List<HistogramBin> bins = new ArrayList<>();

        for (int i = 0; i < binCount; i++) {
            double lower = min + i * width;
            double upper = (i == binCount - 1) ? max : min + (i + 1) * width;

            bins.add(new HistogramBin(lower, upper, counts[i]));
        }

        return bins;
    }

}
