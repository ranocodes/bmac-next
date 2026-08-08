import { getSiteSettings } from "@/actions/settings";
import { requirePage } from "@/lib/auth/server";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  await requirePage("access_settings");
  const settings = await getSiteSettings();
  return <SettingsForm initialData={settings} />;
}
