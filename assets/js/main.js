// stamps
function stampDates() {
  const y = document.getElementById('year');
  const u = document.getElementById('updated');
  if (y) y.textContent = new Date().getFullYear();
  if (u) u.textContent = 'Updated: ' + new Date().toLocaleDateString();
}

// tiny helper
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// render one project card
function renderProjectCard(p) {
  const badge = p.nda ? '<span class="tag tag--badge">NDA</span>' :
                (p.badge ? `<span class="tag tag--badge">${escapeHtml(p.badge)}</span>` : '');

  const stack = (p.stack || [])
    .map(s => `<span class="tag">${escapeHtml(s)}</span>`).join('');

  const links = p.repo
    ? `<a class="btn btn-ghost" href="${escapeHtml(p.repo)}" target="_blank" rel="noopener">Open Repo →</a>`
    : `<span class="p small">Repo not public${p.nda ? ' (NDA)' : ''}</span>`;

  return `
    <article class="project" aria-label="${escapeHtml(p.title)}">
      <h3>${escapeHtml(p.title)} ${badge}</h3>
      ${p.problem ? `<p><strong>Problem:</strong> ${escapeHtml(p.problem)}</p>` : ''}
      ${p.approach ? `<p><strong>Approach:</strong> ${escapeHtml(p.approach)}</p>` : ''}
      ${p.outcome ? `<p><strong>Outcome:</strong> ${escapeHtml(p.outcome)}</p>` : ''}
      <div class="meta">${stack}</div>
      <div class="links">${links}</div>
    </article>
  `;
}

// load & inject projects
async function loadProjects() {
  const container = document.getElementById('project-list');
  if (!container) return;

  try {
    const res = await fetch('data/projects.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch projects');
    const payload = await res.json();

    const projects = (payload.projects || payload).filter(p => p.selected !== false);
    if (!projects.length) {
      container.innerHTML = '<p class="small">No projects to display yet.</p>';
      return;
    }

    container.innerHTML = projects.map(renderProjectCard).join('');
  } catch (e) {
    console.error(e);
    container.innerHTML = '<p class="small">Unable to load projects right now.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  stampDates();
  loadProjects();
});
