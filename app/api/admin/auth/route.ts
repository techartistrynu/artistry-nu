import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials, createAdminAccount, getAllAdmins } from "@/lib/firebase/api/admin";

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json();

    if (action === "login") {
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }

      const admin = await verifyAdminCredentials(email, password);
      
      if (!admin) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          lastLoginAt: admin.lastLoginAt
        }
      });
    }

    if (action === "create") {
      const { name, role } = await request.json();
      
      if (!email || !password || !name) {
        return NextResponse.json(
          { error: "Email, password, and name are required" },
          { status: 400 }
        );
      }

      const admin = await createAdminAccount(email, password, name, role);
      
      return NextResponse.json({
        success: true,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          createdAt: admin.createdAt
        }
      });
    }

    if (action === "list") {
      const admins = await getAllAdmins();
      
      return NextResponse.json({
        success: true,
        admins: admins.map(admin => ({
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          createdAt: admin.createdAt.toISOString(),
          updatedAt: admin.updatedAt.toISOString(),
          lastLoginAt: admin.lastLoginAt?.toISOString()
        }))
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 