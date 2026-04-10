import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = process.env.AUTH_TOKEN;
  if (!token) return NextResponse.json({ error: "AUTH_TOKEN not set" }, { status: 401 });

  const cookieValue = token.startsWith("authorization=Bearer")
    ? token
    : `authorization=Bearer ${token}`;

  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") ?? "1";
  const limit = searchParams.get("limit") ?? "10";

  const url =
    `https://api.buttistore.com/api/orders/all-orders?page=${page}&limit=${limit}` +
    `&promo=false` +
    `&status[]=Processing` +
    `&status[]=Work+in+Progress` +
    `&status[]=Artwork+in+Progress` +
    `&sortBy=createdAt&sortByAscDec=-1`;

  try {
    const res = await fetch(url, {
      headers: {
        Cookie: cookieValue,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Active orders API error:", res.status, text);
      return NextResponse.json(
        { error: `External API error: ${res.status}` },
        { status: res.status }
      );
    }

    const raw = await res.json();

    const rawOrders: any[] = raw?.orders ?? raw?.data ?? raw?.items ?? [];
    const totalCount: number =
      raw?.totalCount ?? raw?.total ?? raw?.count ?? rawOrders.length;

    const orders = rawOrders.map((o: any) => {
      const statusArr: any[] = Array.isArray(o.status) ? o.status : [];
      const latestStatus =
        statusArr.length > 0
          ? typeof statusArr[statusArr.length - 1] === "string"
            ? statusArr[statusArr.length - 1]
            : (statusArr[statusArr.length - 1]?.status ?? "Unknown")
          : (o.latestStatus ?? "Unknown");

      return {
        orderItemId: o.orderItemId ?? o._id ?? "",
        customerName: o.customerName ?? o.customer?.name ?? "",
        customerNumber: o.customerNumber ?? o.customer?.phone ?? "",
        productName: o.productName ?? o.product?.name ?? "",
        sku: o.sku ?? "",
        variantDetails: o.variantDetails ?? o.variant ?? "",
        latestStatus,
        image: o.image ?? o.productImage ?? "",
        amountPaid: Number(o.amountPaid ?? 0),
        amountDue: Number(o.amountDue ?? 0),
        total: Number(o.total ?? 0),
        processManager: o.processManager ?? "",
        shipment: o.shipment ?? o.shipmentStatus ?? "",
        epd: o.epd ?? o.estimatedProductionDate ?? "",
        edd: o.edd ?? o.estimatedDeliveryDate ?? "",
        artists: o.artists ?? "",
        createdAt: o.createdAt ?? "",
        deliveryDate: o.deliveryDate ?? "",
      };
    });

    return NextResponse.json({ orders, totalCount, page: Number(page), limit: Number(limit) });
  } catch (e: any) {
    console.error("Active orders fetch error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
