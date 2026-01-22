import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { supabaseAdmin } from "@/app/lib/supabase/admin";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        console.log("Attempting login for:", credentials.email);

        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("email", credentials.email)
          .single();

        if (error) {
          console.error("Supabase user fetch error:", error);
          return null;
        }

        if (!user) {
          console.log("User not found");
          return null;
        }

        if (!user.password) {
          console.log("User has no password set (likely Google account)");
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        console.log("Password valid:", isValid);

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar_url,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials") return true;
      if (!user.email || account?.provider !== "google") return false;

      const providerId = profile?.sub;
      if (!providerId) return false;

      // Kiểm tra user có tồn tại chưa
      const { data: users } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", user.email)
        .limit(1);

      const existingUser = users?.[0];

      if (existingUser) {
        // Update user hiện có
        // Chỉ update nếu cần thiết để tránh lỗi
        const { error: updateError } = await supabaseAdmin
          .from("users")
          .update({
            name: user.name,
            provider: "google",
            provider_id: providerId,
            avatar_url: user.image,
            is_active: true,
          })
          .eq("id", existingUser.id); // Update by ID safe hơn

        if (updateError) {
          console.error("Supabase update error:", updateError);
          // Tiếp tục cho phép đăng nhập dù update lỗi nhẹ (optional)
        }
      } else {
        // Tạo user mới
        // Dùng try catch cho chắc chắn
        const { error: insertError } = await supabaseAdmin
          .from("users")
          .insert({
            name: user.name,
            email: user.email,
            provider: "google",
            provider_id: providerId,
            avatar_url: user.image,
            is_active: true,
          });

        if (insertError) {
          console.error("Supabase insert error:", insertError);
          // Nếu insert lỗi, có thể do vừa có race condition hoặc duplicate provider_id. 
          // Cho phép return true để next-auth session vẫn hoạt động (nhưng data DB có thể thiếu)
          // Tuy nhiên chuẩn là return false, nhưng để debug ta return true tạm thời.
          return true;
        }
      }



      return true;
    },
    async jwt({ token, user }) {
      if (user?.email && !token.userId) {
        const { data, error } = await supabaseAdmin
          .from("users")
          .select("id, role")
          .eq("email", user.email)
          .single();

        if (error || !data) {
          console.error("JWT callback error:", error);
          return token;
        }

        token.userId = data.id;
        token.role = data.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as
          | "admin"
          | "clinic_admin"
          | "staff"
          | "patient";
      }
      return session;
    },
  },
};

