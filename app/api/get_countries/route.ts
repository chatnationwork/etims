import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = await fetch(
      "https://kratest.pesaflow.com/api/static/custom/countries",
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch countries: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching countries:", error);
    return NextResponse.json(
      { message: "Failed to fetch countries", error: String(error) },
      { status: 500 }
    );
  }
}
