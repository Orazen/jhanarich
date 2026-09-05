import { prisma } from "@/lib/db";
import EnquiriesClient from "@/components/EnquiriesClient";

export const dynamic = "force-dynamic";

export default async function AdminEnquiries() {
  const enquiries = await prisma.enquiry.findMany({ orderBy: { createdAt: "desc" } });
  return <EnquiriesClient enquiries={JSON.parse(JSON.stringify(enquiries))} />;
}
