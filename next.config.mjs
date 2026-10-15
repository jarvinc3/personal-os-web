import { readFileSync } from "node:fs"
import { createRequire as sideroomCreateRequire } from "node:module"

const sideroomRequire = sideroomCreateRequire(import.meta.url)

// The runtime entry does not expose withSentryConfig; the build helper lives
// in the `./config` subpath and ships as CommonJS.
const { withSentryConfig } = sideroomRequire("@sentry/nextjs/config")

// Resolve the loader only inside development so a production install without
// devDependencies never loads it.
function sideroomLoader() {
  return sideroomRequire.resolve("@code-inspector/webpack/dist/loader.js")
}

function sideroomSourceLocationsRule() {
  return {
    test: /\.(jsx|tsx|js|ts|mjs|mts|vue|svelte)$/,
    exclude: /node_modules/,
    enforce: "pre",
    use: [
      {
        loader: sideroomLoader(),
        options: { pathType: "absolute" },
      },
    ],
  }
}

function sideroomTurbopackRule() {
  return {
    loaders: [
      {
        loader: sideroomLoader(),
        options: { pathType: "absolute" },
      },
    ],
  }
}

function sideroomSourceLocationsPlugin() {
  return {
    apply(compiler) {
      if (compiler.options.mode !== "development") {
        return
      }
      compiler.options.module ??= {}
      compiler.options.module.rules ??= []
      compiler.options.module.rules.unshift(sideroomSourceLocationsRule())
    },
  }
}

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8")
)

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "img.logo.dev",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
    ],
  },

  webpack(config, { dev }) {
    if (dev) {
      config.plugins.unshift(sideroomSourceLocationsPlugin())
    }
    return config
  },

  turbopack: {
    rules:
      process.env.NODE_ENV === "development"
        ? { "**/*.{jsx,tsx,js,ts,mjs,mts}": sideroomTurbopackRule() }
        : {},
  },
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  // Source maps upload only when a token is present; without one the build
  // keeps going and no release is created.
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN?.trim(),
  },
})
