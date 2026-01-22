import { supabaseAdmin } from "@/app/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const clinic_id = searchParams.get("clinic_id");
        const service_id = searchParams.get("service_id");

        if (!clinic_id || !service_id) {
            return NextResponse.json([], { status: 400 });
        }

        // Select * to avoid column name errors (e.g. name vs full_name)
        // We still join correctly
        const { data, error } = await supabaseAdmin
            .from("doctors")
            .select("*, users!inner(name), doctor_services!inner(service_id)")
            .eq("clinic_id", clinic_id)
            .eq("is_available", true)
            .eq("doctor_services.service_id", service_id);

        if (error) {
            console.error("Supabase Error fetching doctors:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const doctors = data?.map((doc: any) => ({
            ...doc,
            name: doc.users?.name || "Bác sĩ",
        }));

        return NextResponse.json(doctors ?? []);
    } catch (e) {
        console.error("Internal Server Error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
