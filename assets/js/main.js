// ===== Load and Display Projects =====
async function loadProjects() {
  try {
    const response = await fetch('projects.json');
    const data = await response.json();
    const projectList = document.getElementById('project-list');
    
    if (!projectList) return;
    
    // Filter and display only selected projects
    const selectedProjects = data.projects.filter(p => p.selected === true);
    
    if (selectedProjects.length === 0) {
      projectList.innerHTML = '<p style="text-align: center; color: var(--muted);">No projects to display yet.</p>';
      return;
    }
    
    // Generate project cards
    projectList.innerHTML = selectedProjects.map(project => `
      <div class="project-card">
        <h3>${escapeHtml(project.title)}</h3>
        <p class="project-description">${escapeHtml(project.description)}</p>
        ${project.stack && project.stack.length > 0 ? `
          <div class="project-stack">
            ${project.stack.map(tech => `<span class="stack-tag">${escapeHtml(tech)}</span>`).join('')}
          </div>
        ` : ''}
        ${project.github || project.live ? `
          <div style="margin-top: 20px; display: flex; gap: 12px;">
            ${project.github ? `<a href="${escapeHtml(project.github)}" target="_blank" rel="noopener" class="project-link">View Code →</a>` : ''}
            ${project.live ? `<a href="${escapeHtml(project.live)}" target="_blank" rel="noopener" class="project-link">Live Demo →</a>` : ''}
          </div>
        ` : ''}
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Error loading projects:', error);
    const projectList = document.getElementById('project-list');
    if (projectList) {
      projectList.innerHTML = '<p style="text-align: center; color: var(--muted);">Unable to load projects.</p>';
    }
  }
}

// Helper function to escape HTML and prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== Analytics bindings (Plausible custom events) =====
function initAnalytics() {
  // Email clicks
  document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
    a.addEventListener('click', () => {
      if (typeof plausible === 'function') plausible('Email Click');
    });
  });
  
  // Project clicks (event delegation)
  const projectList = document.getElementById('project-list');
  if (projectList) {
    projectList.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const txt = (a.textContent || '').toLowerCase();
      if (typeof plausible === 'function') {
        if (txt.includes('code') || txt.includes('repo') || txt.includes('github')) {
          plausible('Project Repo Click', { props: { url: a.href } });
        } else if (txt.includes('demo') || txt.includes('live')) {
          plausible('Project Live Click', { props: { url: a.href } });
        }
      }
    });
  }
}

// ===== Initialize on page load =====
document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
  initAnalytics();
});
