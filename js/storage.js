const STORAGE_KEYS = Object.freeze({
  cart: 'shopproject.cart.v1',
  promo: 'shopproject.promo.v1',
  favorites: 'shopproject.favorites.v1'
});

function readStorage(key, fallback) {
  try {
    const text = localStorage.getItem(key);
    return text === null ? fallback : JSON.parse(text);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function readStorageArray(key) {
  const value = readStorage(key, []);
  return Array.isArray(value) ? value : [];
}
