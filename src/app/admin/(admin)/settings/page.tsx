import { getSiteSettings } from "@/actions/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  const settings = await getSiteSettings();
  return <SettingsForm initialData={settings} />;
}
