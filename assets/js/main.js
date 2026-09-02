/* Portfolio runtime: renders the project cards from data/projects.json.
 *
 * Projects live in JSON rather than in the markup so adding or reordering work is a
 * one-file edit, and so the same data could feed a resume generator later. Everything
 * that reaches innerHTML goes through escapeHtml first.
 */

const BADGE_CLASS = { live: "badge--live", nda: "badge--nda", flag: "badge--flag" };

function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

function tagList(stack) {
  if (!stack || !stack.length) return "";
  return `<div class="tags">${stack
    .map((s) => `<span class="tag">${escapeHtml(s)}</span>`)
    .join("")}</div>`;
}

/** A featured project: the full problem, approach and evidence treatment. */
function featuredCard(p) {
  const badge = p.badge
    ? `<span class="badge ${BADGE_CLASS[p.badgeKind] || "badge--flag"}">${escapeHtml(p.badge)}</span>`
    : "";

  const points = (p.points || [])
    .map((pt) => `<li>${escapeHtml(pt)}</li>`)
    .join("");

  // The live link is the strongest thing on this page, so it gets primary styling
  // wherever it exists. A project with no public source says why, rather than
  // leaving a reader to assume there is nothing to show.
  const links = [
    p.live
      ? `<a class="btn btn-primary" href="${escapeHtml(p.live)}" target="_blank" rel="noopener">${escapeHtml(p.liveLabel || "View live")}</a>`
      : "",
    p.repo
      ? `<a class="btn" href="${escapeHtml(p.repo)}" target="_blank" rel="noopener">Source on GitHub</a>`
      : "",
    p.note ? `<span class="muted-note">${escapeHtml(p.note)}</span>` : "",
  ]
    .filter(Boolean)
    .join("");

  return `
    <article class="project project--feature">
      <div class="project__top">
        <div>
          <h3>${escapeHtml(p.title)}</h3>
          ${p.subtitle ? `<p class="project__sub">${escapeHtml(p.subtitle)}</p>` : ""}
        </div>
        ${badge}
      </div>
      <div class="project__body">
        ${p.problem ? `<p><strong>The problem.</strong> ${escapeHtml(p.problem)}</p>` : ""}
        ${p.approach ? `<p><strong>What I built.</strong> ${escapeHtml(p.approach)}</p>` : ""}
        ${points ? `<ul class="project__points">${points}</ul>` : ""}
      </div>
      ${tagList(p.stack)}
      ${links ? `<div class="project__links">${links}</div>` : ""}
    </article>`;
}

/** A supporting project: one line of outcome and a link. */
function compactCard(p) {
  return `
    <article class="project">
      <h3>${escapeHtml(p.title)}</h3>
      ${p.subtitle ? `<p class="project__sub">${escapeHtml(p.subtitle)}</p>` : ""}
      <div class="project__body"><p>${escapeHtml(p.outcome)}</p></div>
      ${tagList(p.stack)}
      ${
        p.repo
          ? `<div class="project__links"><a class="btn" href="${escapeHtml(p.repo)}" target="_blank" rel="noopener">Source on GitHub</a></div>`
          : ""
      }
    </article>`;
}

async function loadProjects() {
  const featuredEl = document.getElementById("featured-list");
  const moreEl = document.getElementById("more-list");
  if (!featuredEl) return;

  try {
    const res = await fetch("data/projects.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    featuredEl.innerHTML = (data.featured || []).map(featuredCard).join("");
    if (moreEl) moreEl.innerHTML = (data.more || []).map(compactCard).join("");
  } catch (err) {
    console.error(err);
    // Never leave an empty section: fall back to the one link that matters most.
    featuredEl.innerHTML = `
      <article class="project project--feature">
        <h3>Selected work</h3>
        <div class="project__body">
          <p>The project list could not load. Everything is on GitHub in the meantime.</p>
        </div>
        <div class="project__links">
          <a class="btn btn-primary" href="https://hemgandhi13.github.io/grid-cost-transparency/" target="_blank" rel="noopener">Open the live dashboard</a>
          <a class="btn" href="https://github.com/hemgandhi13" target="_blank" rel="noopener">GitHub profile</a>
        </div>
      </article>`;
  }
}

function stampDates() {
  const year = document.getElementById("year");
  const updated = document.getElementById("updated");
  if (year) year.textContent = new Date().getFullYear();
  if (updated) {
    // Build date, not visit date: a page that always claims "updated today" tells a
    // reader nothing. LAST_UPDATED is bumped when the content actually changes.
    updated.textContent = `Last updated ${LAST_UPDATED}`;
  }
}

const LAST_UPDATED = "September 2026";

document.addEventListener("DOMContentLoaded", () => {
  stampDates();
  loadProjects();
});
