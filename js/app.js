document.addEventListener('DOMContentLoaded', function () {
  var toastElement = document.getElementById('formToast');

  document.querySelectorAll('form[data-toast-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      if (!form.checkValidity()) {
        return;
      }

      event.preventDefault();

      if (toastElement && window.bootstrap) {
        window.bootstrap.Toast.getOrCreateInstance(toastElement).show();
      }

      var modalElement = form.closest('.modal');
      if (modalElement && window.bootstrap) {
        window.bootstrap.Modal.getOrCreateInstance(modalElement).hide();
      }

      form.reset();
    });
  });

  document.querySelectorAll('a[aria-label="Наверх"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
});
