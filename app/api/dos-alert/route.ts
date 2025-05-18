import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Alert from "@/lib/models/alert";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Connect to database
    await dbConnect();

    // Create a new DoS alert
    const alert = await Alert.create({
      type: "dos",
      details: {
        source: body.Source,
        destination: body.Destination,
        protocol: body.Protocol,
        length: body.Length,
        timestamp: body.Time,
      },
      resolved: false,
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error("Error creating DoS alert:", error);
    return NextResponse.json(
      { error: "Failed to create DoS alert" },
      { status: 500 }
    );
  }
}
