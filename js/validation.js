function normalizePhoneDigits(value) {
  const digits = String(value).replace(/\D/g, '');
  if (digits === '') {
    return '';
  }
  if (digits.startsWith('8')) {
    return `7${digits.slice(1)}`;
  }
  return digits.startsWith('7') ? digits : `7${digits}`;
}

function isPhoneValid(value) {
  const digits = normalizePhoneDigits(value);
  return digits.length === 11 && digits.startsWith('7');
}

function formatPhone(value) {
  const digits = normalizePhoneDigits(value);
  if (!digits) {
    return '';
  }
  const visible = digits.slice(0, 11);
  const extra = digits.slice(11);
  const part = visible.slice(1);
  return '+7'
    + (part ? ` (${part.slice(0, 3)}` : '')
    + (part.length >= 3 ? ')' : '')
    + (part.length > 3 ? ` ${part.slice(3, 6)}` : '')
    + (part.length > 6 ? `-${part.slice(6, 8)}` : '')
    + (part.length > 8 ? `-${part.slice(8, 10)}` : '')
    + (extra ? ` [лишние цифры: ${extra}]` : '');
}

function formatPhoneWithCursor(input) {
  const oldValue = input.value;
  const selectionStart = input.selectionStart ?? oldValue.length;
  const digitsBeforeCursor = normalizePhoneDigits(oldValue.slice(0, selectionStart)).length;
  const formatted = formatPhone(oldValue);
  input.value = formatted;

  let digitIndex = 0;
  let cursor = formatted.length;
  for (let index = 0; index < formatted.length; index += 1) {
    if (/\d/.test(formatted[index])) {
      digitIndex += 1;
    }
    if (digitIndex >= digitsBeforeCursor) {
      cursor = index + 1;
      break;
    }
  }
  if (digitsBeforeCursor === 0) {
    cursor = 0;
  }
  input.setSelectionRange(cursor, cursor);
}

function initValidatedForm(form) {
  const formType = form.dataset.validateForm;
  const formMessage = form.querySelector('.form-message');
  const submitButton = form.querySelector('[type="submit"]');

  function errorElement(input) {
    return form.querySelector(`[data-error-for="${input.name}"]`);
  }

  function showError(input, message) {
    if (!input) {
      return;
    }
    const error = errorElement(input);
    if (error) {
      error.textContent = message;
      if (error.id) {
        input.setAttribute('aria-describedby', error.id);
      }
    }
    input.setAttribute('aria-invalid', 'true');
  }

  function clearError(input) {
    if (!input) {
      return;
    }
    const error = errorElement(input);
    if (error) {
      error.textContent = '';
    }
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }

  function validateName() {
    const input = form.elements.name;
    if (!input || input.value.trim().length < 2) {
      showError(input, 'Введите имя не короче 2 символов.');
      return false;
    }
    clearError(input);
    return true;
  }

  function validateEmail() {
    const input = form.elements.email;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!input || !emailPattern.test(input.value.trim())) {
      showError(input, 'Введите корректный e-mail.');
      return false;
    }
    clearError(input);
    return true;
  }

  function validatePhone() {
    const input = form.elements.phone;
    if (!input || !isPhoneValid(input.value)) {
      showError(input, 'Введите полный номер: 11 цифр, начиная с 7 или 8.');
      return false;
    }
    clearError(input);
    return true;
  }

  function validateProduct() {
    if (formType !== 'order') {
      return true;
    }
    const input = form.elements.product;
    const product = input ? findProductById(products, Number(input.value)) : null;
    if (!product) {
      showError(input, 'Выберите товар из списка.');
      return false;
    }
    clearError(input);
    return true;
  }

  function validateMessage() {
    if (formType !== 'contact') {
      return true;
    }
    const input = form.elements.message;
    if (!input || input.value.trim().length < 10) {
      showError(input, 'Опишите вопрос не короче 10 символов.');
      return false;
    }
    clearError(input);
    return true;
  }

  function validateAgreement() {
    const input = form.elements.agreement;
    if (!input || !input.checked) {
      showError(input, 'Подтвердите согласие на обработку данных.');
      return false;
    }
    clearError(input);
    return true;
  }

  function validateForm() {
    const results = [validateName(), validateEmail(), validatePhone(), validateProduct(), validateMessage(), validateAgreement()];
    return results.every(Boolean);
  }

  ['name', 'email', 'product', 'message'].forEach((name) => {
    const input = form.elements[name];
    if (!input) {
      return;
    }
    const validator = { name: validateName, email: validateEmail, product: validateProduct, message: validateMessage }[name];
    input.addEventListener(input.tagName === 'SELECT' ? 'change' : 'input', validator);
  });

  const phoneInput = form.elements.phone;
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      formatPhoneWithCursor(phoneInput);
      validatePhone();
    });
    phoneInput.addEventListener('blur', validatePhone);
  }

  const agreementInput = form.elements.agreement;
  if (agreementInput) {
    agreementInput.addEventListener('change', validateAgreement);
  }

  let isProgrammaticReset = false;

  form.addEventListener('reset', () => {
    window.setTimeout(() => {
      form.querySelectorAll('[aria-invalid]').forEach((input) => {
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
      });
      form.querySelectorAll('[data-error-for]').forEach((error) => { error.textContent = ''; });
      if (formMessage && !isProgrammaticReset) {
        formMessage.textContent = '';
      }
      isProgrammaticReset = false;
    }, 0);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    form.removeAttribute('data-completed');
    if (!validateForm()) {
      if (formMessage) {
        formMessage.textContent = 'Проверьте поля формы.';
      }
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    const requestData = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      phone: normalizePhoneDigits(form.elements.phone.value)
    };
    if (formType === 'order') {
      requestData.productId = Number(form.elements.product.value);
      requestData.topic = form.elements.topic ? form.elements.topic.value : 'order';
      requestData.comment = form.elements.comment ? form.elements.comment.value.trim() : '';
      requestData.cartTotal = calculateCartTotals().total;
    } else {
      requestData.message = form.elements.message.value.trim();
    }
    console.table(requestData);

    form.setAttribute('aria-busy', 'true');
    if (submitButton) {
      submitButton.disabled = true;
    }
    if (formMessage) {
      formMessage.textContent = 'Локальная проверка пройдена. Подготавливаем заявку…';
    }

    window.setTimeout(() => {
      isProgrammaticReset = true;
      form.reset();
      form.removeAttribute('aria-busy');
      form.setAttribute('data-completed', 'true');
      if (submitButton) {
        submitButton.disabled = false;
      }
      if (formMessage) {
        formMessage.textContent = formType === 'order'
          ? 'Заявка подготовлена локально. Данные не отправлены на сервер.'
          : 'Сообщение подготовлено локально. Данные не отправлены на сервер.';
      }
    }, 600);
  });
}

function initValidation() {
  document.querySelectorAll('[data-validate-form]').forEach(initValidatedForm);
  const orderForm = document.querySelector('[data-validate-form="order"]');
  if (orderForm) {
    const requestedId = Number(new URLSearchParams(window.location.search).get('id'));
    if (findProductById(products, requestedId)) {
      orderForm.elements.product.value = String(requestedId);
    }
  }
}

if (typeof document !== 'undefined') {
  initValidation();
}
