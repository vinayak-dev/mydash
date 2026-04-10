import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = process.env.AUTH_TOKEN;
  if (!token) return NextResponse.json({ error: "No auth token" }, { status: 401 });

  const cookieValue = token.startsWith("authorization=Bearer")
    ? token
    : `authorization=Bearer ${token}`;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  
  if (!id) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  try {
    let apiUrl = `https://api.buttistore.com/api/orders/overview?id=${id}`;
    if (startDate) apiUrl += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) apiUrl += `&endDate=${encodeURIComponent(endDate)}`;

    const res = await fetch(apiUrl, {
      headers: {
        Cookie: cookieValue,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Overview API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
