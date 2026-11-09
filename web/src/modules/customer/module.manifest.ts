import { defineModuleManifest } from "@/core/modules/types";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import { CustomerPage } from "./pages/customer-page";
import { BranchPage } from "./pages/branch-page";
import { StaffPage } from "./pages/staff-page";
import { MyCompanyTab, MyBranchTab, MyStaffTab } from "./pages/my-customer-page";
import {
  BranchStatusColumnExtension,
  BranchDetailMetadataExtension,
  BranchCodeFormExtension,
} from "./components/branch-extension-slots";

/** Customer owns its admin pages and navigation; each capability is independently permission-gated. */
export default defineModuleManifest({
  alias: "customer",
  runtimeManaged: true,
  profileTabs: [
    { slug: "my-company", label: { namespace: "module-customer", key: "myCompany.tabTitle" }, position: 30, icon: Building2, permission: "read:my-customer-company", content: { kind: "component", component: MyCompanyTab } },
    { slug: "my-branch", label: { namespace: "module-customer", key: "myBranch.tabTitle" }, position: 31, icon: Building2, permission: "read:my-customer-branch", content: { kind: "component", component: MyBranchTab } },
    { slug: "my-staff", label: { namespace: "module-customer", key: "myStaff.tabTitle" }, position: 32, icon: Building2, permission: "read:my-customer-staff", content: { kind: "component", component: MyStaffTab } },
  ],
  pages: [
    { path: "/admin/customer", component: CustomerPage, title: { namespace: "module-customer", key: "customer.title" }, permission: "read:customer" },
    { path: "/admin/customer/branch", component: BranchPage, title: { namespace: "module-customer", key: "branch.title" }, permission: "read:branch" },
    { path: "/admin/customer/staff", component: StaffPage, title: { namespace: "module-customer", key: "staff.title" }, permission: "read:staff" },
  ],
  // Customer administration is intentionally not exposed in the sidebar for any role.
  // Customer information is surfaced through the permission-gated Profile tabs.
  menu: [],
  dashboardWidgets: [],
  extensions: [
    {
      id: "branch.status-column",
      slot: "table.columns",
      target: "customer.branch.list",
      component: BranchStatusColumnExtension,
      position: 80,
      permission: "read:branch",
    },
    {
      id: "branch.detail-metadata",
      slot: "detail.panels",
      target: "customer.branch.list",
      component: BranchDetailMetadataExtension,
      position: 80,
      permission: "read:branch",
    },
    {
      id: "branch.code-form-field",
      slot: "form.fields",
      target: "customer.branch.form",
      component: BranchCodeFormExtension,
      position: 90,
      permission: "update:branch",
    },
  ],
});
