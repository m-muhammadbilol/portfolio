// Run: node database/seed-password.js
// This generates the bcrypt hash for your admin password
// Copy the output and paste it into schema.sql or run directly in Supabase

const PASSWORD = "911266268" // Change this to your desired password

async function main() {
  const bcrypt = await import("bcryptjs")
  const hash = await bcrypt.hash(PASSWORD, 12)

  console.log("\n✅ Bcrypt hash for password:", PASSWORD)
  console.log("\nHash:", hash)
  console.log("\nSQL to insert admin user:")
  console.log(`INSERT INTO admin_users (username, password_hash)`)
  console.log(`VALUES ('muhammadbilol', '${hash}')`)
  console.log(`ON CONFLICT (username) DO UPDATE SET password_hash = '${hash}';`)
  console.log("")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
