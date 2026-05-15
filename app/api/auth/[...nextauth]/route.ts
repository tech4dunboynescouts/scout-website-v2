import { handlers } from "@/auth"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const { GET: authGet, POST } = handlers

export async function GET(request: NextRequest) {
	const url = new URL(request.url)

	// Some mobile in-app browsers can return a non-canonical issuer value
	// ("accounts.google.com") in the OAuth callback. Normalize it to the
	// canonical OIDC issuer expected by the Google provider.
	if (url.pathname.endsWith("/api/auth/callback/google")) {
		const callbackIssuer = url.searchParams.get("iss")
		if (callbackIssuer === "accounts.google.com") {
			url.searchParams.set("iss", "https://accounts.google.com")
			return NextResponse.redirect(url)
		}
	}

	return authGet(request)
}

export { POST }
