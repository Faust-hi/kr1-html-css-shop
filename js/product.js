function getRequestedProduct() {
  const rawId = new URLSearchParams(window.location.search).get('id');
  if (rawId === null || rawId.trim() === '') {
    return products[0];
  }
  return findProductById(products, Number(rawId));
}

function renderRequestedProduct() {
  const container = document.querySelector('[data-product-page]');
  if (!container) {
    return;
  }
  const product = getRequestedProduct();
  const notFound = document.querySelector('[data-product-not-found]');
  const content = document.querySelector('[data-product-content]');

  if (!product) {
    if (notFound) {
      notFound.hidden = false;
    }
    if (content) {
      content.hidden = true;
    }
    document.title = 'Товар не найден — ShopProject';
    return;
  }

  if (notFound) {
    notFound.hidden = true;
  }
  if (content) {
    content.hidden = false;
  }

  const image = container.querySelector('.product-photo');
  const title = container.querySelector('#product-title');
  const badge = container.querySelector('.product-badge');
  const lead = container.querySelector('.product-lead');
  const priceBox = container.querySelector('.product-price');
  const cartButton = container.querySelector('[data-action="add-to-cart"]');
  const orderLink = container.querySelector('[data-order-link]');
  const tableBody = container.querySelector('.spec-table tbody');
  const caption = container.querySelector('.spec-table caption');

  if (!image || !title || !badge || !lead || !priceBox || !cartButton || !orderLink || !tableBody || !caption) {
    return;
  }

  image.src = product.image;
  image.srcset = product.srcset;
  image.sizes = product.sizes;
  image.alt = product.imageAlt;
  image.width = product.width;
  image.height = product.height;

  title.textContent = product.title;
  document.title = `${product.title} — ShopProject`;
  badge.textContent = product.discountPercent > 0 ? `Скидка ${product.discountPercent}%` : getProductStatus(product);
  lead.textContent = product.description;
  priceBox.textContent = formatFinalPrice(product);

  cartButton.dataset.productId = String(product.id);
  cartButton.disabled = !product.isAvailable;
  cartButton.textContent = product.isAvailable ? 'В корзину' : 'Недоступно';

  orderLink.href = `order.html?id=${product.id}`;

  const currentCrumb = container.querySelector('[data-current-product]');
  if (currentCrumb) {
    currentCrumb.textContent = product.title;
  }

  tableBody.replaceChildren();
  const rows = [
    ['Категория', CATEGORY_LABELS[product.category]],
    ...product.specs,
    ['Рейтинг', `${product.rating.toFixed(1)}/5`],
    ['Цена', formatFinalPrice(product)],
    ['Наличие', getProductStatus(product)]
  ];
  rows.forEach(([label, value]) => {
    const row = document.createElement('tr');
    const heading = document.createElement('th');
    heading.scope = 'row';
    heading.textContent = label;
    const cell = document.createElement('td');
    cell.textContent = value;
    row.append(heading, cell);
    tableBody.append(row);
  });
  caption.textContent = `Характеристики: ${product.title}`;
}

if (typeof document !== 'undefined') {
  renderRequestedProduct();
}
