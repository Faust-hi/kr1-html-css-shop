// =====================================
// Модальное окно заявки
// =====================================

// Получаем модальное окно по id.
const orderDialog = document.getElementById('order-dialog');
// Получаем форму заявки.
const orderForm = document.getElementById('order-form');
// Получаем кнопку закрытия модального окна.
const closeDialogButton = document.getElementById('close-order-dialog');
// Получаем скрытое поле, в которое будет записан выбранный товар.
const selectedProductInput = document.getElementById('selected-product');
// Получаем сообщение об успешной отправке.
const successMessage = document.getElementById('success-message');

// Скрипт выполняется только на страницах, где есть модальное окно и форма.
// Это позволяет позже подключать js/main.js и к другим страницам сайта без ошибок.
if (orderDialog && orderForm) {
  // Получаем все кнопки заказа в карточках товаров.
  const orderButtons = document.querySelectorAll('.product-card__button');

  // Перебираем все кнопки «Заказать».
  orderButtons.forEach((button) => {
    button.addEventListener('click', () => {
      // Получаем название товара из data-атрибута.
      const productName = button.dataset.product;
      // Записываем название товара в скрытое поле формы.
      selectedProductInput.value = productName;
      // Открываем модальное окно.
      orderDialog.showModal();
    });
  });

  // Закрываем модальное окно по кнопке «Закрыть».
  if (closeDialogButton) {
    closeDialogButton.addEventListener('click', () => {
      orderDialog.close();
    });
  }

  // Обрабатываем отправку формы.
  orderForm.addEventListener('submit', (event) => {
    // Отменяем стандартную отправку формы,
    // потому что backend пока не подключён.
    event.preventDefault();

    // Сбрасываем предыдущие признаки ошибок.
    const formElements = Array.from(orderForm.elements);
    formElements.forEach((element) => {
      if (element.willValidate) {
        element.removeAttribute('aria-invalid');
      }
    });

    // Проверяем встроенные HTML-ограничения формы.
    if (!orderForm.checkValidity()) {
      formElements.forEach((element) => {
        if (element.willValidate && !element.checkValidity()) {
          element.setAttribute('aria-invalid', 'true');
        }
      });
      // Показываем стандартные сообщения браузера.
      orderForm.reportValidity();
      return;
    }

    // Показываем сообщение об успешной отправке.
    if (successMessage) {
      successMessage.hidden = false;
    }
    // Очищаем форму.
    orderForm.reset();
    // Закрываем модальное окно.
    orderDialog.close();
  });
}