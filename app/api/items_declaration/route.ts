import { NextRequest, NextResponse } from "next/server";

export interface AssessmentMetadata {
  createdBy: string | null;
  createdDate: string | null;
  f88GsId: string | null;
  f88ItemId: number | null;
  id: string | null;
  lastModifiedBy: string | null;
  lastModifiedDate: string | null;
  submissionDate: string | null;
  taxAmount: number;
  taxBase: number;
  taxRate: number;
  taxType: string;
  uniqueAppId: string | null;
}

export interface Assessment {
  id: string;
  metadata: AssessmentMetadata;
  status: string;
  tax_amount: string;
  tax_base: string;
  tax_rate: string;
  tax_type: string;
}

export interface ContactInformation {
  id: string;
  address: string;
  email: string;
  msisdn: string;
  residence: string;
}

export interface TravelInformation {
  id: string;
  arrival_date: string;
  arrival_from: string;
  mode_of_conveyance: string;
  point_of_boarding: string;
  recently_visited_countries: string[];
  ticket_number: string;
}

export interface Item {
  id: string;
  alcohol_percent: string | null;
  attachment: string | null;
  currency: string;
  description: string;
  hscode: string;
  imei_numbers: string | null;
  make: string | null;
  model: string | null;
  purpose_of_fund: string | null;
  quantity: number;
  re_import_cert_no: string | null;
  source_of_fund: string | null;
  status: string;
  type: string;
  value: string;
  value_of_fund: string;
}

export interface Declaration {
  assesments: Assessment[];
  contact_information: ContactInformation;
  dob: string;
  eslip_number: string | null;
  external_id: string | null;
  external_status: string | null;
  firstname: string;
  gender: string;
  id: number;
  inserted_at: string;
  items: Item[];
  language: string;
  nationality: string;
  passport_number: string;
  payable: string | null;
  pin: string | null;
  pin_verified: boolean;
  profession: string | null;
  ref_no: string;
  status: string;
  surname: string;
  travel_information: TravelInformation;
  type: string;
  uid: number;
  updated_at: string;
}

const TAX_MAP: Record<string, string> = {
  "1206": "VAT Oils 8%",
  "2302": "Anti-Adulteration Levy (AAL)",
  "1001": "Import Duty - Oil",
  "1002": "Import Duty",
  "1003": "Import Duty - Ppo (Post Parcels)",
  "2801": "Export Duty",
  "1101": "Excise Duty - Oils",
  "1102": "Excise Duty",
  "1103": "Excise Duty - Ppo",
  "1201": "Vat Oils",
  "1202": "Vat Imports",
  "1203": "Vat Ppo (Post Parcels)",
  "1205": "Vat Treo",
  "1301": "Apsc-International",
  "1302": "Apsc-Local",
  "6101": "Sale of Number Plates- C&BC",
  "6102": "Sale of Number Plates pair -C&BC",
  "1501": "Alteration Fee",
  "1502": "Certificate Fee for Customs Documents",
  "1503": "Overtime Fee",
  "1504": "Manifest Amendment",
  "1505": "Cancellation Fee",
  "1506": "Licence Application Fee",
  "1507": "Licence Renewal Fee",
  "1508": "Customs Agent Licence Fee",
  "1510": "Transit Shed Licence Fee",
  "1511": "Bonded Warehouse Licence Fee",
  "1513": "Manufacture Under Bond Licence Fee",
  "1514": "Transit Goods Licence Fee",
  "1515": "Transit Godown Licence",
  "1522": "Licence (Certificate) Amendment Fee",
  "1523": "Licence (Certificate) Duplicate fee",
  "1907": "Rent-In-Situ",
  "1908": "Customs Warehouse Rent",
  "1909": "Sundry Revenue",
  "1999": "Forfeited Refunds",
  "6501": "Road Safety fund",
  "1601": "Fines Under East Africa Community Customs Management Act",
  "1602": "Penalty Section 135 of East Africa Community Customs Management Act",
  "1604": "Interest for late payment (Section 249)",
  "1605": "Interest for late payment (Section 135)",
  "1603": "Penalty To Bond",
  "1901": "Proceeds From Auctions",
  "1701": "Duty Deposits",
  "1702": "Duty Deposit - Transits",
  "1703": "Cash Deposits - Security Bonds",
  "1902": "Sale Of Tamperproof Seals",
  "1905": "Excess Cash",
  "1906": "Bank Interest",
  "1521": "Transit Vehicle Licence Fee",
  "1006": "Transfer of Ownership - C&BC",
  "1801": "IDF Fees",
  "1802": "IDF Fee Oils",
  "2101": "Road Maintenance Levy (RML)",
  "2301": "Petroleum Regulatory Levy(PRL)",
  "6601": "SHMV purchase tax - C&BC",
  "2401": "Directorate of Civil Aviation(DCA)Revenue",
  "2501": "Gross Payment-Petroleum Development Fund(PDF)",
  "1517": "Transit Toll Fees",
  "2601": "Sugar Development Levy",
  "1518": "Concession Fees",
  "1519": "Registration fees",
  "6301": "Transfer Fees for Motor Vehicle Registration",
  "6001": "Kenya Railway Development Levy(RDL)",
  "6201": "Foreign Motor Vehicle Fees - C&BC",
  "2701": "COMESA Certificate of origin Fee",
  "2702": "EAC Certificate of origin fee",
  "2703": "AGOA (African Growth and Opportunity Act) Certificate of Origin fee",
  "2704": "EUR1 Certificate of origin fee",
  "2705": "GSP Certificate of origin fee",
  "6401": "Merchant Shipping Superitendent (MSS) Levy",
  "1705": "Bank guarantee",
  "1516": "TGV License Modification Fee",
  "1525": "Re-importation certificate fee",
  "1910": "Surcharge fee EX-EPZ-2.5%",
  "6002": "Kenya Railway Development Levy(RDL)- Oil",
  "1520": "Calibration chart certification Fee",
  "1704": "Duty Deposits- Kenya Film Commission",
  "6402": "Merchant Shipping Superitendent (MSS) Levy-Oil",
  "1528": "Processing fee- Duty Free Motor vehicles",
  "2802": "EIP Levy",
  "1531": "Re-importation Certificate Fee",
  "1104": "Solatium contribution",
  "1527": "Transhipment Fees",
  "1524": "Manifest transhipment td fee",
};

export async function POST(req: NextRequest) {
  try {
    const body: {
      ref_no: string;
      items: {
        type: string;
        hscode: string;
        description: string;
        quantity: string | number;
        value: string | number;
        currency: string;
      }[];
      compute_assessments: boolean;
    } = await req.json();

    // Convert quantity and value to numbers
    const items = body.items.map((item) => ({
      ...item,
      quantity: Number(item.quantity),
      value: Number(item.value),
    }));

    body.items = items;

    console.log("Transformed data:", body);

    const results = await fetch(
      "https://kratest.pesaflow.com/api/customs/passenger-declaration",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!results.ok) {
      const errorText = await results.text();
      console.error(
        "Error response from external API:",
        results.status,
        errorText
      );
      throw new Error(`External API error: ${results.status} - ${errorText}`);
    }

    const data: Declaration = await results.json();

    // --- 1. CALCULATE TOTAL TAX ---
    let totalTax = 0;
    if (data.assesments && Array.isArray(data.assesments)) {
      data.assesments.forEach((assessment) => {
        totalTax += parseFloat(assessment.tax_amount);
      });
    }
    console.log("Total Tax Calculated:", totalTax);

    // --- 2. FORMAT DATA (Grouped & Short) ---
    let formattedData = "";

    if (data.assesments && Array.isArray(data.assesments)) {
      // A. Create a dictionary to group taxes by Item ID
      const groupedByItem: Record<string, string[]> = {};

      data.assesments.forEach((assessment) => {
        // Fallback to 'General' if ID is missing
        const itemId = assessment.metadata.f88ItemId ?? "General";

        if (!groupedByItem[itemId]) {
          groupedByItem[itemId] = [];
        }
        // Format: "TaxType: Amount" (Compact)
        // Replace tax code with tax name if available
        const code = assessment.tax_type;
        const taxName = TAX_MAP[code] ?? code; // fallback to code if missing

        groupedByItem[itemId].push(`${taxName}: ${assessment.tax_amount}`);
      });

      // B. Convert dictionary to a clean string
      // Result: "Item #1: Import Duty: 500, VAT: 200"
      formattedData = Object.entries(groupedByItem)
        .map(([id, taxes]) => `Item #${id}: ${taxes.join(", ")}`)
        .join("\n");
    }

    console.log("Formatted Assessment Data:\n", formattedData);

    return NextResponse.json(
      { message: "Success", data, totalTax, formattedData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during create entity process:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// https://kratest.pesaflow.com/api/customs/passenger-declaration
