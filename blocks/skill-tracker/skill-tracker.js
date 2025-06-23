function createBadge(level) {
  const span = document.createElement('span');
  span.className = `badge ${level.toLowerCase()}`;
  span.textContent = level;
  return span;
}

function render(people, container) {
  container.innerHTML = '';

  people.forEach(person => {
    const card = document.createElement('div');
    card.className = 'skill-card';

    const header = document.createElement('div');
    header.className = 'card-header';
    header.innerHTML = `<strong>${person.name}</strong><br><small>${person.email}</small>`;

    const ul = document.createElement('ul');
    person.skills.forEach(s => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${s.skill}:</strong> `;
      li.appendChild(createBadge(s.level));
      ul.appendChild(li);
    });

    card.appendChild(header);
    card.appendChild(ul);
    container.appendChild(card);
  });
}

function getUniqueNames(people) {
  return [...new Set(people.map(p => p.name))].sort();
}

function getUniqueSkills(people) {
  return [...new Set(people.flatMap(p => p.skills.map(s => s.skill)))].sort();
}

function buildFilterUI(people) {
  const wrapper = document.createElement('div');
  wrapper.className = 'filters';

  const names = getUniqueNames(people);
  const skills = getUniqueSkills(people);

  wrapper.innerHTML = `
    <select id="filter-name">
      <option value="">Employees</option>
      ${names.map(name => `<option value="${name}">${name}</option>`).join('')}
    </select>
    <select id="filter-skill">
      <option value="">Skills</option>
      ${skills.map(skill => `<option value="${skill}">${skill}</option>`).join('')}
    </select>
    <select id="filter-level">
      <option value="">Levels</option>
      <option value="Beginner">Beginner</option>
      <option value="Intermediate">Intermediate</option>
      <option value="Expert">Expert</option>
    </select>
    <input type="text" id="keyword-search" placeholder="Search anything...">
    <button id="download-csv">Download CSV</button>
    <button id="edit-sheet">Edit in Google Sheets</button>
  `;

  return wrapper;
}

export default async function decorate(block) {
  const spreadsheetId = '1HxqbKg-286WJQLe72UWZmnbKyWuxwSFva3ZWpJa1tMk';
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSZ5qLRTlfnKavCtDvHjgFCcyPxtSbvyvnLEqvuQvbbaQ8CyQ6l3bp7mmzFUMl1iAEyP-4Y1B2d8XLA/pub?output=csv';
  const res = await fetch(csvUrl);
  const text = await res.text();

  const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim()));
  const [header, ...data] = rows;

  const people = [];
  let current = null;

  data.forEach(row => {
    const [name, email, skill, level] = row;
    if (name) {
      current = { name, email, skills: [] };
      people.push(current);
    }
    if (current && skill && level) {
      current.skills.push({ skill, level });
    }
  });

  // Add filters
  const filterUI = buildFilterUI(people);
  block.appendChild(filterUI);

  // Add container for skill cards
  const container = document.createElement('div');
  container.className = 'skill-cards';
  block.appendChild(container);

  // Filter logic
  function applyFilters() {
    const nameFilter = document.getElementById('filter-name').value;
    const skillFilter = document.getElementById('filter-skill').value;
    const levelFilter = document.getElementById('filter-level').value;
    const keywordFilter = document.getElementById('keyword-search').value.toLowerCase();

    const filtered = people
      .filter(p => !nameFilter || p.name === nameFilter)
      .map(p => ({
        ...p,
        skills: p.skills.filter(s =>
          (!skillFilter || s.skill === skillFilter) &&
          (!levelFilter || s.level === levelFilter)
        )
      }))
      .filter(p => {
        if (p.skills.length === 0) return false;
        
        if (!keywordFilter) return true;
        
        // Search in name, email, and skills
        return p.name.toLowerCase().includes(keywordFilter) ||
               p.email.toLowerCase().includes(keywordFilter) ||
               p.skills.some(s => 
                 s.skill.toLowerCase().includes(keywordFilter) ||
                 s.level.toLowerCase().includes(keywordFilter)
               );
      });

  render(filtered, container);
  }

  document.getElementById('filter-name').addEventListener('change', applyFilters);
  document.getElementById('filter-skill').addEventListener('change', applyFilters);
  document.getElementById('filter-level').addEventListener('change', applyFilters);
  document.getElementById('keyword-search').addEventListener('input', applyFilters);

  // CSV download
  document.getElementById('download-csv').addEventListener('click', () => {
    const flat = people.flatMap(p =>
      p.skills.map(s => [p.name, p.email, s.skill, s.level].join(','))
    );
    const csv = ['Name,Email,Skill,Level', ...flat].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'skill-tracker.csv';
    a.click();
  });

  // Add Google Sheets edit button
  const editButton = document.getElementById('edit-sheet');
  editButton.addEventListener('click', () => {
    const editUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    window.open(editUrl, '_blank');
  });

  render(people, container);
}
