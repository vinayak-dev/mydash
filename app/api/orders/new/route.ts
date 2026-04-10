import { NextResponse } from "next/server";
import { fetchOrdersFromAPI } from "@/lib/fetchOrders";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    const data = await fetchOrdersFromAPI("new", page, limit);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
