"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";


// Service URL mappings - maps service names to their external URLs
// {{phone}} will be replaced with the actual phone number of the user
const SERVICE_URLS: Record<string, string> = {
  // https://ecitizen-test.kra.go.ke/etims/?phone=254702438822
  // eTIMS Invoicing
  "Sales Invoice": "/etims/sales-invoice/buyer?phone={{phone}}",
  "Credit Note": "/etims/credit-note/search?phone={{phone}}",
  "Buyer-Initiated Invoices": "/etims/buyer-initiated/buyer/create?phone={{phone}}",

};

// Service categories with clearer labels
const SERVICE_CATEGORIES = [
  {
    title: "PIN Services",
    items: [
      { label: "Register PIN", key: "PIN Registration" },
      { label: "Retrieve PIN", key: "PIN Retrieve" },
      { label: "Change Details", key: "PIN Change" },
      { label: "Update iTax", key: "PIN Update" },
      { label: "Reactivate", key: "PIN Reactivate" },
      { label: "Obligations", key: "PIN Obligations" },
    ],
  },
  {
    title: "Return Filing",
    items: [
      { label: "NIL Returns", key: "NIL Filing" },
      { label: "Rental Income", key: "MRI" },
      { label: "Turnover Tax", key: "TOT" },
      { label: "PAYE", key: "PAYE" },
      { label: "VAT", key: "VAT" },
      { label: "Partnership", key: "Partnership" },
      { label: "Excise", key: "Excise" },
    ],
  },
  {
    title: "eTIMS Invoicing",
    items: [
      { label: "Sales Invoice", key: "Sales Invoice" },
      { label: "Credit Note", key: "Credit Note" },
      { label: "Buyer Invoice", key: "Buyer-Initiated Invoices" },
    ],
  },
  {
    title: "Tax Compliance",
    items: [
      { label: "Apply for TCC", key: "TCC Application" },
      { label: "Reprint TCC", key: "TCC Reprint" },
    ],
  },
  {
    title: "Customs",
    items: [
      { label: "F88 Declaration", key: "F88 Declaration" },
      { label: "TIMV Cert", key: "TIMV" },
      { label: "TEMV Cert", key: "TEMV" },
      { label: "Extend TIMV", key: "Extend TIMV" },
      { label: "Forms", key: "Forms" },
      { label: "Track Status", key: "Status" },
    ],
  },
  {
    title: "Payments",
    items: [
      { label: "eSlip Payment", key: "eSlip" },
      { label: "NITA Levy", key: "NITA" },
      { label: "Housing Levy", key: "AHL" },
    ],
  },
  {
    title: "Verification",
    items: [
      { label: "Check PIN", key: "PIN Check" },
      { label: "Check Invoice", key: "Invoice Check" },
      { label: "Check TCC", key: "TCC Check" },
      { label: "Check Staff", key: "Staff Check" },
      { label: "Find Station", key: "Station" },
      { label: "Import Cert", key: "Import Check" },
    ],
  },
  {
    title: "Other Services",
    items: [
      { label: "Refund Application", key: "Refund" },
      { label: "Report Fraud", key: "Report Fraud" },
      { label: "View All", key: "More" },
    ],
  },
];

import { saveKnownPhone } from "./etims/_lib/store";
import { Layout } from "./etims/_components/Layout";

function HomeContent() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const [toast, setToast] = useState<string | null>(null);

  // Persist phone number from URL to localStorage for other pages to access
  useEffect(() => {
    if (phone) {
      saveKnownPhone(phone);
    }
  }, [phone]);

  const handleServiceClick = async (serviceKey: string) => {
 
    const urlTemplate = SERVICE_URLS[serviceKey];

    if (urlTemplate) {
     
        // Direct navigation (eTIMS, F88, etc.)
        const url = urlTemplate.replace("{{phone}}", phone);
        window.location.href = url;
      
    } else {
     
       const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
       
       if (phone) {
         
           const message = `Connect to Agent`;
           window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
         
       }
    }
  };

  const isAvailable = (key: string) => key in SERVICE_URLS;

  return (
    <Layout title="KRA Services">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      {/* Service grid */}
      <div className="space-y-2.5">
        {SERVICE_CATEGORIES.map((category, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-100 p-2.5"
          >
            {/* Category header */}
            <div className="flex items-start gap-3">
              <span className="text-[10px] font-semibold text-gray-700 min-w-[90px] pt-1">
                {category.title}
              </span>

              {/* Service items */}
              <div className="flex flex-wrap gap-1.5 flex-1">
                {category.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={() => handleServiceClick(item.key)}
                    className={`px-2.5 py-0.8 text-[10px] font-medium rounded-md transition-colors ${
                      isAvailable(item.key)
                        ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                        : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-sm">
          Loading...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
