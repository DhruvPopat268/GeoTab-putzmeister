const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function getEquipments(page = 1) {
  const res = await fetch(`${BACKEND_URL}/api/equipments/${page}`);
  if (!res.ok) throw new Error("Failed to fetch equipments");
  return res.json();
}
