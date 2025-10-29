// Year + updated stamp
document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
  const u = document.getElementById('updated-stamp');
  if (u) u.textContent = 'Updated: ' + new Date().toLocaleDateString();

  loadProjects();
  initAnalytics();
});

// ===== Load and Display Projects =====
async function loadProjects() {
  const projectList = document.getElementById('project-list');
  const empty = document.getElementById('projects-empty');
  if (!projectList) return;

  try {
    const response = await fetch('projects.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch projects');
    const data = await response.json();

    if (!data || !Array.isArray(data.projects)) throw new Error('Invalid JSON shape');

    // Only show selected=true
    const selectedProjects = data.projects.filter(p => p.selected === true);

    if (!selectedProjects.length) {
      empty.style.display = 'block';
      projectList.innerHTML = '';
      return;
    }

    // First selected project becomes Golden Project
    projectList.innerHTML = selectedProjects.map((project, idx) => {
      const isGold = idx === 0;
      const hasPAO = project.problem || project.approach || project.outcome;

      const kv = hasPAO ? `
        <div class="kv small">
          ${project.problem ? `<p><b>Problem:</b> ${escapeHtml(project.problem)}</p>` : ''}
          ${project.approach ? `<p><b>Approach:</b> ${escapeHtml(project.approach)}</p>` : ''}
          ${project.outcome ? `<p><b>Outcome:</b> ${escapeHtml(project.outcome)}</p>` : ''}
        </div>
      ` : `<p class="project-description">${escapeHtml(project.description)}</p>`;

      return `
        <div class="project-card ${isGold ? 'gold' : ''}">
          ${isGold ? `<span class="golden-badge">Golden Project</span>` : ''}
          <h3>${escapeHtml(project.title)}</h3>
          ${kv}
          ${Array.isArray(project.stack) && project.stack.length ? `
            <div class="project-stack">
              ${project.stack.map(tech => `<span class="stack-tag">${escapeHtml(tech)}</span>`).join('')}
            </div>
          ` : ''}

          ${(project.github || project.live) ? `
            <div class="project-links">
              ${project.github ? `<a href="${project.github}" target="_blank" rel="noopener" class="project-link">Repo →</a>` : ''}
              ${project.live ? `<a href="${project.live}" target="_blank" rel="noopener" class="project-link">Live →</a>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error loading projects:', err);
    if (empty) empty.style.display = 'block';
    if (projectList) projectList.innerHTML = '';
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== Analytics (Plausible custom events) =====
function initAnalytics() {
  // Email clicks
  document.querySelectorAll('.email-btn, a[href^="mailto:"]').forEach(a => {
    a.addEventListener('click', () => {
      if (typeof plausible === 'function') plausible('Email Click');
    });
  });

  // Resume clicks
  document.querySelectorAll('.resume-btn').forEach(a => {
    a.addEventListener('click', () => {
      if (typeof plausible === 'function') plausible('Resume Download');
    });
  });

  // Project links (delegation)
  const list = document.getElementById('project-list');
  if (list) {
    list.addEventListener('click', (e) => {
      const a = e.target.closest('a'); if (!a) return;
      const txt = (a.textContent || '').toLowerCase();
      if (typeof plausible !== 'function') return;
      if (txt.includes('repo')) plausible('Project Repo Click', { props: { url: a.href } });
      if (txt.includes('live')) plausible('Project Live Click', { props: { url: a.href } });
    });
  }
}
