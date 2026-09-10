export const CAPS = [400, 900, 1800];

export const ISSUE_TYPES = [
  { id: "paint", label: "Paint / walls" },
  { id: "floor", label: "Floor / carpet" },
  { id: "blind", label: "Blinds / rods" },
  { id: "light", label: "Lighting" },
  { id: "bath", label: "Bath hardware" },
  { id: "kitchen", label: "Kitchen" },
  { id: "clean", label: "Clean / trash-out" },
  { id: "safety", label: "Smoke / locks" },
  { id: "other", label: "Other" }
];

export const ROOMS = ["Living","Kitchen","Bath","Primary bed","Bed 2","Hall / entry","Laundry","Exterior"];

export const SKUS = [
  { id: "paint-gal", name: "Interior eggshell gallon", merchant: "Home Depot", price: 38, tags: ["paint"], cap: 400, affiliate: true },
  { id: "primer", name: "Stain-blocking primer", merchant: "Home Depot", price: 22, tags: ["paint"], cap: 400, affiliate: true },
  { id: "roller", name: "Roller + tray kit", merchant: "Home Depot", price: 16, tags: ["paint"], cap: 400, affiliate: true },
  { id: "patch", name: "Spackle + sanding sponge", merchant: "Home Depot", price: 12, tags: ["paint"], cap: 400, affiliate: true },
  { id: "caulk", name: "Kitchen & bath caulk", merchant: "Home Depot", price: 8, tags: ["bath", "kitchen"], cap: 400, affiliate: true },
  { id: "blinds-vinyl", name: "2-inch vinyl blinds", merchant: "Home Depot", price: 29, tags: ["blind"], cap: 400, affiliate: true, per: "window" },
  { id: "rod", name: "Tension or wrap rod", merchant: "Amazon", price: 18, tags: ["blind"], cap: 400, affiliate: true },
  { id: "bulb-6", name: "2700K LED 6-pack", merchant: "Amazon", price: 14, tags: ["light"], cap: 400, affiliate: true },
  { id: "shower-curtain", name: "Fabric shower curtain + liner", merchant: "Target", price: 24, tags: ["bath"], cap: 400, affiliate: true },
  { id: "shower-ring", name: "Shower rings", merchant: "Target", price: 6, tags: ["bath"], cap: 400, affiliate: true },
  { id: "toilet-seat", name: "Elongated toilet seat", merchant: "Home Depot", price: 28, tags: ["bath"], cap: 400, affiliate: true },
  { id: "bath-mat", name: "Washable bath mat", merchant: "Target", price: 16, tags: ["bath"], cap: 400, affiliate: true },
  { id: "smoke", name: "Smoke + CO combo", merchant: "Home Depot", price: 38, tags: ["safety"], cap: 400, affiliate: true },
  { id: "lockset", name: "Entry lockset", merchant: "Home Depot", price: 42, tags: ["safety"], cap: 400, affiliate: true },
  { id: "outlet", name: "Outlet / switch plates 10-pack", merchant: "Home Depot", price: 11, tags: ["light"], cap: 400, affiliate: true },
  { id: "cleaner", name: "Make-ready clean kit", merchant: "Amazon", price: 32, tags: ["clean"], cap: 400, affiliate: true },
  { id: "trash-bags", name: "Contractor bags", merchant: "Home Depot", price: 14, tags: ["clean"], cap: 400, affiliate: true },
  { id: "command", name: "Damage-free hooks 8-pack", merchant: "Amazon", price: 12, tags: ["other"], cap: 400, affiliate: true },
  { id: "paint-2", name: "Second gallon + trim enamel", merchant: "Home Depot", price: 54, tags: ["paint"], cap: 900, affiliate: true },
  { id: "blinds-cell", name: "Cordless cellular shade", merchant: "Blinds.com", price: 79, tags: ["blind"], cap: 900, affiliate: true, per: "window" },
  { id: "curtain-panel", name: "Room-darkening panels", merchant: "Target", price: 34, tags: ["blind"], cap: 900, affiliate: true },
  { id: "flush-mount", name: "Low-profile ceiling flush mount", merchant: "Home Depot", price: 48, tags: ["light"], cap: 900, affiliate: true },
  { id: "vanity-light", name: "3-light vanity bar", merchant: "Home Depot", price: 64, tags: ["light", "bath"], cap: 900, affiliate: true },
  { id: "faucet-bath", name: "Centerset bath faucet", merchant: "Home Depot", price: 79, tags: ["bath"], cap: 900, affiliate: true },
  { id: "faucet-kit", name: "Kitchen faucet", merchant: "Home Depot", price: 98, tags: ["kitchen"], cap: 900, affiliate: true },
  { id: "knobs", name: "Cabinet knobs 10-pack", merchant: "Amazon", price: 22, tags: ["kitchen"], cap: 900, affiliate: true },
  { id: "rug-5x7", name: "Low-pile 5x7 rug", merchant: "Wayfair", price: 89, tags: ["floor"], cap: 900, affiliate: true },
  { id: "doorstop", name: "Hinge pin doorstops", merchant: "Amazon", price: 9, tags: ["other"], cap: 900, affiliate: true },
  { id: "threshold", name: "Door threshold", merchant: "Home Depot", price: 26, tags: ["other"], cap: 900, affiliate: true },
  { id: "mirror", name: "24-inch bath mirror", merchant: "Target", price: 39, tags: ["bath"], cap: 900, affiliate: true },
  { id: "lvp-box", name: "LVP plank box", merchant: "Home Depot", price: 52, tags: ["floor"], cap: 1800, affiliate: true },
  { id: "ceiling-fan", name: "52-inch ceiling fan", merchant: "Home Depot", price: 129, tags: ["light"], cap: 1800, affiliate: true },
  { id: "miniblind-wood", name: "Faux wood blinds", merchant: "Blinds.com", price: 95, tags: ["blind"], cap: 1800, affiliate: true, per: "window" },
  { id: "entry-light", name: "Exterior lantern", merchant: "Home Depot", price: 68, tags: ["light"], cap: 1800, affiliate: true },
  { id: "showerhead", name: "Rain + handheld combo", merchant: "Amazon", price: 42, tags: ["bath"], cap: 1800, affiliate: true },
  { id: "linen-set", name: "Queen sheet set", merchant: "Target", price: 45, tags: ["other"], cap: 1800, affiliate: true },
  { id: "art-2", name: "Framed print pair", merchant: "Amazon", price: 36, tags: ["other"], cap: 1800, affiliate: false }
];

export function buildCart(issues, cap) {
  const needed = new Set(issues.map((i) => i.type));
  if (!needed.size) needed.add("clean");
  const windows = Math.max(1, issues.filter((i) => i.type === "blind").length);
  const pool = SKUS.filter((s) => s.cap <= cap);
  const prefer = pool.filter((s) => s.tags.some((t) => needed.has(t)));
  const rest = pool.filter((s) => !prefer.includes(s) && s.cap === 400);
  const picked = [];
  let total = 0;
  for (const sku of [...prefer, ...rest]) {
    if (picked.some((p) => p.id === sku.id)) continue;
    const qty = sku.per === "window" ? windows : 1;
    const line = sku.price * qty;
    if (total + line > cap) {
      if (qty > 1 && total + sku.price <= cap) {
        picked.push({ ...sku, qty: 1 });
        total += sku.price;
      }
      continue;
    }
    picked.push({ ...sku, qty });
    total += line;
  }
  return { items: picked, total, cap };
}
