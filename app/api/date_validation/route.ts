import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body: DateValidationInput = await req.json();

    console.log("Received data for validation:", body);

    const is_valid = validateDate(body);
    if (is_valid) {
      console.log("Date validation failed for input:", body);

      return NextResponse.json({ valid: is_valid }, { status: 200 });
    }
    throw new Error("Date validation failed");
  } catch (error) {
    console.error("Error during date validation process:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

type DateOperator =
  | "equal"
  | "less_than"
  | "greater_than"
  | "equal_less"
  | "equal_greater";

interface DateValidationInput {
  date_provided: string;
  operator: DateOperator;
  date: string;
}

function validateDate(input: DateValidationInput): boolean {
  const { date_provided, operator, date } = input;

  const provided = new Date(date_provided);
  if (isNaN(provided.getTime())) return false;

  let compareDate: Date;

  if (date === "today") {
    compareDate = new Date();
    compareDate.setHours(0, 0, 0, 0);
  } else {
    compareDate = new Date(date);
    if (isNaN(compareDate.getTime())) return false;
  }

  const p = provided.getTime();
  const c = compareDate.getTime();

  switch (operator) {
    case "equal":
      return p === c;
    case "less_than":
      return p < c;
    case "greater_than":
      return p > c;
    case "equal_less":
      return p <= c;
    case "equal_greater":
      return p >= c;
    default:
      return false;
  }
}
