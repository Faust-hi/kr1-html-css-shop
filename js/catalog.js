const catalogState = {
  query: '',
  category: 'all',
  sort: 'default',
  availableOnly: false,
  favoritesOnly: false,
  minPrice: null,
  maxPrice: null,
  page: 1,
  pageSize: 6
};

let favoriteIds = readStorageArray(STORAGE_KEYS.favorites).filter((id) => findProductById(products, id));

function getCatalogPreparedProducts(products, state) {
  let result = searchProducts(products, state.query);
  result = filterProductsByCategory(result, state.category);
  result = result.filter((product) => {
    const finalPrice = getFinalPrice(product);
    const aboveMinimum = state.minPrice === null || finalPrice >= state.minPrice;
    const belowMaximum = state.maxPrice === null || finalPrice <= state.maxPrice;
    const matchesAvailability = !state.availableOnly || product.isAvailable;
    const matchesFavorites = !state.favoritesOnly || favoriteIds.includes(product.id);
    return aboveMinimum && belowMaximum && matchesAvailability && matchesFavorites;
  });
  return sortProducts(result, state.sort);
}

function createProductCard(product) {
  const card = document.createElement('li');
  card.classList.add('card', 'product-card');
  card.dataset.productId = String(product.id);

  const picture = document.createElement('picture');
  if (product.webp) {
    const source = document.createElement('source');
    source.type = 'image/webp';
    source.srcset = product.webpSrcset;
    source.sizes = product.sizes;
    picture.append(source);
  }
  const image = document.createElement('img');
  image.classList.add('card-media');
  image.src = product.image;
  image.srcset = product.srcset;
  image.sizes = product.sizes;
  image.alt = product.imageAlt;
  image.width = product.width;
  image.height = product.height;
  image.loading = 'lazy';
  image.decoding = 'async';
  picture.append(image);

  const body = document.createElement('div');
  body.classList.add('card-body');

  const badge = document.createElement('span');
  badge.classList.add('badge');
  if (!product.isAvailable) {
    badge.textContent = 'Нет в наличии';
  } else if (product.discountPercent > 0) {
    badge.textContent = `Скидка ${product.discountPercent}%`;
  } else if (product.rating >= 4.8) {
    badge.textContent = 'Выбор покупателей';
  } else {
    badge.textContent = 'ShopProject';
  }

  const category = document.createElement('p');
  category.classList.add('product-card__category');
  category.textContent = CATEGORY_LABELS[product.category];

  const title = document.createElement('h3');
  title.textContent = product.title;

  const rating = document.createElement('p');
  rating.classList.add('product-card__rating');
  rating.textContent = `Рейтинг: ${product.rating.toFixed(1)}/5`;

  const description = document.createElement('p');
  description.textContent = product.description;

  const price = document.createElement('p');
  price.classList.add('price');
  price.textContent = formatFinalPrice(product);
  if (product.discountPercent > 0) {
    const oldPrice = document.createElement('span');
    oldPrice.classList.add('price-old');
    oldPrice.textContent = formatPrice(product.price);
    price.append(' ', oldPrice);
  }

  const status = document.createElement('p');
  status.classList.add('product-card__status');
  status.textContent = getProductStatus(product);

  const actions = document.createElement('div');
  actions.classList.add('card-actions');

  const detailsLink = document.createElement('a');
  detailsLink.classList.add('btn', 'btn--primary');
  detailsLink.href = `product.html?id=${product.id}`;
  detailsLink.textContent = 'Подробнее';

  const quickViewButton = document.createElement('button');
  quickViewButton.type = 'button';
  quickViewButton.classList.add('btn');
  quickViewButton.dataset.action = 'quick-view';
  quickViewButton.dataset.productId = String(product.id);
  quickViewButton.textContent = 'Быстрый просмотр';

  const cartButton = document.createElement('button');
  cartButton.type = 'button';
  cartButton.classList.add('btn');
  cartButton.dataset.action = 'add-to-cart';
  cartButton.dataset.productId = String(product.id);
  cartButton.textContent = 'В корзину';
  if (!product.isAvailable) {
    cartButton.disabled = true;
    cartButton.textContent = 'Недоступно';
  }

  const favoriteButton = document.createElement('button');
  favoriteButton.type = 'button';
  favoriteButton.classList.add('btn', 'btn--ghost');
  favoriteButton.dataset.action = 'favorite';
  favoriteButton.dataset.productId = String(product.id);
  const isFavorite = favoriteIds.includes(product.id);
  favoriteButton.setAttribute('aria-pressed', String(isFavorite));
  favoriteButton.textContent = isFavorite ? 'В избранном' : 'В избранное';

  actions.append(detailsLink, quickViewButton, cartButton, favoriteButton);
  body.append(badge, category, title, rating, description, price, status, actions);
  card.append(picture, body);
  return card;
}

function renderProducts(productsToRender, totalFound) {
  const productsContainer = document.querySelector('[data-products-container]');
  const catalogCount = document.querySelector('.catalog-count');
  const catalogEmpty = document.querySelector('.catalog-empty');
  if (!productsContainer) {
    return;
  }
  productsContainer.replaceChildren();
  productsToRender.forEach((product) => productsContainer.append(createProductCard(product)));

  if (catalogCount) {
    if (totalFound === 0) {
      catalogCount.textContent = 'Найдено товаров: 0';
    } else {
      const first = (catalogState.page - 1) * catalogState.pageSize + 1;
      const last = first + productsToRender.length - 1;
      catalogCount.textContent = `Найдено товаров: ${totalFound}. Показано ${first}–${last}.`;
    }
  }
  if (catalogEmpty) {
    catalogEmpty.hidden = totalFound > 0;
  }
}

function renderPagination(totalPages) {
  const pagination = document.querySelector('[data-pagination]');
  if (!pagination) {
    return;
  }
  pagination.replaceChildren();
  pagination.hidden = totalPages <= 1;
  if (totalPages <= 1) {
    return;
  }

  function addPageButton(label, page, disabled, current) {
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('btn', current ? 'btn--primary' : 'btn--ghost');
    button.textContent = label;
    button.dataset.page = String(page);
    button.disabled = disabled;
    if (current) {
      button.setAttribute('aria-current', 'page');
    }
    button.setAttribute('aria-label', current ? `Страница ${page}, текущая` : `Страница ${page}`);
    pagination.append(button);
  }

  addPageButton('Назад', catalogState.page - 1, catalogState.page === 1, false);
  for (let page = 1; page <= totalPages; page += 1) {
    addPageButton(String(page), page, false, page === catalogState.page);
  }
  addPageButton('Вперёд', catalogState.page + 1, catalogState.page === totalPages, false);
}

function updateCatalog() {
  const preparedProducts = getCatalogPreparedProducts(products, catalogState);
  const totalPages = Math.max(1, Math.ceil(preparedProducts.length / catalogState.pageSize));
  catalogState.page = Math.min(catalogState.page, totalPages);
  const start = (catalogState.page - 1) * catalogState.pageSize;
  const pageProducts = preparedProducts.slice(start, start + catalogState.pageSize);
  renderProducts(pageProducts, preparedProducts.length);
  renderPagination(totalPages);
}

function resetCatalog() {
  const form = document.querySelector('#catalog-filters');
  if (form) {
    form.reset();
  }
  Object.assign(catalogState, {
    query: '', category: 'all', sort: 'default', availableOnly: false,
    favoritesOnly: false, minPrice: null, maxPrice: null, page: 1
  });
  updateCatalog();
}

function readNumericInput(input) {
  if (!input || input.value.trim() === '') {
    return null;
  }
  const value = Number(input.value);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function initCatalog() {
  const productsContainer = document.querySelector('[data-products-container]');
  if (!productsContainer) {
    return;
  }
  const searchInput = document.querySelector('#catalog-search');
  const categoryFilter = document.querySelector('#category-filter');
  const sortSelect = document.querySelector('#sort-select');
  const priceFrom = document.querySelector('#price-from');
  const priceTo = document.querySelector('#price-to');
  const availableOnly = document.querySelector('#available-only');
  const favoritesOnly = document.querySelector('#favorites-only');
  const filtersForm = document.querySelector('#catalog-filters');
  const resetButton = document.querySelector('#filters-reset');
  const pagination = document.querySelector('[data-pagination]');

  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      catalogState.query = event.target.value;
      catalogState.page = 1;
      updateCatalog();
    });
  }
  if (categoryFilter) {
    categoryFilter.addEventListener('change', (event) => {
      catalogState.category = event.target.value;
      catalogState.page = 1;
      updateCatalog();
    });
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', (event) => {
      catalogState.sort = event.target.value;
      catalogState.page = 1;
      updateCatalog();
    });
  }
  [priceFrom, priceTo].forEach((input) => {
    if (input) {
      input.addEventListener('input', () => {
        catalogState.minPrice = readNumericInput(priceFrom);
        catalogState.maxPrice = readNumericInput(priceTo);
        catalogState.page = 1;
        updateCatalog();
      });
    }
  });
  if (availableOnly) {
    availableOnly.addEventListener('change', (event) => {
      catalogState.availableOnly = event.target.checked;
      catalogState.page = 1;
      updateCatalog();
    });
  }
  if (favoritesOnly) {
    favoritesOnly.addEventListener('change', (event) => {
      catalogState.favoritesOnly = event.target.checked;
      catalogState.page = 1;
      updateCatalog();
    });
  }
  if (filtersForm) {
    filtersForm.addEventListener('submit', (event) => {
      event.preventDefault();
      catalogState.page = 1;
      updateCatalog();
    });
  }
  if (resetButton) {
    resetButton.addEventListener('click', resetCatalog);
  }
  if (pagination) {
    pagination.addEventListener('click', (event) => {
      const button = event.target.closest('[data-page]');
      if (!button || button.disabled) {
        return;
      }
      catalogState.page = Number(button.dataset.page);
      updateCatalog();
      document.querySelector('#results-title').focus({ preventScroll: false });
    });
  }

  productsContainer.addEventListener('click', (event) => {
    const favoriteButton = event.target.closest('[data-action="favorite"]');
    if (!favoriteButton) {
      return;
    }
    const productId = Number(favoriteButton.dataset.productId);
    const previousIds = [...favoriteIds];
    favoriteIds = favoriteIds.includes(productId)
      ? favoriteIds.filter((id) => id !== productId)
      : [...favoriteIds, productId];
    if (!writeStorage(STORAGE_KEYS.favorites, favoriteIds)) {
      favoriteIds = previousIds;
      return;
    }
    updateCatalog();
  });

  document.addEventListener('favorites:changed', () => {
    favoriteIds = readStorageArray(STORAGE_KEYS.favorites).filter((id) => findProductById(products, id));
    updateCatalog();
  });

  updateCatalog();
}

if (typeof document !== 'undefined') {
  initCatalog();
}
