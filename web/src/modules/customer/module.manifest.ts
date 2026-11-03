import { defineModuleManifest } from "@/core/modules/types";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import GitBranch from "lucide-react/dist/esm/icons/git-branch";
import Users from "lucide-react/dist/esm/icons/users";

/**
 * Manifest modul Customer.
 *
 * Tiga menu terpisah (H12=c): /admin/customer, /admin/customer/branch,
 * /admin/customer/staff. String UI memakai namespace "module-customer"
 * (lihat src/services/i18n/locales/<lang>/module-customer.json).
 *
 * dashboardWidgets sengaja kosong — widget lama memakai endpoint yang sudah
 * tidak ada.
 */
export default defineModuleManifest({
  alias: "customer",
  menu: [
    {
      slug: "customer",
      label: { namespace: "module-customer", key: "menu.customer" },
      href: "/admin/customer",
      position: 100,
      permission: "read:customer",
      icon: Building2,
    },
    {
      slug: "branch",
      label: { namespace: "module-customer", key: "menu.branch" },
      href: "/admin/customer/branch",
      position: 101,
      permission: "read:branch",
      icon: GitBranch,
    },
    {
      slug: "staff",
      label: { namespace: "module-customer", key: "menu.staff" },
      href: "/admin/customer/staff",
      position: 102,
      permission: "read:staff",
      icon: Users,
    },
  ],
  dashboardWidgets: [],
});
