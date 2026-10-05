// Explore Globe - loads destinations from the backend API
// When you deploy the backend, change this to your live API URL.
const API_BASE = 'http://localhost:5000/api';

const grid = document.getElementById('destinationGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryButtons = document.querySelectorAll('.category-btn');

let activeCategory = '';
const inr = new Intl.NumberFormat('en-IN');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cardTemplate(d, index) {
  const badgeText = d.badgeColor === 'warning' ? ' text-dark' : '';
  const badge = d.badge
    ? `<span class="badge bg-${escapeHtml(d.badgeColor)}${badgeText} position-absolute top-0 start-0 m-3">${escapeHtml(d.badge)}</span>`
    : '';

  return `
    <div class="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="${(index % 3) * 100}">
      <div class="card destination-card h-100 shadow-lg">
        <div class="position-relative">
          <img src="${escapeHtml(d.image)}" class="card-img-top" alt="${escapeHtml(d.name)}" />
          ${badge}
        </div>
        <div class="card-body">
          <h4>${escapeHtml(d.flag)} ${escapeHtml(d.name)}</h4>
          <p class="text-muted">${escapeHtml(d.description)}</p>
          <div class="d-flex justify-content-between mb-2">
            <span><i class="fas fa-clock text-primary"></i> ${Number(d.days)} Days</span>
            <span><i class="fas fa-star text-warning"></i> ${Number(d.rating).toFixed(1)}</span>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <h4 class="text-primary mb-0">₹${inr.format(d.price)}</h4>
            <a href="register.html" class="btn btn-primary">Book Now</a>
          </div>
        </div>
      </div>
    </div>`;
}

function showMessage(text, type = 'muted') {
  grid.innerHTML = `
    <div class="col-12 text-center py-5">
      <p class="text-${type} fs-5 mb-0">${escapeHtml(text)}</p>
    </div>`;
}

async function loadDestinations() {
  const params = new URLSearchParams();
  const query = searchInput ? searchInput.value.trim() : '';
  if (query) params.set('q', query);
  if (activeCategory) params.set('category', activeCategory);

  showMessage('Loading destinations...');

  try {
    const res = await fetch(`${API_BASE}/destinations?${params.toString()}`);
    if (!res.ok) throw new Error(`Server responded with ${res.status}`);

    const data = await res.json();

    if (!data.results.length) {
      showMessage('No destinations found. Try a different search or category.');
      return;
    }

    grid.innerHTML = data.results.map(cardTemplate).join('');
    if (window.AOS) AOS.refreshHard();
  } catch (err) {
    console.error(err);
    showMessage(
      'Could not load destinations. Make sure the backend server is running.',
      'danger'
    );
  }
}

function setActiveCategory(button) {
  const category = button.dataset.category || '';
  // clicking the active category again clears the filter
  activeCategory = category === activeCategory ? '' : category;

  categoryButtons.forEach((btn) => {
    btn.classList.toggle(
      'active',
      activeCategory !== '' && btn.dataset.category === activeCategory
    );
  });

  loadDestinations();
  grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

if (grid) {
  // Remove the old hardcoded "more destinations" block and the View All button
  const oldMore = document.getElementById('moreDestinations');
  if (oldMore) oldMore.remove();
  const viewMoreBtn = document.getElementById('viewMoreBtn');
  if (viewMoreBtn) viewMoreBtn.style.display = 'none';

  categoryButtons.forEach((btn) =>
    btn.addEventListener('click', () => setActiveCategory(btn))
  );

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      loadDestinations();
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') searchBtn ? searchBtn.click() : loadDestinations();
    });
  }

  loadDestinations();
}
