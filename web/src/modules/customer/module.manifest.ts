import { defineModuleManifest } from "@/core/modules/types";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import GitBranch from "lucide-react/dist/esm/icons/git-branch";
import Users from "lucide-react/dist/esm/icons/users";

/**
 * Manifest modul Customer.
 *
 * Menu: 1 induk "Customer" collapsible dengan 3 anak — /admin/customer,
 * /admin/customer/branch, /admin/customer/staff. Parent tanpa permission
 * eksplisit → tampil bila minimal satu anak lolos filter permission user.
 * String UI memakai namespace "module-customer" (lihat
 * src/services/i18n/locales/<lang>/module-customer.json).
 *
 * dashboardWidgets sengaja kosong — widget lama memakai endpoint yang sudah
 * tidak ada.
 */
export default defineModuleManifest({
  alias: "customer",
  menu: [
    {
      slug: "customer",
      label: { namespace: "module-customer", key: "menu.parent" },
      href: "/admin/customer",
      position: 100,
      icon: Building2,
      children: [
        {
          slug: "customers",
          label: { namespace: "module-customer", key: "menu.customer" },
          href: "/admin/customer",
          position: 1,
          permission: "read:customer",
        },
        {
          slug: "branch",
          label: { namespace: "module-customer", key: "menu.branch" },
          href: "/admin/customer/branch",
          position: 2,
          permission: "read:branch",
        },
        {
          slug: "staff",
          label: { namespace: "module-customer", key: "menu.staff" },
          href: "/admin/customer/staff",
          position: 3,
          permission: "read:staff",
        },
      ],
    },
  ],
  dashboardWidgets: [],
});
