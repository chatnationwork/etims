import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("Received data:", body);

    let valueToUse = body.amount;
    if (body.category === "Currency over $10,000" && body.valueOfFund) {
      valueToUse = body.valueOfFund;
    }

    await prisma.savedItem.create({
      data: {
        category: body.category,
        item: body.item,
        quantity: body.quantity,
        amount: valueToUse,
        currency: body.currency,
        valueOfFund: body.valueOfFund,
        sourceOfFund: body.sourceOfFund,
        purposeOfFund: body.purposeOfFund,
        cert: body.cert,
        hsCode: body.hsCode,
        phone: body.phone,
      },
    });

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.error("Error saving item:", error);
    return NextResponse.json({ error: "Failed to save item" }, { status: 500 });
  }
}
