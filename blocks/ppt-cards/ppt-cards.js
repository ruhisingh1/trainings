export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const headings = [...rows.shift().children].map(cell => cell.textContent.trim());

  const data = rows.map(row => {
    const cells = [...row.children];
    return Object.fromEntries(headings.map((key, i) => [key, cells[i]?.textContent.trim()]));
  });

  const container = document.createElement('div');
  container.className = 'ppt-cards-container';

  const filterUI = document.createElement('div');
  filterUI.className = 'ppt-filter';
  filterUI.innerHTML = `
    <label for="topic-filter">Filter by Topic:</label>
    <select id="topic-filter">
      <option value="All">All</option>
    </select>
  `;

  const cardGrid = document.createElement('div');
  cardGrid.className = 'ppt-cards-grid';

  container.append(filterUI, cardGrid);
  block.replaceWith(container);

  const topics = [...new Set(data.map(d => d.Topic))];
  const select = filterUI.querySelector('select');
  topics.forEach(topic => {
    const opt = document.createElement('option');
    opt.value = topic;
    opt.textContent = topic;
    select.appendChild(opt);
  });

  function renderCards(filter = 'All') {
    cardGrid.innerHTML = '';
    const filtered = filter === 'All' ? data : data.filter(d => d.Topic === filter);
    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'ppt-card';
      card.innerHTML = `
        <h3>${item.Title}</h3>
        <p><strong>Topic:</strong> ${item.Topic}</p>
        <p><strong>Week:</strong> ${item.Week}</p>
        <p><strong>Date:</strong> ${item.Date}</p>
        <a href="${item.File}" target="_blank" download>Download PPT</a>
      `;
      cardGrid.appendChild(card);
    });
  }

  select.addEventListener('change', () => renderCards(select.value));
  renderCards();
}
