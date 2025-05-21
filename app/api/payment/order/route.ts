// /app/api/payment/order/route.ts
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  const { amount, submissionId } = await req.json();

  try {
    const options = {
      amount: amount * 100, // ₹100 becomes 10000 paise
      currency: "INR",
      receipt: submissionId,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
  }
}
