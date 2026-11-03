import { defineModuleManifest } from "@/core/modules/types";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import {
  ProvinceCountWidget,
  RegencyCountWidget,
} from "./components/dashboard-widgets";

/**
 * Manifest modul Customer.
 *
 * Modul ini menyediakan halaman admin di /admin/customer.
 * String UI memakai namespace "module-customer" (lihat
 * src/services/i18n/locales/<lang>/module-customer.json).
 */
export default defineModuleManifest({
  alias: "customer",
  menu: [
    {
      slug: "customer",
      label: { namespace: "module-customer", key: "menu" },
      href: "/admin/customer",
      position: 60,
      permission: "read:customer",
      icon: MapPin,
    },
  ],
  // Satu module dapat mendaftarkan beberapa widget sekaligus.
  // defaultVisible: konstanta statis modul — meng-override default true saat
  // global Settings › Misc › dashboardWidgetsEnabled = ON. Preferensi user
  // (toggle di toolbar dashboard) tetap menang atas nilai ini.
  dashboardWidgets: [
    {
      id: "customer-province-count",
      label: { namespace: "module-customer", key: "dashboard.provinces" },
      area: "summary",
      position: 60,
      permission: "read:customer",
      component: ProvinceCountWidget,
      defaultVisible: true,
    },
    {
      id: "customer-regency-count",
      label: { namespace: "module-customer", key: "dashboard.regencies" },
      area: "summary",
      position: 70,
      permission: "read:customer",
      component: RegencyCountWidget,
      defaultVisible: false,
    },
  ],
});
