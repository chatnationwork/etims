import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // add an empty string for profession if not provided
    if (!body.profession) {
      body.profession = "";
    }

    console.log("Received data:", body);

    await fetch(
      "https://kratest.pesaflow.com/api/customs/passenger-declaration",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.error("Error during create entity process:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// https://kratest.pesaflow.com/api/customs/passenger-declaration
