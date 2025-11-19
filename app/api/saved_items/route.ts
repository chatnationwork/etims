import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Atomic fetch + delete
    const [savedItems] = await prisma.$transaction([
      prisma.savedItem.findMany({
        where: { phone: body.phone },
      }),
      prisma.savedItem.deleteMany({
        where: { phone: body.phone },
      }),
    ]);

    const items = savedItems.map((item) => {
      let description = item.item;
      let value = item.amount;

      // Special cases
      if (item.category === "Currency over $10,000") {
        description = "Currency over $10,000";
        value = item.valueOfFund ?? item.amount;
      }

      if (item.category === "Good for Re-importation") {
        description = "Good for Re-importation";
        // value stays item.amount
      }

      return {
        type: item.category,
        hscode: item.hsCode,
        description,
        quantity: item.quantity,
        value,
        currency: item.currency,
      };
    });

    const itemsString = items
      .map(
        (item, index) =>
          `Item ${index + 1}:\nType: ${item.type}\nHS Code: ${
            item.hscode
          }\nDescription: ${item.description}\nQuantity: ${
            item.quantity
          }\nValue: ${item.value} ${item.currency}\n`
      )
      .join("\n");

    return NextResponse.json(
      { message: "Success", itemsString, items },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during fetch + delete:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
