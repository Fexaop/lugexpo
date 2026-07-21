import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function backendBase(): string {
  return (process.env.BACKEND_URL || "http://127.0.0.1:8080").replace(/\/$/, "");
}

async function proxy(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const target = `${backendBase()}/api/${path.join("/")}${req.nextUrl.search}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const accept = req.headers.get("accept");
  if (accept) headers.set("accept", accept);

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
    redirect: "manual",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  try {
    const upstream = await fetch(target, init);
    const body = await upstream.arrayBuffer();
    const out = new NextResponse(body, { status: upstream.status });
    const ct = upstream.headers.get("content-type");
    if (ct) out.headers.set("content-type", ct);
    return out;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Upstream request failed";
    return NextResponse.json(
      { msg: `Cannot reach pwncore at ${backendBase()}: ${message}` },
      { status: 502 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
