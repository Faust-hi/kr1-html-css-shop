let cartItems = readStorageArray(STORAGE_KEYS.cart).filter((item) => {
  if (!item || typeof item !== 'object') {
    return false;
  }
  const product = findProductById(products, item.productId);
  return product && product.isAvailable && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= MAX_CART_QUANTITY;
});
let promoCode = readStorage(STORAGE_KEYS.promo, '') === PROMO_CODE ? PROMO_CODE : '';

function cloneCartItems(items) {
  return items.map((item) => ({ ...item }));
}

function getCartCount() {
  return cartItems.reduce((count, item) => count + item.quantity, 0);
}

function saveCart() {
  return writeStorage(STORAGE_KEYS.cart, cartItems);
}

function notifyCartChanged() {
  if (typeof document !== 'undefined') {
    document.dispatchEvent(new CustomEvent('cart:changed'));
  }
}

function addToCart(productId) {
  const product = findProductById(products, productId);
  if (!product || !product.isAvailable) {
    return false;
  }
  const previousItems = cloneCartItems(cartItems);
  const existingItem = cartItems.find((item) => item.productId === productId);
  if (existingItem) {
    if (existingItem.quantity >= MAX_CART_QUANTITY) {
      return false;
    }
    existingItem.quantity += 1;
  } else {
    cartItems = [...cartItems, { productId, quantity: 1 }];
  }
  if (!saveCart()) {
    cartItems = previousItems;
    return false;
  }
  notifyCartChanged();
  return true;
}

function removeFromCart(productId) {
  const previousItems = cloneCartItems(cartItems);
  cartItems = cartItems.filter((item) => item.productId !== productId);
  if (!saveCart()) {
    cartItems = previousItems;
    return;
  }
  notifyCartChanged();
}

function setCartQuantity(productId, quantity) {
  const item = cartItems.find((entry) => entry.productId === productId);
  if (!item || !Number.isFinite(Number(quantity))) {
    return;
  }
  const normalizedQuantity = Math.trunc(Number(quantity));
  if (normalizedQuantity <= 0) {
    removeFromCart(productId);
    return;
  }
  const previousItems = cloneCartItems(cartItems);
  item.quantity = Math.min(MAX_CART_QUANTITY, normalizedQuantity);
  if (!saveCart()) {
    cartItems = previousItems;
    return;
  }
  notifyCartChanged();
}

function clearCart() {
  const previousItems = cloneCartItems(cartItems);
  const previousPromo = promoCode;
  cartItems = [];
  promoCode = '';
  const cartSaved = saveCart();
  const promoSaved = writeStorage(STORAGE_KEYS.promo, promoCode);
  if (!cartSaved || !promoSaved) {
    cartItems = previousItems;
    promoCode = previousPromo;
    writeStorage(STORAGE_KEYS.cart, cartItems);
    writeStorage(STORAGE_KEYS.promo, promoCode);
    return;
  }
  notifyCartChanged();
}

function getPromoCode() {
  return promoCode;
}

function applyPromoCode(code) {
  const normalizedCode = String(code).trim().toUpperCase();
  if (normalizedCode !== PROMO_CODE) {
    return false;
  }
  const previousPromo = promoCode;
  promoCode = PROMO_CODE;
  if (!writeStorage(STORAGE_KEYS.promo, promoCode)) {
    promoCode = previousPromo;
    return false;
  }
  notifyCartChanged();
  return true;
}

function calculateCartTotals() {
  const totals = cartItems.reduce((result, item) => {
    const product = findProductById(products, item.productId);
    if (!product) {
      return result;
    }
    const discountedPrice = getUnitPrice(product);
    result.count += item.quantity;
    result.subtotal += discountedPrice * item.quantity;
    return result;
  }, { count: 0, subtotal: 0 });
  const promoDiscount = promoCode === PROMO_CODE ? Math.round(totals.subtotal * PROMO_DISCOUNT) : 0;
  return {
    count: totals.count,
    subtotal: totals.subtotal,
    promoDiscount,
    total: Math.max(0, totals.subtotal - promoDiscount)
  };
}

function updateCartCounters() {
  if (typeof document === 'undefined') {
    return;
  }
  const count = getCartCount();
  document.querySelectorAll('[data-cart-count]').forEach((element) => {
    element.textContent = `Корзина: ${count}`;
  });
}

function renderCartTotals() {
  if (typeof document === 'undefined') {
    return;
  }
  const totals = calculateCartTotals();
  const subtotal = document.querySelector('[data-cart-subtotal]');
  const discount = document.querySelector('[data-cart-discount]');
  const total = document.querySelector('[data-cart-total]');
  const discountRow = document.querySelector('[data-discount-row]');
  if (subtotal) {
    subtotal.textContent = formatPrice(totals.subtotal);
  }
  if (discount) {
    discount.textContent = `−${formatPrice(totals.promoDiscount)}`;
  }
  if (total) {
    total.textContent = formatPrice(totals.total);
  }
  if (discountRow) {
    discountRow.hidden = totals.promoDiscount === 0;
  }
}

function createCartItemElement(item) {
  const product = findProductById(products, item.productId);
  const article = document.createElement('article');
  article.classList.add('cart-item');
  article.dataset.productId = String(product.id);

  const image = document.createElement('img');
  image.classList.add('cart-item__image');
  image.src = product.image;
  image.alt = product.imageAlt;
  image.width = product.width;
  image.height = product.height;
  image.loading = 'lazy';

  const body = document.createElement('div');
  body.classList.add('cart-item__body');
  const title = document.createElement('h2');
  title.textContent = product.title;
  const price = document.createElement('p');
  price.classList.add('price');
  price.textContent = `${formatFinalPrice(product)} за штуку`;
  body.append(title, price);

  const quantityLabel = document.createElement('label');
  quantityLabel.textContent = 'Количество';
  const quantityInput = document.createElement('input');
  quantityInput.type = 'number';
  quantityInput.min = '1';
  quantityInput.max = String(MAX_CART_QUANTITY);
  quantityInput.value = String(item.quantity);
  quantityInput.dataset.cartQuantity = String(product.id);
  quantityInput.setAttribute('aria-label', `Количество: ${product.title}`);
  quantityLabel.append(quantityInput);

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.classList.add('btn', 'btn--ghost');
  removeButton.dataset.cartRemove = String(product.id);
  removeButton.textContent = 'Удалить';
  removeButton.setAttribute('aria-label', `Удалить ${product.title} из корзины`);
  body.append(quantityLabel, removeButton);

  const lineTotal = document.createElement('p');
  lineTotal.classList.add('cart-item__total', 'price');
  const unitPrice = getUnitPrice(product);
  lineTotal.textContent = formatPrice(unitPrice * item.quantity);
  article.append(image, body, lineTotal);
  return article;
}

function renderCartPage() {
  if (typeof document === 'undefined') {
    return;
  }
  const container = document.querySelector('[data-cart-items]');
  const empty = document.querySelector('[data-cart-empty]');
  const content = document.querySelector('[data-cart-content]');
  if (!container) {
    renderCartTotals();
    return;
  }
  container.replaceChildren();
  cartItems.forEach((item) => container.append(createCartItemElement(item)));
  if (empty) {
    empty.hidden = cartItems.length > 0;
  }
  if (content) {
    content.hidden = cartItems.length === 0;
  }
  const promoInput = document.querySelector('#promo-code');
  if (promoInput) {
    promoInput.value = promoCode;
  }
  renderCartTotals();
}

function renderOrderSummary() {
  if (typeof document === 'undefined') {
    return;
  }
  const container = document.querySelector('[data-order-summary]');
  if (!container) {
    return;
  }
  container.replaceChildren();
  const heading = document.createElement('h2');
  heading.textContent = 'Ваша корзина';
  container.append(heading);

  if (cartItems.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'Корзина пуста. Можно выбрать один товар в форме ниже или перейти в каталог.';
    const link = document.createElement('a');
    link.href = 'catalog.html';
    link.textContent = 'Перейти в каталог';
    container.append(empty, link);
    return;
  }

  const list = document.createElement('ul');
  list.classList.add('order-summary__list');
  cartItems.forEach((item) => {
    const product = findProductById(products, item.productId);
    const line = document.createElement('li');
    const unitPrice = getUnitPrice(product);
    line.textContent = `${product.title} — ${item.quantity} × ${formatPrice(unitPrice)}`;
    list.append(line);
  });
  const total = document.createElement('p');
  total.classList.add('price');
  total.textContent = `Итого: ${formatPrice(calculateCartTotals().total)}`;
  container.append(list, total);
}

function initCart() {
  updateCartCounters();
  renderCartPage();
  renderOrderSummary();

  document.addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-action="add-to-cart"]');
    if (addButton) {
      const productId = Number(addButton.dataset.productId);
      const product = findProductById(products, productId);
      if (addToCart(productId)) {
        const confirmation = `${product.title}: добавлено в корзину.`;
        const pageMessage = document.querySelector('main [data-cart-message]');
        if (pageMessage) {
          pageMessage.textContent = confirmation;
        }
        const dialogMessage = document.querySelector('[data-dialog-cart-message]');
        if (dialogMessage) {
          dialogMessage.textContent = confirmation;
        }
      }
      return;
    }

    const removeButton = event.target.closest('[data-cart-remove]');
    if (removeButton) {
      removeFromCart(Number(removeButton.dataset.cartRemove));
      return;
    }

    const clearButton = event.target.closest('[data-cart-clear]');
    if (clearButton && cartItems.length > 0) {
      clearCart();
    }
  });

  document.addEventListener('change', (event) => {
    const quantityInput = event.target.closest('[data-cart-quantity]');
    if (quantityInput) {
      setCartQuantity(Number(quantityInput.dataset.cartQuantity), Number(quantityInput.value));
    }
  });

  const promoForm = document.querySelector('#promo-form');
  if (promoForm) {
    promoForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = promoForm.querySelector('#promo-code');
      const message = promoForm.querySelector('#promo-message');
      if (!input || !message) {
        return;
      }
      const applied = applyPromoCode(input.value);
      message.textContent = applied ? 'Промокод SHOP10 применён: скидка 10%.' : 'Промокод не найден. Проверьте SHOP10.';
    });
  }

  document.addEventListener('cart:changed', () => {
    updateCartCounters();
    renderCartPage();
    renderOrderSummary();
  });

  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEYS.cart) {
      cartItems = readStorageArray(STORAGE_KEYS.cart).filter((item) => {
        const product = item && findProductById(products, item.productId);
        return product && product.isAvailable && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= MAX_CART_QUANTITY;
      });
      updateCartCounters();
      renderCartPage();
      renderOrderSummary();
      return;
    }
    if (event.key === STORAGE_KEYS.promo) {
      promoCode = readStorage(STORAGE_KEYS.promo, '') === PROMO_CODE ? PROMO_CODE : '';
      renderCartPage();
      renderOrderSummary();
      return;
    }
    if (event.key === STORAGE_KEYS.favorites) {
      document.dispatchEvent(new CustomEvent('favorites:changed'));
    }
  });
}

if (typeof document !== 'undefined') {
  initCart();
}
