import { getCompanies } from "@/actions/company.actions";
import { CompaniesClient } from "@/components/companies/CompaniesClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Companies — JobOS" };

export default async function CompaniesPage() {
  const companies = await getCompanies();
  return <CompaniesClient initialCompanies={companies} />;
}
