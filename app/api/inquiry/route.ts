import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.name || !data.email) {
      return NextResponse.json(
        { success: false, error: "Name and Email are required." },
        { status: 400 }
      );
    }

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

    const supabase = getSupabaseClient();

    if (supabase) {
      const { error } = await supabase.from("inquiries").insert([newEntry]);

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message || "Unable to save inquiry to Supabase." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: "Inquiry registered successfully" });
    }

    const jsonPath = path.resolve("C:/marketing/inquiries.json");
    let inquiries = [];
    if (fs.existsSync(jsonPath)) {
      const fileData = fs.readFileSync(jsonPath, "utf-8");
      try {
        inquiries = JSON.parse(fileData);
      } catch {
        inquiries = [];
      }
    }

    inquiries.push(newEntry);
    fs.writeFileSync(jsonPath, JSON.stringify(inquiries, null, 2), "utf-8");

    const csvPath = path.resolve("C:/marketing/inquiries.csv");
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
