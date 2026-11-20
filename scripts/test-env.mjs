const TEST_ENV_DEFAULTS = {
  NEXT_PUBLIC_API_PREFIX: "api",
  NEXT_PUBLIC_API_URL: "http://localhost:3100",
  NEXT_PUBLIC_APP_NAME: "Personal OS",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
  NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
  NEXT_PUBLIC_URL: "http://localhost:3000",
}

for (const [key, value] of Object.entries(TEST_ENV_DEFAULTS)) {
  process.env[key] ??= value
}
