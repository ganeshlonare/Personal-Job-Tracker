import ColdMailsClient from "@/components/cold-mails/ColdMailsClient";
import { getColdMails } from "@/actions/cold-mail.actions";

export const metadata = {
  title: "Cold Mails | JobOS",
  description: "Track your cold emails and outreach campaigns",
};

export default async function ColdMailsPage() {
  const mails = await getColdMails();
  
  return (
    <div className="space-y-6">
      <ColdMailsClient initialMails={mails} />
    </div>
  );
}
