export default async function decorate(block) {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSZ5qLRTlfnKavCtDvHjgFCcyPxtSbvyvnLEqvuQvbbaQ8CyQ6l3bp7mmzFUMl1iAEyP-4Y1B2d8XLA/pub?output=csv'; // Replace with your CSV link
  const res = await fetch(csvUrl);
  const text = await res.text();

  const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim()));
  const [header, ...data] = rows;

  const people = [];
  let current = null;

  data.forEach(row => {
    const [name, email, skill, level] = row;
    if (name) {
      current = {
        name,
        email,
        skills: [],
      };
      people.push(current);
    }
    if (current && skill && level) {
      current.skills.push({ skill, level });
    }
  });

  const container = document.createElement('div');
  container.className = 'skill-cards';

  people.forEach(person => {
    const card = document.createElement('div');
    card.className = 'skill-card';

    const header = document.createElement('div');
    header.className = 'card-header';
    header.innerHTML = `<strong>${person.name}</strong><br><small>${person.email}</small>`;

    const ul = document.createElement('ul');
    person.skills.forEach(s => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${s.skill}:</strong> ${s.level}`;
      ul.appendChild(li);
    });

    card.appendChild(header);
    card.appendChild(ul);
    container.appendChild(card);
  });

  block.innerHTML = '';
  block.appendChild(container);
}
