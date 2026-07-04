import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Verify minimum required fields
    if (!data.name || !data.email) {
      return NextResponse.json(
        { success: false, error: "Name and Email are required." },
        { status: 400 }
      );
    }

    // 1. Write to inquiries.json
    const jsonPath = path.resolve("C:/marketing/inquiries.json");
    let inquiries = [];
    if (fs.existsSync(jsonPath)) {
      const fileData = fs.readFileSync(jsonPath, "utf-8");
      try {
        inquiries = JSON.parse(fileData);
      } catch (e) {
        // Safe reset if corrupted
        inquiries = [];
      }
    }
    
    // Add new submission structure
    const newEntry = {
      name: data.name || "",
      business: data.business || "",
      email: data.email || "",
      phone: data.phone || "",
      package: data.package || "",
      service: data.service || "",
      message: data.message || "",
      url: "/api/inquiry",
    };

    inquiries.push(newEntry);
    fs.writeFileSync(jsonPath, JSON.stringify(inquiries, null, 2), "utf-8");

    // 2. Append to inquiries.csv
    const csvPath = path.resolve("C:/marketing/inquiries.csv");
    // Escaping quotes in fields for CSV safety
    const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const csvLine = `${escapeCsv(newEntry.name)},${escapeCsv(newEntry.business)},${escapeCsv(newEntry.email)},${escapeCsv(newEntry.phone)},${escapeCsv(newEntry.package)},${escapeCsv(newEntry.service)},${escapeCsv(newEntry.message)},"/api/inquiry"\n`;
    
    fs.appendFileSync(csvPath, csvLine, "utf-8");

    return NextResponse.json({ success: true, message: "Inquiry registered successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
