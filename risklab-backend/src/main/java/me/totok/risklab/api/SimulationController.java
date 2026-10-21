package me.totok.risklab.api;

import me.totok.risklab.core.MonteCarloSimulator;
import me.totok.risklab.core.SimulationRequest;
import me.totok.risklab.core.SimulationResult;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/simulations")
public class SimulationController {
    private final MonteCarloSimulator simulator;

    public SimulationController(MonteCarloSimulator simulator) {
        this.simulator = simulator;
    }

    @PostMapping
    public SimulationResult simulate(@RequestBody SimulationRequest request) {
        return simulator.simulate(request);
    }
}