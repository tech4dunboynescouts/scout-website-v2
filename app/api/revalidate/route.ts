import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");

  if (!process.env.SANITY_REVALIDATE_SECRET || secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Revalidate layout + home tree so nav and route visibility updates appear quickly.
  revalidatePath("/", "layout");
  revalidatePath("/");

  return NextResponse.json({ ok: true, revalidated: true });
}
