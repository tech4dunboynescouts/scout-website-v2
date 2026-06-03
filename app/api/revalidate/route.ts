import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!process.env.SANITY_REVALIDATE_SECRET || secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Revalidate layout and top-level route tree so nav + page visibility changes appear quickly.
  revalidatePath("/", "layout");
  revalidatePath("/");

  return NextResponse.json({ ok: true, revalidated: true });
}
