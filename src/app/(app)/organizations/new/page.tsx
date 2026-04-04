import { OrganizationForm } from "@/components/forms/organization-form";

export default function NewOrganizationPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">New Organization</h1>
      <OrganizationForm />
    </div>
  );
}
