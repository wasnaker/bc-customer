import { defineModuleManifest } from "@/core/modules/types";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import { CustomerPage } from "./pages/customer-page";
import { BranchPage } from "./pages/branch-page";
import { StaffPage } from "./pages/staff-page";
import { MyCompanyTab } from "./pages/my-customer-page";

/**
 * Customer owns its admin pages and navigation. The host only resolves the
 * declared canonical paths and applies its shared admin authentication.
 */
export default defineModuleManifest({
  alias: "customer",
  profileTabs: [
    {
      slug: "my-company",
      label: { namespace: "module-customer", key: "myCompany.tabTitle" },
      position: 30,
      icon: Building2,
      permission: null,
      content: { kind: "component", component: MyCompanyTab },
    },
  ],
  pages: [
    {
      path: "/admin/customer",
      component: CustomerPage,
      title: { namespace: "module-customer", key: "customer.title" },
      permission: "read:customer",
    },
    {
      path: "/admin/customer/branch",
      component: BranchPage,
      title: { namespace: "module-customer", key: "branch.title" },
      permission: null,
    },
    {
      path: "/admin/customer/staff",
      component: StaffPage,
      title: { namespace: "module-customer", key: "staff.title" },
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
          permission: null,
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
