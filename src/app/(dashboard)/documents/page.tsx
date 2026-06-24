import { DocumentsClient } from "@/components/documents/DocumentsClient";

export const metadata = {
  title: "Documents | JobOS",
  description: "Store and organize your career-related files securely",
};

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <DocumentsClient />
    </div>
  );
}
