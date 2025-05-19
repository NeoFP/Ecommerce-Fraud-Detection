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
import { format } from "date-fns";

interface Alert {
  type: "fraud" | "dos";
  timestamp: string;
  details: {
    transactionId?: string;
    amount?: number;
    merchant?: string;
    confidence: number;
    status: string;
    customer?: string;
    sourceIp?: string;
    requestCount?: number;
    severity?: string;
    attackType?: string;
  };
}

interface DashboardData {
  stats: {
    totalTransactions: number;
    fraudulentTransactions: number;
    dosAttacks: number;
    averageTransactionAmount: number;
  };
  recentAlerts: Alert[];
  chartData: {
    transactions: {
      name: string;
      value: number;
    }[];
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const data = await response.json();
        setData(data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Refresh data every minute
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Prepare data for transaction pie chart
  const transactionPieData = data?.chartData.transactions || [];

  // Prepare data for bar chart
  const barChartData = [
    {
      name: "Transactions",
      Total: data?.stats.totalTransactions || 0,
      Fraud: data?.stats.fraudulentTransactions || 0,
      "Non-Fraud":
        (data?.stats.totalTransactions || 0) -
        (data?.stats.fraudulentTransactions || 0),
    },
    {
      name: "Attacks",
      "DoS Attacks": data?.stats.dosAttacks || 0,
    },
  ];

  if (loading) {
    return <div>Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!data) {
    return <div>No dashboard data available</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.totalTransactions.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Fraudulent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.stats.fraudulentTransactions.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              DoS Attacks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data.stats.dosAttacks.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Average Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.stats.averageTransactionAmount.toFixed(2)}
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
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name === "Fraud" ? "#ef4444" : "#22c55e"}
                    />
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
    </div>
  );
}
