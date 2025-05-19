import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  try {
    // Fetch real dashboard data from the endpoint
    const response = await fetch("http://localhost:5001/dashboard");
    if (!response.ok) {
      throw new Error("Failed to fetch dashboard data");
    }
    const dashboardData = await response.json();

    // Transform the data to match our frontend structure
    const transformedData = {
      stats: {
        totalTransactions: dashboardData.total_transactions,
        fraudulentTransactions: dashboardData.fraud_transactions,
        dosAttacks: dashboardData.dos_attacks,
        averageTransactionAmount:
          dashboardData.total_non_fraud_amount /
          (dashboardData.total_transactions - dashboardData.fraud_transactions),
      },
      recentAlerts: [], // We'll keep this empty for now as it's not provided by the endpoint
      chartData: {
        transactions: [
          {
            name: "Fraud",
            value: dashboardData.fraud_transactions,
          },
          {
            name: "Non-Fraud",
            value:
              dashboardData.total_transactions -
              dashboardData.fraud_transactions,
          },
        ],
      },
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard data",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
