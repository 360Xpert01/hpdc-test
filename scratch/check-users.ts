import { db, usersTable } from "@workspace/db";

async function checkUsers() {
  const users = await db.select().from(usersTable);
  console.log("All Users in DB:");
  users.forEach(u => {
    console.log(`- ClerkID: ${u.clerkId}, Email: ${u.email}, Role: ${u.role}`);
  });
  process.exit(0);
}

checkUsers().catch(err => {
  console.error(err);
  process.exit(1);
});
