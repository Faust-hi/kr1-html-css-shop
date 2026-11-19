function initProductModal() {
  const dialog = document.querySelector('#product-dialog');
  if (!dialog) {
    return;
  }
  let opener = null;

  function openProductDialog(product, trigger) {
    opener = trigger;
    const image = dialog.querySelector('#dialog-image');
    const title = dialog.querySelector('#dialog-title');
    const category = dialog.querySelector('#dialog-category');
    const description = dialog.querySelector('#dialog-description');
    const rating = dialog.querySelector('#dialog-rating');
    const price = dialog.querySelector('#dialog-price');
    const status = dialog.querySelector('#dialog-status');
    const cartButton = dialog.querySelector('[data-action="add-to-cart"]');
    const detailsLink = dialog.querySelector('#dialog-details');
    const dialogMessage = dialog.querySelector('[data-dialog-cart-message]');

    if (!image || !title || !category || !description || !rating || !price || !status || !cartButton || !detailsLink) {
      return;
    }

    image.src = product.image;
    image.srcset = product.srcset;
    image.sizes = product.sizes;
    image.alt = product.imageAlt;
    image.width = product.width;
    image.height = product.height;
    title.textContent = product.title;
    category.textContent = CATEGORY_LABELS[product.category];
    description.textContent = product.description;
    rating.textContent = `Рейтинг: ${product.rating.toFixed(1)}/5`;
    price.textContent = formatFinalPrice(product);
    status.textContent = getProductStatus(product);
    detailsLink.href = `product.html?id=${product.id}`;
    cartButton.dataset.productId = String(product.id);
    cartButton.disabled = !product.isAvailable;
    cartButton.textContent = product.isAvailable ? 'В корзину' : 'Недоступно';
    if (dialogMessage) {
      dialogMessage.textContent = '';
    }
    dialog.showModal();
  }

  document.addEventListener('click', (event) => {
    const quickViewButton = event.target.closest('[data-action="quick-view"]');
    if (quickViewButton) {
      const product = findProductById(products, Number(quickViewButton.dataset.productId));
      if (product) {
        openProductDialog(product, quickViewButton);
      }
      return;
    }
    if (event.target.closest('[data-dialog-close]')) {
      dialog.close();
      return;
    }
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener('close', () => {
    if (opener && document.contains(opener)) {
      opener.focus();
    }
  });
}

if (typeof document !== 'undefined') {
  initProductModal();
}
