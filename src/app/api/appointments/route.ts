import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import Appointment from "@/lib/models/Appointment";

const JWT_SECRET = process.env.JWT_SECRET || "medical-emergency-secret-key-2024";

function getUserIdFromToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const appointments = await Appointment.find({ userId }).sort({ date: 1, time: 1 });
    
    return NextResponse.json({ success: true, appointments });
  } catch (error) {
    console.error("Get appointments error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { doctorName, specialization, hospital, date, time, type, notes } = body;

    if (!doctorName || !specialization || !hospital || !date || !time) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const appointment = await Appointment.create({
      userId,
      doctorName,
      specialization,
      hospital,
      date,
      time,
      type: type || "Consultation",
      notes: notes || "",
      status: "scheduled",
    });

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error("Create appointment error:", error);
    return NextResponse.json({ success: false, error: "Failed to create appointment" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Appointment ID required" }, { status: 400 });
    }

    await connectToDatabase();
    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true }
    );

    if (!appointment) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error("Update appointment error:", error);
    return NextResponse.json({ success: false, error: "Failed to update appointment" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Appointment ID required" }, { status: 400 });
    }

    await connectToDatabase();
    const appointment = await Appointment.findOneAndDelete({ _id: id, userId });

    if (!appointment) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Appointment deleted" });
  } catch (error) {
    console.error("Delete appointment error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete appointment" }, { status: 500 });
  }
}