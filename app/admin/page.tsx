"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Fallback data if API fails
const fallbackDashboardData = {
  totalTransactions: 1250,
  fraudTransactions: 78,
  nonFraudTransactions: 1172,
  dosAttacks: 42,
  alerts: [
    {
      _id: "1",
      type: "fraud",
      timestamp: new Date().toISOString(),
      details: { transactionId: "TX123456", amount: 1299.99 },
      resolved: false,
    },
    {
      _id: "2",
      type: "dos",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      details: { source: "192.168.1.102", packets: 50000 },
      resolved: true,
    },
  ],
};

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(fallbackDashboardData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // First try our internal API
        let dashboardResponse;
        try {
          dashboardResponse = await fetch("/api/dashboard");
          if (dashboardResponse.ok) {
            const data = await dashboardResponse.json();
            setDashboardData(data);
            return;
          }
        } catch (err) {
          console.error("Internal API failed, trying external API:", err);
        }

        // If internal API fails, try the external one
        try {
          const externalResponse = await fetch(
            "http://localhost:5001/dashboard"
          );
          if (externalResponse.ok) {
            const data = await externalResponse.json();
            setDashboardData(data);
            return;
          }
        } catch (err) {
          console.error("External API failed:", err);
        }

        // If both APIs fail, use fallback data
        console.warn("Using fallback dashboard data");
        setDashboardData(fallbackDashboardData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Using fallback data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare data for transaction pie chart
  const transactionPieData = [
    { name: "Fraud", value: dashboardData.fraudTransactions, color: "#ef4444" },
    {
      name: "Non-Fraud",
      value: dashboardData.nonFraudTransactions,
      color: "#22c55e",
    },
  ];

  // Prepare data for bar chart
  const barChartData = [
    {
      name: "Transactions",
      Total: dashboardData.totalTransactions,
      Fraud: dashboardData.fraudTransactions,
      "Non-Fraud": dashboardData.nonFraudTransactions,
    },
    {
      name: "Attacks",
      "DoS Attacks": dashboardData.dosAttacks,
    },
  ];

  if (loading) {
    return <div>Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {error && (
        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800 mb-4">
          {error}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.totalTransactions}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fraud Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {dashboardData.fraudTransactions}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Non-Fraud Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {dashboardData.nonFraudTransactions}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              DoS Attacks Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {dashboardData.dosAttacks}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={transactionPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {transactionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Statistics</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Total" fill="#3b82f6" />
                <Bar dataKey="Fraud" fill="#ef4444" />
                <Bar dataKey="Non-Fraud" fill="#22c55e" />
                <Bar dataKey="DoS Attacks" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.alerts && dashboardData.alerts.length > 0 ? (
              dashboardData.alerts.map((alert) => (
                <div
                  key={alert._id}
                  className={`p-4 border rounded-lg ${
                    alert.type === "fraud"
                      ? "border-red-200 bg-red-50"
                      : "border-orange-200 bg-orange-50"
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="font-medium">
                      {alert.type === "fraud"
                        ? "Fraud Alert"
                        : "DoS Attack Alert"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    {alert.type === "fraud" ? (
                      <div>
                        Transaction ID: {alert.details.transactionId} | Amount:
                        ${alert.details.amount}
                      </div>
                    ) : (
                      <div>
                        Source IP: {alert.details.source} | Packets:{" "}
                        {alert.details.packets}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        alert.resolved
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {alert.resolved ? "Resolved" : "Unresolved"}
                    </span>
                    <button className="text-sm text-blue-600 hover:underline">
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No recent alerts
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
