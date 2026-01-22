import { supabaseAdmin } from "@/app/lib/supabase/admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { phone, appointmentDate } = body;

    const datePart = appointmentDate; // YYYY-MM-DD

    const { data: existingBooking } = await supabaseAdmin
        .from("bookings")
        .select("id")
        .eq("patient_phone", phone)
        .gte("booking_time", `${datePart}T00:00:00`)
        .lte("booking_time", `${datePart}T23:59:59`)
        // Chặn nếu đã thanh toán hoặc đang chờ thanh toán (paid/pending).
        .in("status", ["paid", "pending"])
        .maybeSingle();

    if (existingBooking) {
        return NextResponse.json(
            { error: "Số điện thoại này đã có lịch đặt chưa khám trong ngày hôm nay." },
            { status: 400 }
        );
    }

    return NextResponse.json({ valid: true });
}
