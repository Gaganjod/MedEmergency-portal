import { NextRequest, NextResponse } from "next/server";

const ERAKTKOSH_API_URL = "https://www.eraktkosh.in/JERC/umang/apisetu/dept/eraktkoshapi/ws1/stocknearby";

interface BloodBankResponse {
  name: string;
  add: string;
  ph: string;
  type: string;
  email: string;
  h_code: string;
  dis: string;
  lat: string;
  long: string;
  available: string;
  not_available: string;
  moderate: string;
  lastUpdate: string;
  currentStatus: string;
  available_WithQty: string;
  not_available_WithQty: string;
  moderate_WithQty: string;
}

function generateMockBloodBanks(latitude: number, longitude: number) {
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const bankTypes = ["Government", "Red Cross", "Private", "Charitable"];
  const names = [
    "City Blood Bank",
    "Red Cross Blood Centre",
    "District Hospital Blood Bank",
    "Community Blood Centre",
    "Medical College Blood Bank",
    "Regional Blood Centre",
  ];
  
  return names.map((name, index) => {
    const distance = (Math.random() * 10 + 0.5).toFixed(2);
    const latOffset = (Math.random() - 0.5) * 0.1;
    const lngOffset = (Math.random() - 0.5) * 0.1;
    
    return {
      id: `mock-${index + 1}`,
      name: `${name} #${index + 1}`,
      address: `${100 + index * 50} Medical Street, Healthcare District`,
      phone: `+91-${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      type: bankTypes[index % bankTypes.length],
      email: `bloodbank${index + 1}@hospital.org`,
      distance: parseFloat(distance),
      latitude: latitude + latOffset,
      longitude: longitude + lngOffset,
      lastUpdate: new Date().toISOString().split("T")[0],
      status: "active",
      availability: bloodTypes.map((type) => ({
        type,
        quantity: Math.floor(Math.random() * 20),
        status: Math.random() > 0.6 ? "available" : Math.random() > 0.3 ? "moderate" : "unavailable" as const,
      })),
    };
  }).sort((a, b) => a.distance - b.distance);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude, radius = "50000", bloodType = "" } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const payload = {
      tkn: `td${crypto.randomUUID()}/1`,
      lang: "en",
      usrid: "guest",
      mode: "web",
      pltfrm: "apisetu",
      did: null,
      deptid: "98",
      srvid: "722",
      source: "UMANG",
      deptLat: parseFloat(latitude),
      deptLong: parseFloat(longitude),
      bbType: bloodType,
      radius: radius,
      usag: null,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(ERAKTKOSH_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.rs !== "S") {
        throw new Error(data.rd || "API returned error");
      }

      const bloodBanks: BloodBankResponse[] = JSON.parse(data.payload.response);
      const total = bloodBanks[0]?.TOTAL || 0;
      const banks = bloodBanks.slice(1).map((bank) => ({
        id: bank.h_code,
        name: bank.name,
        address: bank.add,
        phone: bank.ph,
        type: bank.type,
        email: bank.email,
        distance: parseFloat(bank.dis),
        latitude: parseFloat(bank.lat),
        longitude: parseFloat(bank.long),
        lastUpdate: bank.lastUpdate,
        status: bank.currentStatus === "1" ? "active" : "inactive",
        availability: parseAvailability(bank.available_WithQty, bank.moderate_WithQty, bank.not_available_WithQty),
      }));

      return NextResponse.json({
        success: true,
        total,
        bloodBanks: banks,
        source: "eraktkosh",
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.log("eRaktKosh API unavailable, using mock data:", fetchError);
      
      const mockBanks = generateMockBloodBanks(parseFloat(latitude), parseFloat(longitude));
      return NextResponse.json({
        success: true,
        total: mockBanks.length,
        bloodBanks: mockBanks,
        source: "demo",
        message: "Showing demo data (eRaktKosh API unavailable)",
      });
    }
  } catch (error) {
    console.error("Blood bank API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blood bank data" },
      { status: 500 }
    );
  }
}

function parseAvailability(available: string, moderate: string, notAvailable: string) {
  const result: { type: string; quantity: number; status: "available" | "moderate" | "unavailable" }[] = [];

  const parseQtyString = (str: string, status: "available" | "moderate" | "unavailable") => {
    if (!str) return;
    const items = str.split(",").map((s) => s.trim()).filter(Boolean);
    items.forEach((item) => {
      const [type, qty] = item.split(":").map((s) => s.trim());
      if (type && qty !== undefined) {
        result.push({
          type: normalizeBloodType(type),
          quantity: parseInt(qty) || 0,
          status,
        });
      }
    });
  };

  parseQtyString(available, "available");
  parseQtyString(moderate, "moderate");
  parseQtyString(notAvailable, "unavailable");

  return result;
}

function normalizeBloodType(type: string): string {
  return type
    .replace("-Ve", "-")
    .replace("+Ve", "+")
    .replace("Oh-VE", "O-")
    .replace("Oh+VE", "O+");
}