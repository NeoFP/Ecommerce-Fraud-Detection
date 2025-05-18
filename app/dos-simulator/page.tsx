"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function DosSimulatorPage() {
  const [simulationResult, setSimulationResult] = useState<{
    confidence: string;
    label: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Full payload that will be sent to the API
  const fullPayload = {
    "No.": 1,
    Time: "2025-03-16 10:00:54",
    Source: "192.168.97.22",
    Destination: "192.168.188.213",
    Protocol: "DNS",
    Length: 50000,
    Host: null,
    Info: "",
  };

  // Simplified payload for display
  const displayPayload = {
    Time: fullPayload.Time,
    Source: fullPayload.Source,
    Destination: fullPayload.Destination,
  };

  const runDosSimulation = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5001/dos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fullPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setSimulationResult(data);
    } catch (err) {
      console.error("Error during simulation:", err);
      setError(
        "Failed to run simulation. Please check if the DoS detection server is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">DoS Simulator</h1>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>DoS Attack Simulation</CardTitle>
            <CardDescription>
              Simulate a DoS attack to test detection capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the button below to simulate a DoS attack. This will send
                a request to the detection API with simulated traffic
                characteristics of a DoS attack.
              </p>
              <div className="p-4 bg-gray-100 rounded-md">
                <h3 className="font-medium mb-2">Simulation Payload:</h3>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(displayPayload, null, 2)}
                </pre>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={runDosSimulation} disabled={isLoading}>
              {isLoading ? "Simulating..." : "Simulate DoS Attack"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Simulation Result</CardTitle>
            <CardDescription>
              Detection result from the simulated attack
            </CardDescription>
          </CardHeader>
          <CardContent>
            {simulationResult ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Confidence:</span>
                  <span className="text-right">
                    {simulationResult.confidence}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Classification:</span>
                  <span
                    className={`text-right font-semibold ${
                      simulationResult.label === "Normal"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {simulationResult.label}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No simulation results available. Click the "Simulate DoS Attack"
                button to run a simulation.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
