declare global {
  // eslint-disable-next-line no-var
  var __startupDiagnosticsRegistered: boolean | undefined
}

export async function register() {
  if (process.env.DEBUG_STARTUP_LOGS !== "1") return
  if (globalThis.__startupDiagnosticsRegistered) return
  globalThis.__startupDiagnosticsRegistered = true

  const isEdgeRuntime = typeof (globalThis as { EdgeRuntime?: unknown }).EdgeRuntime !== "undefined"
  let canUseProcessEvents = false

  try {
    canUseProcessEvents = typeof process?.on === "function"
  } catch {
    canUseProcessEvents = false
  }

  if (isEdgeRuntime || !canUseProcessEvents) {
    console.info("[startup] instrumentation register() called (edge)", {
      timestamp: new Date().toISOString(),
    })
    return
  }

  console.info("[startup] instrumentation register() called", {
    pid: process.pid,
    node: process.version,
    timestamp: new Date().toISOString(),
  })

  process.on("unhandledRejection", (reason) => {
    console.error("[startup] unhandledRejection", reason)
  })

  process.on("uncaughtException", (error) => {
    console.error("[startup] uncaughtException", error)
  })

  process.on("warning", (warning) => {
    console.warn("[startup] process warning", {
      name: warning.name,
      message: warning.message,
      stack: warning.stack,
    })
  })
}
