import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  try {
    // Connect to MongoDB using the connection string
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    // Get the ccfraud database
    const db = client.db("ccfraud");

    // Fetch latest fraud alert
    const latestFraudAlert = await db
      .collection("fraud")
      .find({})
      .sort({ trans_date_trans_time: -1 })
      .limit(1)
      .toArray();

    // Fetch latest DoS alert
    const latestDosAlert = await db
      .collection("dos")
      .find({})
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    // Close the connection
    await client.close();

    // Helper function to ensure valid date
    const ensureValidDate = (dateInput: any): string => {
      if (!dateInput) return new Date().toISOString();
      try {
        const date = new Date(dateInput);
        return date.toISOString();
      } catch {
        return new Date().toISOString();
      }
    };

    // Transform fraud alert data
    const fraudAlert = latestFraudAlert[0]
      ? {
          type: "fraud",
          timestamp: ensureValidDate(latestFraudAlert[0].trans_date_trans_time),
          details: {
            transactionId: latestFraudAlert[0].trans_num || "Unknown",
            amount: latestFraudAlert[0].amt || 0,
            merchant: latestFraudAlert[0].merchant || "Unknown",
            confidence: latestFraudAlert[0].confidence || 0,
            status: latestFraudAlert[0].is_fraud
              ? "Fraud Detected"
              : "Legitimate",
            customer:
              `${latestFraudAlert[0].first || ""} ${
                latestFraudAlert[0].last || ""
              }`.trim() || "Unknown Customer",
          },
        }
      : null;

    // Transform DoS alert data
    const dosAlert = latestDosAlert[0]
      ? {
          type: "dos",
          timestamp: ensureValidDate(latestDosAlert[0].timestamp),
          details: {
            sourceIp: latestDosAlert[0].source_ip || "Unknown",
            requestCount: latestDosAlert[0].request_count || 0,
            severity: latestDosAlert[0].severity || "Low",
            status: latestDosAlert[0].blocked ? "Blocked" : "Detected",
            attackType: latestDosAlert[0].attack_type || "Unknown",
            confidence: latestDosAlert[0].confidence || 0,
          },
        }
      : null;

    // Combine alerts
    const recentAlerts = [fraudAlert, dosAlert].filter(Boolean);

    // Mock data for other dashboard statistics
    const dashboardData = {
      stats: {
        totalTransactions: 1234,
        fraudulentTransactions: 56,
        dosAttacks: 23,
        averageTransactionAmount: 150.45,
      },
      recentAlerts,
      chartData: {
        // ... existing chart data
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard data",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
