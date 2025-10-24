document.getElementById("y").textContent = new Date().getFullYear();

async function loadProjects() {
  try {
    const res = await fetch("projects.json");
    const items = await res.json();
    const wrap = document.getElementById("projects-grid");
    wrap.innerHTML = items.map(p => `
      <div class="card">
        <h3>${p.title}</h3>
        <p class="small">${p.desc}</p>
        <p class="small">
          ${p.repo ? `<a href="${p.repo}" target="_blank" rel="noopener">Repo</a>` : ""}
          ${p.demo ? ` • <a href="${p.demo}" target="_blank" rel="noopener">Live</a>` : ""}
        </p>
        <p class="small">${(p.tech||[]).join(" • ")}</p>
      </div>
    `).join("");
  } catch(e) {
    console.warn("projects.json not found or invalid", e);
  }
}
loadProjects();
