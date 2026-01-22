import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase/admin";

export async function GET() {
    try {
        // Sử dụng email cố định để test update
        const dummyUser = {
            email: "debug_fix_test@example.com",
            name: "Debug User Fixed",
            provider: "google",
            provider_id: "debug_123_fixed",
            avatar_url: "https://example.com/avatar.jpg",
            is_active: true,
        };

        // FIX: Không dùng upsert nữa vì DB thiếu unique constraint
        // 1. Check xem có user chưa
        const { data: existingUser } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("email", dummyUser.email)
            .single();

        let error;
        let action;

        if (existingUser) {
            // 2. Nếu có rồi thì Update
            action = "Update";
            const res = await supabaseAdmin
                .from("users")
                .update({
                    name: dummyUser.name,
                    provider: dummyUser.provider,
                    avatar_url: dummyUser.avatar_url,
                    is_active: true,
                })
                .eq("email", dummyUser.email);
            error = res.error;
        } else {
            // 3. Nếu chưa thì Insert
            action = "Insert";
            const res = await supabaseAdmin
                .from("users")
                .insert(dummyUser);
            error = res.error;
        }

        if (error) {
            return NextResponse.json({
                status: "Error",
                message: error.message,
                details: error,
            }, { status: 500 });
        }

        return NextResponse.json({
            status: "Success",
            message: `Đã xử lý thành công (${action}) - Logic mới đã hoạt động!`,
        });
    } catch (err: any) {
        return NextResponse.json({
            status: "Exception",
            message: err.message,
        }, { status: 500 });
    }
}
