// Year stamp
document.getElementById("y").textContent = new Date().getFullYear();

// Updated stamp
const upd = document.getElementById("updated-stamp");
if (upd) upd.textContent = "Updated: " + new Date().toLocaleDateString();

// ---- Focus logic ----
function getFocus() {
  const f = new URLSearchParams(location.search).get("focus");
  const allowed = ["general","finance","fmcg","supplychain","energy"];
  return allowed.includes(f) ? f : "general";
}
function setActiveChip(focus) {
  document.querySelectorAll(".focus-chips .chip").forEach(a=>{
    const url = new URL(a.href, location.href);
    const f = new URLSearchParams(url.search).get("focus") || "general";
    a.classList.toggle("active", f === focus);
  });
}

// ---- Impact bullets by focus ----
const IMPACT = {
  general: [
    "Automated data-quality checks (Python/SQL) → manual QA ↓ **~30%**, usable records ↑ **12–18%**.",
    "Stakeholder dashboards & variance diagnostics → rework cycles reduced; faster decisions.",
    "Recall-first churn baseline (XGBoost) with calibrated thresholds; trade-offs documented."
  ],
  finance: [
    "Automated checks across submissions → reconcile issues faster; usable records ↑ **12–18%**.",
    "Churn/propensity baseline → recall ↑ with documented precision trade-offs.",
    "KPI/variance packs clarified drivers (mix/price/volume) → quicker month-end actions."
  ],
  fmcg: [
    "POS/scan data QC & outlier controls → manual QA ↓ **~30%**; trustworthy sell-through metrics.",
    "Promo uplift analysis & dashboards → faster learn→repeat cycles for category managers.",
    "Automated packs + tidy handovers → rework cycles down; on-time reporting ↑."
  ],
  supplychain: [
    "Lane/stop-level QA & exception alerts → OTD metric reliability ↑; manual triage ↓.",
    "Geo bottleneck views (PostGIS/Leaflet) → faster root-cause on delays.",
    "Ops dashboards surfaced variance early → decision latency ↓; SLA adherence ↑."
  ],
  energy: [
    "AMI/interval data QA (nulls/outliers/schema drift) → trusted inputs; usable records ↑ **12–18%**.",
    "Spatial joins (feeder/zones) for loss/leakage views → actionable anomaly detection.",
    "Churn/retention signals for retail portfolios → recall ↑ with clear threshold trade-offs."
  ]
};

function renderImpacts(focus){
  const list = document.getElementById("impact-list");
  const items = (IMPACT[focus] || IMPACT.general)
    .map(s => `<li>${s.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")}</li>`)
    .join("");
  list.innerHTML = items;
  const label = document.getElementById("focus-label");
  label.textContent = focus === "general" ? "Viewing: General" : `Viewing: ${focus[0].toUpperCase()+focus.slice(1)} focus`;
}

// ---- Projects ----
async function loadProjects(focus){
  try {
    const res = await fetch("projects.json", {cache: "no-store"});
    const items = await res.json();

    // order: domain-matching first
    const sorted = items.slice().sort((a,b)=>{
      const am = (a.domains||[]).includes(focus) ? 0 : 1;
      const bm = (b.domains||[]).includes(focus) ? 0 : 1;
      return am - bm;
    });

    const grid = document.getElementById("projects-grid");
    grid.innerHTML = sorted.map((p, idx) => `
      <div class="card ${idx===0 ? 'gold' : ''}">
        <h3>${p.title}${idx===0 ? " <span class='small' style='color:#1D4ED8'>(Golden Project)</span>":""}</h3>
        <p class="small"><b>Problem:</b> ${p.problem || "—"}</p>
        <p class="small"><b>Approach:</b> ${p.approach || p.desc || "—"}</p>
        <p class="small"><b>Outcome:</b> ${p.outcome || "—"}</p>
        <p class="small">
          ${(p.repo?`<a href="${p.repo}" target="_blank" rel="noopener">Repo</a>`:"")}
          ${(p.demo?` • <a href="${p.demo}" target="_blank" rel="noopener">Live</a>`:"")}
        </p>
        <p class="small">${(p.tech||[]).join(" • ")}</p>
        ${p.next?`<p class="small"><i>Next:</i> ${p.next}</p>`:""}
      </div>
    `).join("");

    // Top project jump
    const jump = document.getElementById("jump-top-project");
    if (jump) jump.onclick = (e)=>{ e.preventDefault(); grid.scrollIntoView({behavior:"smooth"}); };

  } catch(e){
    console.warn("projects.json not found/invalid", e);
  }
}

// ---- Init ----
(function init(){
  const focus = getFocus();
  setActiveChip(focus);
  renderImpacts(focus);
  loadProjects(focus);
})();
