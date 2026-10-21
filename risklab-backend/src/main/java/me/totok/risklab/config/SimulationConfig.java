package me.totok.risklab.config;

import me.totok.risklab.core.MonteCarloSimulator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Random;

@Configuration
public class SimulationConfig {
    @Bean
    public MonteCarloSimulator monteCarloSimulator() {
        return new MonteCarloSimulator(new Random());
    }
}
