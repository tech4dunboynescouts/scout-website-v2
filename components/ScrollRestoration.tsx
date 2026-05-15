"use client";

import { useLayoutEffect } from "react";

/**
 * Disables browser scroll restoration synchronously before React hydration.
 * This must run before React hydration to reliably fix Android Chrome issues.
 */
export function ScrollRestoration() {
  useLayoutEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  return null;
}
