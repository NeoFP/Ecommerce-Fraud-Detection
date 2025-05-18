import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Alert from "@/lib/models/alert";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const limit = searchParams.get("limit") || "10";

  try {
    await dbConnect();

    // Build query object based on parameters
    const query: any = {};
    if (type) {
      query.type = type;
    }

    const alerts = await Alert.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit as string))
      .lean();

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.type || !body.details) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Create new alert
    const alert = await Alert.create({
      type: body.type,
      details: body.details,
      resolved: body.resolved || false,
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error("Error creating alert:", error);
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    );
  }
}
