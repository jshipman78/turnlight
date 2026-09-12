import { ISSUE_TYPES, ROOMS, buildCart } from "./catalog.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const DEFAULTS = {
  unit: "",
  rent: 1450,
  vacantDays: 0,
  cap: 900,
  rooms: ["Living", "Kitchen", "Bath"],
  photos: [],
  issues: [],
  notes: ""
};

const state = { ...DEFAULTS, rooms: [...DEFAULTS.rooms], photos: [], issues: [] };
const storeKey = "turnlight.v4";
const MAX_PHOTOS = 12;
const MAX_NOTE = 240;

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, """);
}

function clampNum(n, min, max, fallback) {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, v));
}

function save() {
  try {
    localStorage.setItem(storeKey, JSON.stringify({
      unit: state.unit,
      rent: state.rent,
      vacantDays: state.vacantDays,
      cap: state.cap,
      rooms: state.rooms,
      issues: state.issues,
      notes: state.notes
    }));
  } catch {}
}

function restore() {
  try {
    const raw = localStorage.getItem(storeKey);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return;
    if (typeof data.unit === "string") state.unit = data.unit.slice(0, 80);
    state.rent = clampNum(data.rent, 0, 50000, DEFAULTS.rent);
    state.vacantDays = clampNum(data.vacantDays, 0, 365, 0);
    state.cap = [400, 900, 1800].includes(Number(data.cap)) ? Number(data.cap) : 900;
    if (Array.isArray(data.rooms)) state.rooms = data.rooms.filter((r) => ROOMS.includes(r));
    if (Array.isArray(data.issues)) {
      state.issues = data.issues
        .filter((i) => i && ISSUE_TYPES.some((t) => t.id === i.type))
        .map((i, idx) => ({
          id: Number(i.id) || idx + 1,
          room: ROOMS.includes(i.room) ? i.room : "Living",
          type: i.type,
          note: String(i.note || "").slice(0, MAX_NOTE)
        }));
    }
    if (typeof data.notes === "string") state.notes = data.notes.slice(0, 500);
  } catch {}
}

function money(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function dayCost() {
  return state.rent > 0 ? state.rent / 30 : 0;
}

function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1800);
}

function samplePhotos() {
  const mk = (label, fill) => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='400' height='400' fill='${fill}'/><text x='200' y='206' text-anchor='middle' font-family='Georgia' font-size='22' fill='#f1ece3'>${label}</text></svg>`;
    return { name: label, src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` };
  };
  return [mk("Living", "#3d4a3f"), mk("Kitchen", "#4a3c32"), mk("Bath", "#2f3a44")];
}

function loadSample() {
  state.unit = "412 Maple — Unit B";
  state.rent = 1450;
  state.vacantDays = 6;
  state.cap = 900;
  state.rooms = ["Living", "Kitchen", "Bath", "Primary bed", "Hall / entry"];
  state.photos = samplePhotos();
  state.issues = [
    { id: 1, room: "Living", type: "paint", note: "Scuffs by front door" },
    { id: 2, room: "Living", type: "blind", note: "Broken slats, west window" },
    { id: 3, room: "Bath", type: "bath", note: "Missing curtain + stained seat" },
    { id: 4, room: "Kitchen", type: "kitchen", note: "Drippy faucet" },
    { id: 5, room: "Hall / entry", type: "safety", note: "Dead smoke detector" }
  ];
  state.notes = "Need listing live Friday. Owner cap $900 unless vacancy slips past day 10.";
  render();
  toast("Sample turn loaded");
}

function addIssue() {
  const room = $("#issue-room").value;
  const type = $("#issue-type").value;
  const note = $("#issue-note").value.trim().slice(0, MAX_NOTE);
  if (!ISSUE_TYPES.some((t) => t.id === type)) {
    toast("Pick an issue type");
    return;
  }
  state.issues.push({ id: Date.now(), room: room || "Living", type, note });
  $("#issue-note").value = "";
  render();
}

function onFiles(files) {
  const incoming = [...files].slice(0, MAX_PHOTOS - state.photos.length);
  if (!incoming.length) {
    toast(`Photo limit is ${MAX_PHOTOS}`);
    return;
  }
  incoming.forEach((file) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 6 * 1024 * 1024) {
      toast("Photo too large (6MB max)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (state.photos.length >= MAX_PHOTOS) return;
      state.photos.push({ name: file.name, src: reader.result });
      render();
    };
    reader.readAsDataURL(file);
  });
}

function floorSketch() {
  const rooms = state.rooms.length ? state.rooms : ["Unit"];
  const cols = Math.min(3, rooms.length);
  const w = 320;
  const h = 56 * Math.ceil(rooms.length / cols) + 16;
  const cw = (w - 16) / cols;
  const rows = Math.ceil(rooms.length / cols);
  const rh = (h - 16) / rows;
  const cells = rooms.map((name, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const x = 8 + c * cw;
    const y = 8 + r * rh;
    return `<rect x="${x}" y="${y}" width="${cw - 6}" height="${rh - 6}" fill="none" stroke="#1a1814" stroke-width="1.2"/><text x="${x + 8}" y="${y + 18}" font-size="10" font-family="sans-serif" fill="#6e6a62">${escapeHtml(name)}</text>`;
  }).join("");
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${cells}</svg>`;
}

function render() {
  save();
  const vacantCost = dayCost() * state.vacantDays;
  const cart = buildCart(state.issues, state.cap);
  const payback = dayCost() > 0 && cart.total > 0 ? `${(cart.total / dayCost()).toFixed(1)} days` : "—";
  $("#unit").value = state.unit;
  $("#rent").value = state.rent;
  $("#days").value = state.vacantDays;
  $("#notes").value = state.notes;
  $("#day-cost").textContent = money(dayCost());
  $("#vacant-cost").textContent = money(vacantCost);
  $("#payback").textContent = payback;
  $("#cart-total-hero").textContent = money(cart.total);
  $("#issue-count").textContent = String(state.issues.length);
  $("#room-count").textContent = String(state.rooms.length);
  document.title = state.unit ? `Turnlight — ${state.unit}` : "Turnlight — make-ready pack";
  $$(".cap").forEach((el) => el.classList.toggle("on", Number(el.dataset.cap) === state.cap));
  $("#rooms").innerHTML = ROOMS.map((r) =>
    `<button type="button" class="chip ${state.rooms.includes(r) ? "on" : ""}" data-room="${escapeHtml(r)}">${escapeHtml(r)}</button>`
  ).join("");
  $("#photos").innerHTML =
    state.photos.map((p, i) =>
      `<div class="photo"><img src="${p.src}" alt="${escapeHtml(p.name || "Room photo")}"><button type="button" class="x" data-photo="${i}" aria-label="Remove photo">×</button></div>`
    ).join("") +
    `<label class="add-photo">Add photo<input type="file" accept="image/*" multiple capture="environment" id="file-in"></label>`;
  const roomOpts = state.rooms.length ? state.rooms : ROOMS;
  const prevRoom = $("#issue-room").value;
  const prevType = $("#issue-type").value;
  $("#issue-room").innerHTML = roomOpts.map((r) => `<option>${escapeHtml(r)}</option>`).join("");
  $("#issue-type").innerHTML = ISSUE_TYPES.map((t) => `<option value="${t.id}">${escapeHtml(t.label)}</option>`).join("");
  if (roomOpts.includes(prevRoom)) $("#issue-room").value = prevRoom;
  if (ISSUE_TYPES.some((t) => t.id === prevType)) $("#issue-type").value = prevType;
  $("#issues").innerHTML = state.issues.length
    ? state.issues.map((i) => {
        const label = ISSUE_TYPES.find((t) => t.id === i.type)?.label || i.type;
        return `<div class="issue"><div><b>${escapeHtml(label)}</b> · ${escapeHtml(i.room)}<div class="who">${escapeHtml(i.note || "No note")}</div></div><button type="button" data-del="${i.id}">Remove</button></div>`;
      }).join("")
    : `<p class="legal">No issues yet. Add what you see while you walk.</p>`;
  $("#cart").innerHTML = cart.items.map((s) =>
    `<div class="cart-item"><div>${escapeHtml(s.name)}${s.qty > 1 ? ` ×${s.qty}` : ""}<span class="badge ${s.affiliate ? "aff" : "no"}">${s.affiliate ? "May earn" : "No affiliate"}</span><div class="merchant">${escapeHtml(s.merchant)}</div></div><div class="price">${money(s.price * s.qty)}</div></div>`
  ).join("") || `<p class="legal">Cart fills from tagged issues and the selected cap.</p>`;
  $("#cart-total").textContent = money(cart.total);
  $("#cap-label").textContent = money(state.cap);
  $("#under").textContent = cart.total <= state.cap ? `Under cap by ${money(state.cap - cart.total)}` : "Over cap";
  $("#under").className = cart.total <= state.cap ? "legal" : "warn";
  $("#sketch").innerHTML = floorSketch();
  const heroPhoto = state.photos[0];
  $("#stage").innerHTML = heroPhoto
    ? `<img src="${heroPhoto.src}" alt=""><div class="mark">Virtually staged — not current condition</div>`
    : `<div class="empty">Add a photo to preview the listing still.</div>`;
  $("#file-in")?.addEventListener("change", (e) => onFiles(e.target.files));
}

function bind() {
  $("#unit").addEventListener("input", (e) => { state.unit = e.target.value.slice(0, 80); save(); });
  $("#rent").addEventListener("input", (e) => { state.rent = clampNum(e.target.value, 0, 50000, 0); render(); });
  $("#days").addEventListener("input", (e) => { state.vacantDays = clampNum(e.target.value, 0, 365, 0); render(); });
  $("#notes").addEventListener("input", (e) => { state.notes = e.target.value.slice(0, 500); save(); });
  $("#caps").addEventListener("click", (e) => {
    const btn = e.target.closest(".cap");
    if (!btn) return;
    state.cap = Number(btn.dataset.cap);
    render();
  });
  $("#rooms").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-room]");
    if (!btn) return;
    const r = btn.dataset.room;
    state.rooms = state.rooms.includes(r) ? state.rooms.filter((x) => x !== r) : [...state.rooms, r];
    render();
  });
  $("#photos").addEventListener("click", (e) => {
    const x = e.target.closest("[data-photo]");
    if (!x) return;
    state.photos.splice(Number(x.dataset.photo), 1);
    render();
  });
  $("#issues").addEventListener("click", (e) => {
    const b = e.target.closest("[data-del]");
    if (!b) return;
    state.issues = state.issues.filter((i) => i.id !== Number(b.dataset.del));
    render();
  });
  $("#add-issue").addEventListener("click", addIssue);
  $("#issue-note").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); addIssue(); }
  });
  $("#sample").addEventListener("click", loadSample);
  $("#print").addEventListener("click", () => window.print());
  $("#reset").addEventListener("click", () => {
    Object.assign(state, { ...DEFAULTS, rooms: [...DEFAULTS.rooms], photos: [], issues: [] });
    render();
    toast("Turn cleared");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  restore();
  bind();
  render();
});
