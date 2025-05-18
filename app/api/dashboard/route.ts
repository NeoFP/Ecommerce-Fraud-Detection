import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Alert from "@/lib/models/alert";

export async function GET() {
  try {
    await dbConnect();

    // In a real scenario, you'd fetch this data from your database
    // For now, using mock data since the actual transaction data model isn't implemented yet

    // Get alerts from the database
    const recentAlerts = await Alert.find()
      .sort({ timestamp: -1 })
      .limit(5)
      .lean();

    // Count alerts by type
    const fraudAlertCount = await Alert.countDocuments({ type: "fraud" });
    const dosAlertCount = await Alert.countDocuments({ type: "dos" });

    // Mock transaction data (will be replaced with actual database queries)
    const mockTransactionData = {
      totalTransactions: 1250,
      fraudTransactions: fraudAlertCount || 78, // Use actual count if available
      nonFraudTransactions: 1250 - (fraudAlertCount || 78),
      dosAttacks: dosAlertCount || 42, // Use actual count if available
    };

    // Combine real and mock data
    const dashboardData = {
      ...mockTransactionData,
      alerts: recentAlerts,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
