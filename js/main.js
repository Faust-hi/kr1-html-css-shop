function formatPrice(price) {
  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(price))} руб.`;
}

function calculateDiscount(price, discountPercent) {
  return price * discountPercent / 100;
}

function calculateFinalPrice(price, discountPercent) {
  const discountValue = calculateDiscount(price, discountPercent);
  return price - discountValue;
}

function getProductStatus(product) {
  if (product.isAvailable) {
    return 'В наличии';
  }
  return 'Нет в наличии';
}

function createProductSummary(product) {
  const finalPrice = calculateFinalPrice(product.price, product.discountPercent);
  const status = getProductStatus(product);
  return `${product.title}: ${formatPrice(finalPrice)}. Статус: ${status}.`;
}

function getProductTitles(products) {
  return products.map((product) => product.title);
}

function getAvailableProducts(products) {
  return products.filter((product) => product.isAvailable);
}

function searchProducts(products, query) {
  const normalizedQuery = String(query).trim().toLowerCase();
  if (normalizedQuery === '') {
    return products;
  }
  return products.filter((product) => product.title.toLowerCase().includes(normalizedQuery));
}

function filterProductsByCategory(products, category) {
  if (category === 'all') {
    return products;
  }
  return products.filter((product) => product.category === category);
}

function getFinalPrice(product) {
  return calculateFinalPrice(product.price, product.discountPercent);
}

function getUnitPrice(product) {
  return Math.round(getFinalPrice(product));
}

function formatFinalPrice(product) {
  return formatPrice(getUnitPrice(product));
}

function sortProductsByPrice(products, direction = 'asc') {
  const productsCopy = [...products];
  if (direction === 'desc') {
    return productsCopy.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
  }
  return productsCopy.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
}


function sortProducts(products, sortType) {
  if (sortType === 'title-asc') {
    return [...products].sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  }
  if (sortType === 'price-desc') {
    return sortProductsByPrice(products, 'desc');
  }
  if (sortType === 'price-asc') {
    return sortProductsByPrice(products, 'asc');
  }
  return [...products];
}

function findProductById(products, id) {
  return products.find((product) => product.id === id);
}

function calculateTotalPrice(products) {
  return products.reduce((sum, product) => sum + product.price, 0);
}

function countAvailableProducts(products) {
  return products.filter((product) => product.isAvailable).length;
}

function calculateAveragePrice(products) {
  if (products.length === 0) {
    return 0;
  }
  return Math.round(calculateTotalPrice(products) / products.length);
}

function populateProductSelect() {
  const select = document.querySelector('#order-product');
  if (!select) {
    return;
  }
  const currentValue = select.value;
  select.replaceChildren();
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Выберите товар';
  select.append(placeholder);
  products.forEach((product) => {
    const option = document.createElement('option');
    option.value = String(product.id);
    option.textContent = product.title;
    select.append(option);
  });
  if (findProductById(products, Number(currentValue))) {
    select.value = currentValue;
  }
}

function initMobileNavigation() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const list = document.querySelector('#primary-navigation');
  if (!toggle || !list) {
    return;
  }
  const mobileQuery = window.matchMedia('(max-width: 767px)');

  function setMenu(open) {
    list.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Закрыть' : 'Меню';
  }

  toggle.addEventListener('click', () => {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  list.addEventListener('click', (event) => {
    if (event.target.closest('a') && mobileQuery.matches) {
      setMenu(false);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });
  const onMediaChange = () => setMenu(false);
  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', onMediaChange);
  } else if (typeof mobileQuery.addListener === 'function') {
    mobileQuery.addListener(onMediaChange);
  }
  setMenu(false);
}

function logLearningOutput() {
  const product = products[0];
  console.log('Файл main.js подключён');
  console.log(product);
  console.table(product);
  console.log(formatPrice(product.price));
  console.log(calculateDiscount(product.price, product.discountPercent));
  console.log(calculateFinalPrice(product.price, product.discountPercent));
  console.log(getProductStatus(product));
  console.log(createProductSummary(product));
  console.table(products);
  console.log(getProductTitles(products));
  console.table(getAvailableProducts(products));
  console.table(searchProducts(products, 'aurora'));
  console.table(filterProductsByCategory(products, 'smartphones'));
  console.table(sortProductsByPrice(products, 'asc'));
  console.log(findProductById(products, 3));
  console.log(calculateTotalPrice(products));
  console.log(countAvailableProducts(products));
  console.log(calculateAveragePrice(products));
  console.table(sortProductsByPrice(filterProductsByCategory(searchProducts(products, 'aurora'), 'smartphones'), 'asc'));
}

function initLearningOutput() {
  const product = products[0];
  const demoSection = document.querySelector('.js-check');
  if (demoSection) {
    logLearningOutput();
  }

  const messageElement = document.querySelector('.js-message');
  const productOutputElement = document.querySelector('.product-output');
  if (messageElement) {
    messageElement.textContent = 'Массив товаров и функции обработки данных подключены.';
  }
  if (productOutputElement) {
    productOutputElement.textContent = [
      createProductSummary(product),
      `Всего товаров: ${products.length}`,
      `Товаров в наличии: ${countAvailableProducts(products)}`,
      `Средняя цена: ${formatPrice(calculateAveragePrice(products))}`,
      `Результатов поиска "aurora": ${searchProducts(products, 'aurora').length}`
    ].join('\n');
  }
}

function initMain() {
  document.documentElement.classList.add('js');
  initMobileNavigation();
  populateProductSelect();
  initLearningOutput();
}

if (typeof document !== 'undefined') {
  initMain();
}
