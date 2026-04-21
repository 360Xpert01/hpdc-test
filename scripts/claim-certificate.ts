import "dotenv/config";
import { db } from "../lib/db/src";
import { certificatesTable } from "../lib/db/src/schema";
import { eq } from "drizzle-orm";

async function main() {
    const clerkId = process.argv[2];
    if (!clerkId) {
        console.error("Usage: npx tsx scripts/claim-certificate.ts <CLERK_ID>");
        process.exit(1);
    }

    console.log(`Assigning first available certificate to Clerk ID: ${clerkId}`);

    const certs = await db.select().from(certificatesTable).limit(1);
    if (certs.length === 0) {
        console.error("No certificates found in database. Please run the API server once to seed the database.");
        process.exit(1);
    }

    const certId = certs[0].certificateId;
    await db.update(certificatesTable)
        .set({ companyClerkId: clerkId })
        .where(eq(certificatesTable.certificateId, certId));

    console.log(`Successfully assigned certificate ${certId} to ${clerkId}`);
}

main().catch(console.error);
