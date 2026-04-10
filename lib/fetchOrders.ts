export type OrderStatus =
  | "Artwork Ready"
  | "Processing"
  | "Work in Progress"
  | string;

export interface Order {
  orderItemId: string;
  customerName: string;
  customerNumber: string;
  productName: string;
  sku: string;
  variantDetails: string;
  latestStatus: string;
  image: string;
  amountPaid: number;
  amountDue: number;
  total: number;
  processManager: string;
  shipment: string;
  epd: string;
  edd: string;
  artists: string;
  createdAt: string;
  deliveryDate: string;
}

export interface OrdersResponse {
  orders: Order[];
  totalCount: number;
  page: number;
  limit: number;
}

const STATUS_URL_MAP: Record<string, string> = {
  "artwork-ready":
    "https://api.buttistore.com/api/orders/all-orders?page={page}&limit={limit}&promo=false&status[]=Artwork+Ready&sortBy=createdAt&sortByAscDec=-1",
  processing:
    "https://api.buttistore.com/api/orders/all-orders?page={page}&limit={limit}&promo=false&status[]=Processing&sortBy=createdAt&sortByAscDec=-1",
  wip: "https://api.buttistore.com/api/orders/all-orders?page={page}&limit={limit}&promo=false&status[]=Work+in+Progress&sortBy=createdAt&sortByAscDec=-1",
  new: "https://api.buttistore.com/api/orders/all-orders?page={page}&limit={limit}&promo=false&status[]=Ordered&status[]=Info+Pending&status[]=Image+Pending&sortBy=createdAt&sortByAscDec=-1",
};

export async function fetchOrdersFromAPI(
  type: string,
  page = 1,
  limit = 10
): Promise<OrdersResponse> {
  const token = process.env.AUTH_TOKEN;
  // Log token presence securely without leaking full token
  console.log("Calling External API with token:", token ? "Present" : "Missing");
  if (!token) throw new Error("AUTH_TOKEN not set in .env.local");

  const urlTemplate = STATUS_URL_MAP[type];
  if (!urlTemplate) throw new Error(`Unknown order type: ${type}`);

  const url = urlTemplate
    .replace("{page}", String(page))
    .replace("{limit}", String(limit));

  // Ensure we don't double append "authorization=Bearer" if it's already in .env
  const cookieValue = token.startsWith("authorization=Bearer")
    ? token
    : `authorization=Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, {
      headers: {
        Cookie: cookieValue,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
  } catch (err: any) {
    console.error("Network error when hitting external API:", err.message);
    throw new Error("Failed to reach external API");
  }

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`External API Failed (${res.status}):`, errorText);
    throw new Error(`External API error: ${res.status} ${res.statusText}`);
  }

  const raw = await res.json();

  // Flexible field resolution — adjust if the real API uses different keys
  const rawOrders: any[] = raw?.orders ?? raw?.data ?? raw?.items ?? [];
  const totalCount: number =
    raw?.totalCount ?? raw?.total ?? raw?.count ?? rawOrders.length;

  const orders: Order[] = rawOrders.map((o: any) => {
    const statusArr: any[] = Array.isArray(o.status) ? o.status : [];
    const latestStatus =
      statusArr.length > 0
        ? typeof statusArr[statusArr.length - 1] === "string"
          ? statusArr[statusArr.length - 1]
          : statusArr[statusArr.length - 1]?.status ?? "Unknown"
        : o.latestStatus ?? "Unknown";

    let image = o.image ?? o.productImage ?? "";
    if (!image && Array.isArray(o.imagesFile) && o.imagesFile.length > 0) {
      const nonPdf = o.imagesFile.find((url: any) => typeof url === 'string' && !url.toLowerCase().includes('.pdf'));
      image = nonPdf ?? (typeof o.imagesFile[0] === 'string' ? o.imagesFile[0] : "");
    }

    return {
      orderItemId: o.orderItemId ?? o._id ?? "",
      customerName: o.customerName ?? o.customer?.name ?? "",
      customerNumber: o.customerNumber ?? o.customer?.phone ?? "",
      productName: o.productName ?? o.product?.name ?? "",
      sku: o.sku ?? "",
      variantDetails: o.variantDetails ?? o.variant ?? "",
      latestStatus,
      image,
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

  return { orders, totalCount, page, limit };
}
