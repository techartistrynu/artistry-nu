import { NextRequest, NextResponse } from "next/server";
import { updateAdminPasswordByEmail } from "@/lib/firebase/api/admin";

export async function PUT(request: NextRequest) {
  try {
    const { email, currentPassword, newPassword } = await request.json();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Email, current password, and new password are required" },
        { status: 400 }
      );
    }

    // Update the password
    await updateAdminPasswordByEmail(email, currentPassword, newPassword);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
} 