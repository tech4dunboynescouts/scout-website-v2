const configuredSiteUrl =
	process.env.NEXT_PUBLIC_SITE_URL ??
	"https://1stmeathdunboynescouts.ie";

export const siteUrl = configuredSiteUrl.replace(/\/+$/, "");
