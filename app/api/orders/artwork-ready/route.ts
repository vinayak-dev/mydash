import { NextRequest, NextResponse } from "next/server";
import { fetchOrdersFromAPI } from "@/lib/fetchOrders";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);
    const data = await fetchOrdersFromAPI("artwork-ready", page, limit);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
