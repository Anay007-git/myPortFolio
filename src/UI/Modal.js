import { portfolioData } from '../data/portfolio.js';

export class Modal {
  constructor() {
    this.modal = document.getElementById('modal');
    this.backdrop = this.modal.querySelector('.modal-backdrop');
    this.content = this.modal.querySelector('.modal-content');
    this.closeBtn = this.modal.querySelector('.modal-close');
    this.icon = this.modal.querySelector('.modal-icon');
    this.title = this.modal.querySelector('.modal-title');
    this.body = this.modal.querySelector('.modal-body');

    this.isOpen = false;

    this.init();
  }

  init() {
    // Close button
    this.closeBtn.addEventListener('click', () => this.close());

    // Backdrop click
    this.backdrop.addEventListener('click', () => this.close());

    // Escape key
    window.addEventListener('keydown', (e) => {
      if ((e.key === 'Escape' || e.key === 'Esc') && this.isOpen) {
        this.close();
      }
    }, true);
  }

  open(sectionId) {
    const content = this.getContent(sectionId);
    if (!content) return;

    this.icon.textContent = content.icon;
    this.title.textContent = content.title;
    this.body.innerHTML = content.html;

    this.modal.classList.remove('hidden');
    this.isOpen = true;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.classList.add('hidden');
    this.isOpen = false;

    // Restore body scroll
    document.body.style.overflow = '';
  }

  getContent(sectionId) {
    const data = portfolioData;

    switch (sectionId) {
      case 'about':
        return {
          icon: '👋',
          title: 'About Me',
          html: `
            <h3>${data.personal.name}</h3>
            <p class="text-gradient" style="font-size: 1.2rem; font-weight: 600; margin-bottom: 20px;">
              ${data.personal.title}
            </p>
            
            <div class="stats-bar">
              <div class="stat-block">
                <div class="stat-number">3.5+</div>
                <div class="stat-label">Years Exp</div>
              </div>
              <div class="stat-block">
                <div class="stat-number">4</div>
                <div class="stat-label">Companies</div>
              </div>
              <div class="stat-block">
                <div class="stat-number">15+</div>
                <div class="stat-label">Tools</div>
              </div>
            </div>
            
            <h3>Summary</h3>
            <p>${data.personal.summary}</p>
            
            <h3>Location</h3>
            <p style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.3rem;">📍</span> ${data.personal.location}, India
            </p>
          `
        };

      case 'skills':
        return {
          icon: '🛠️',
          title: 'Technical Skills',
          html: this.generateSkillsHTML(data.skills)
        };

      case 'experience':
        return {
          icon: '💼',
          title: 'Work Experience',
          html: this.generateExperienceHTML(data.experience)
        };

      case 'projects':
        return {
          icon: '🚀',
          title: 'Projects & Certifications',
          html: this.generateProjectsHTML(data.projects, data.certifications)
        };

      case 'education':
        return {
          icon: '🎓',
          title: 'Education',
          html: this.generateEducationHTML(data.education)
        };

      case 'contact':
        return {
          icon: '📧',
          title: 'Get In Touch',
          html: this.generateContactHTML(data.personal, data.links)
        };

      default:
        return null;
    }
  }

  generateSkillsHTML(skills) {
    let html = `
      <div class="stats-bar">
        <div class="stat-block">
          <div class="stat-number">${Object.values(skills).flat().length}</div>
          <div class="stat-label">Total Skills</div>
        </div>
        <div class="stat-block">
          <div class="stat-number">${Object.keys(skills).length}</div>
          <div class="stat-label">Categories</div>
        </div>
      </div>
    `;

    for (const [category, skillList] of Object.entries(skills)) {
      html += `<h3>${category}</h3>`;
      html += '<div class="skills-grid">';
      skillList.forEach(skill => {
        html += `<div class="skill-tag">${skill}</div>`;
      });
      html += '</div>';
    }

    return html;
  }

  generateExperienceHTML(experience) {
    const totalYears = '3.5+';

    let html = `
      <div class="stats-bar">
        <div class="stat-block">
          <div class="stat-number">${totalYears}</div>
          <div class="stat-label">Years</div>
        </div>
        <div class="stat-block">
          <div class="stat-number">${experience.length}</div>
          <div class="stat-label">Positions</div>
        </div>
        <div class="stat-block">
          <div class="stat-number">3</div>
          <div class="stat-label">Industries</div>
        </div>
      </div>
    `;

    experience.forEach((exp, index) => {
      const isLatest = index === 0;
      html += `
        <div class="exp-card" ${isLatest ? 'style="border-color: rgba(0, 240, 255, 0.3);"' : ''}>
          <div class="exp-header">
            <div>
              <div class="exp-title">${exp.role} ${isLatest ? '<span style="color: #22c55e; font-size: 0.75rem; margin-left: 8px;">● CURRENT</span>' : ''}</div>
              <div class="exp-company">${exp.company} • ${exp.location}</div>
            </div>
            <div class="exp-duration">${exp.duration}</div>
          </div>
          <p class="text-muted" style="font-size: 0.85rem; margin: 8px 0;">${exp.description}</p>
          <div class="exp-desc">
            <ul>
              ${exp.highlights.slice(0, 4).map(h => `<li>${h}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    });

    return html;
  }

  generateProjectsHTML(projects, certifications) {
    let html = `
      <div class="stats-bar">
        <div class="stat-block">
          <div class="stat-number">${projects.length}</div>
          <div class="stat-label">Projects</div>
        </div>
        <div class="stat-block">
          <div class="stat-number">${certifications.length}</div>
          <div class="stat-label">Certifications</div>
        </div>
      </div>
      
      <h3>Featured Projects</h3>
    `;

    projects.forEach(project => {
      html += `
        <div class="exp-card">
          <div class="exp-header">
            <div class="exp-title" style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.5rem;">📊</span>
              ${project.name}
            </div>
          </div>
          <p style="margin: 16px 0; color: rgba(255,255,255,0.75);">${project.description}</p>
          <div class="skills-grid" style="margin-bottom: 16px;">
            ${project.tech.map(t => `<div class="skill-tag">${t}</div>`).join('')}
          </div>
          <a href="${project.link}" target="_blank" class="contact-link" style="display: inline-flex; width: auto;">
            <span>🔗</span> View on GitHub
          </a>
        </div>
      `;
    });

    html += '<h3>Certifications</h3>';

    certifications.forEach(cert => {
      html += `
        <div class="exp-card">
          <div class="exp-header">
            <div>
              <div class="exp-title" style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.3rem;">🏆</span>
                ${cert.name}
              </div>
              <div class="exp-company">${cert.provider}</div>
            </div>
            <div class="exp-duration">${cert.date}</div>
          </div>
        </div>
      `;
    });

    return html;
  }

  generateEducationHTML(education) {
    let html = `
      <div class="stats-bar">
        <div class="stat-block">
          <div class="stat-number">${education.length}</div>
          <div class="stat-label">Degrees</div>
        </div>
        <div class="stat-block">
          <div class="stat-number">MBA</div>
          <div class="stat-label">Highest</div>
        </div>
      </div>
    `;

    const icons = ['🎓', '📚', '🏫'];

    education.forEach((edu, index) => {
      html += `
        <div class="exp-card">
          <div class="exp-header">
            <div>
              <div class="exp-title" style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.3rem;">${icons[index] || '📖'}</span>
                ${edu.degree}
              </div>
              <div class="exp-company">${edu.institution}</div>
            </div>
            <div class="exp-duration">${edu.duration}</div>
          </div>
        </div>
      `;
    });

    return html;
  }

  generateContactHTML(personal, links) {
    return `
      <h3>Let's Connect!</h3>
      <p style="font-size: 1rem; margin-bottom: 24px;">
        I'm always excited to discuss new opportunities, interesting projects, or just have a chat about data analytics and business intelligence!
      </p>
      
      <div class="contact-links">
        <a href="mailto:${personal.email}" class="contact-link">
          <span>📧</span>
          <div>
            <div style="font-weight: 600;">Email</div>
            <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5);">${personal.email}</div>
          </div>
        </a>
        <a href="tel:${personal.phone}" class="contact-link">
          <span>📱</span>
          <div>
            <div style="font-weight: 600;">Phone</div>
            <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5);">${personal.phone}</div>
          </div>
        </a>
        <a href="${links.linkedin}" target="_blank" class="contact-link">
          <span>💼</span>
          <div>
            <div style="font-weight: 600;">LinkedIn</div>
            <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5);">Connect with me</div>
          </div>
        </a>
        <a href="${links.github}" target="_blank" class="contact-link">
          <span>🐙</span>
          <div>
            <div style="font-weight: 600;">GitHub</div>
            <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5);">View my code</div>
          </div>
        </a>
        <a href="${links.twitter}" target="_blank" class="contact-link">
          <span>🐦</span>
          <div>
            <div style="font-weight: 600;">Twitter</div>
            <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5);">Follow me</div>
          </div>
        </a>
      </div>
      
      <h3>Location</h3>
      <div class="exp-card" style="display: flex; align-items: center; gap: 16px;">
        <span style="font-size: 2rem;">📍</span>
        <div>
          <div style="font-weight: 600; font-size: 1.1rem;">${personal.location}</div>
          <div style="color: rgba(255,255,255,0.5);">India</div>
        </div>
      </div>
    `;
  }
}
