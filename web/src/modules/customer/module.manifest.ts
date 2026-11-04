import { defineModuleManifest } from "@/core/modules/types";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import GitBranch from "lucide-react/dist/esm/icons/git-branch";
import Users from "lucide-react/dist/esm/icons/users";
import { CustomerPage } from "./pages/customer-page";
import { BranchPage } from "./pages/branch-page";
import { StaffPage } from "./pages/staff-page";

/**
 * Customer owns its admin pages and navigation. The host only resolves the
 * declared canonical paths and applies its shared admin authentication.
 */
export default defineModuleManifest({
  alias: "customer",
  pages: [
    {
      path: "/admin/customer",
      component: CustomerPage,
      permission: "read:customer",
    },
    {
      path: "/admin/customer/branch",
      component: BranchPage,
      permission: "read:branch",
    },
    {
      path: "/admin/customer/staff",
      component: StaffPage,
      permission: "read:staff",
    },
  ],
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
