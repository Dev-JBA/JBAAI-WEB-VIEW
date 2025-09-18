import api from "./http";
import { url_get_package_by_type } from "./constants";

export type PackageItem = { id: string; name: string; price: number };

export async function getPackagesByType(type: string): Promise<PackageItem[]> {
  const res = await api.get(url_get_package_by_type(), { params: { type } });
  return res.data?.items ?? [];
}
