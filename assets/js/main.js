document.getElementById("y").textContent = new Date().getFullYear();

const IMPACT = {
  general: [
    "Automated data-quality checks (Python/SQL) → manual QA ↓ **~30%**, usable records ↑ **12–18%**.",
    "Stakeholder dashboards & variance diagnostics → rework cycles down; faster decisions.",
    "Recall-first churn baseline with calibrated thresholds; trade-offs explicit."
  ],
  finance: [
    "Automated data checks across submissions → reconcile issues faster; usable records ↑ **12–18%**.",
    "Churn/propensity baseline (logistic/XGBoost) → recall ↑ with documented precision trade-offs.",
    "Built KPI/variance packs that clarified drivers (mix/price/volume) → quicker actions at month-end."
  ],
  fmcg: [
    "POS/scan data QC & outlier controls → **manual QA ↓ ~30%**, trusted sell-through metrics.",
    "Promo uplift analysis & dashboards → faster learn→repeat cycles for category managers.",
    "Automated packs + tidy handovers → rework cycles down; on-time reporting ↑."
  ],
  supplychain: [
    "Lane/stop-level data QA & exception alerts → OTD metric reliability ↑; manual triage ↓.",
    "Geo views for bottlenecks (PostGIS/Leaflet) → faster root-cause on delays.",
    "Ops dashboards surfaced variance early → decision latency ↓; SLA adherence ↑."
  ],
  energy: [
    "AMI/interval data QA (nulls/outliers/schema drift) → trusted inputs; usable records ↑ **12–18%**.",
    "Spatial joins (feeder/zones) for loss/leakage views → actionable anomaly detection.",
    "Churn/retention signals for retail portfolios → recall ↑ with clear threshold trade-offs."
  ]
};


function getFocus() {
  const f = new URLSearchParams(location.search).get("focus");
  const allowed = ["general","finance","fmcg","supplychain","energy"];
  return allowed.includes(f) ? f : "general";
}

function setActiveChip(focus) {
  document.querySelectorAll(".focus-chips .chip").forEach(a=>{
    const url = new URL(a.href);
    const f = new URLSearchParams(url.search).get("focus") || "general";
    a.classList.toggle("active", f === focus);
  });
}

function renderImpacts(focus){
  const list = document.querySelector(".bullets");
  const items = (IMPACT[focus] || IMPACT.general)
    .map(s => `<li>${s.replace(/\\*\\*(.*?)\\*\\*/g, "<b>$1</b>")}</li>`).join("");
  list.innerHTML = items;
  const tag = document.createElement("div");
  tag.className = "small";
  tag.style.color = "#64748B";
  tag.textContent = focus === "general" ? "Viewing: General" : `Viewing: ${focus[0].toUpperCase()+focus.slice(1)} focus`;
  // put the tag right under the Impact header
  const h2s = Array.from(document.querySelectorAll("h2"));
  const impactH2 = h2s.find(h => h.textContent.trim().toLowerCase() === "impact");
  if (impactH2 && !impactH2.nextSibling?.classList?.contains("small")) {
    impactH2.insertAdjacentElement("afterend", tag);
  }
}

async function renderProjects(focus){
  const res = await fetch("projects.json");
  const items = await res.json();
  const grid = document.getElementById("projects-grid");
  // sort: domain-matching first, then others
  const sorted = items.slice().sort((a,b)=>{
    const am = (a.domains||[]).includes(focus) ? 0 : 1;
    const bm = (b.domains||[]).includes(focus) ? 0 : 1;
    return am - bm;
  });
  // pick top card as Golden Project if it matches focus
  grid.innerHTML = sorted.map((p, idx) => `
    <div class="card" style="${idx===0 ? 'border-color:#1D4ED8' : ''}">
      <h3>${p.title}${idx===0 ? " <span class='small' style='color:#1D4ED8'>(Golden Project)</span>":""}</h3>
      <p class="small"><b>Problem:</b> ${p.problem || "—"}<br>
      <b>Approach:</b> ${p.desc}<br>
      <b>Outcome:</b> ${p.outcome || "—"}</p>
      <p class="small">
        ${(p.repo?`<a href="${p.repo}" target="_blank" rel="noopener">Repo</a>`:"")}
        ${(p.demo?` • <a href="${p.demo}" target="_blank" rel="noopener">Live</a>`:"")}
      </p>
      <p class="small">${(p.tech||[]).join(" • ")}</p>
      ${p.next?`<p class="small"><i>Next:</i> ${p.next}</p>`:""}
    </div>
  `).join("");
}

(function init(){
  const focus = getFocus();
  setActiveChip(focus);
  renderImpacts(focus);
  renderProjects(focus);
  // Updated stamp
  const stamp = document.createElement("div");
  stamp.className = "small";
  stamp.style.color = "#64748B";
  stamp.textContent = "Updated: " + new Date().toLocaleDateString();
  document.querySelector(".hero")?.appendChild(stamp);
})();

