import { getSiteSettings } from "../../lib/server-data";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const site = await getSiteSettings();
  return (
    <HeaderClient navLinks={site.navLinks} contactEmail={site.contactEmail} />
  );
}
