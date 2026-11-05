import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { latitude, longitude, radius = 5000 } = await req.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { success: false, message: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "Google Places API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.internationalPhoneNumber,places.regularOpeningHours,places.currentOpeningHours,places.photos",
        },
        body: JSON.stringify({
          includedTypes: ["hospital"],
          maxResultCount: 10,
          locationRestriction: {
            circle: {
              center: {
                latitude,
                longitude,
              },
              radius,
            },
          },
          rankPreference: "DISTANCE",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Places API error:", errorText);
      return NextResponse.json(
        { success: false, message: "Failed to fetch hospitals from Google Places API" },
        { status: response.status }
      );
    }

    const data = await response.json();

    const hospitals = (data.places || []).map((place: any) => {
      const isOpen = place.currentOpeningHours?.openNow ?? place.regularOpeningHours?.openNow ?? true;
      
      return {
        id: place.id,
        name: place.displayName?.text || "Unknown Hospital",
        address: place.formattedAddress || "Address not available",
        latitude: place.location?.latitude,
        longitude: place.location?.longitude,
        rating: place.rating || 0,
        totalRatings: place.userRatingCount || 0,
        phone: place.nationalPhoneNumber || place.internationalPhoneNumber || "",
        isEmergencyAvailable: isOpen,
        photoReference: place.photos?.[0]?.name,
      };
    });

    return NextResponse.json({
      success: true,
      hospitals,
      count: hospitals.length,
    });
  } catch (error: any) {
    console.error("Error fetching nearby hospitals:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
