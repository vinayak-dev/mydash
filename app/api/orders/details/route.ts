import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  if (!id) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  const token = process.env.AUTH_TOKEN;
  if (!token) return NextResponse.json({ error: "No auth token" }, { status: 401 });

  const cookieValue = token.startsWith("authorization=Bearer")
    ? token
    : `authorization=Bearer ${token}`;

  try {
    const res = await fetch(`https://api.buttistore.com/api/orders/orderItem/${id}`, {
      headers: {
        Cookie: cookieValue,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Details API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  if (!id) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  const token = process.env.AUTH_TOKEN;
  if (!token) return NextResponse.json({ error: "No auth token" }, { status: 401 });

  const cookieValue = token.startsWith("authorization=Bearer")
    ? token
    : `authorization=Bearer ${token}`;

  try {
    const body = await request.json();
    
    const res = await fetch(`https://api.buttistore.com/api/orders/orderItem/${id}`, {
      method: "PUT",
      headers: {
        Cookie: cookieValue,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Details Update API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
