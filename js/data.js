const CATEGORY_LABELS = {
  smartphones: 'Смартфоны',
  headphones: 'Наушники',
  fridges: 'Холодильники'
};

const PROMO_CODE = 'SHOP10';
const PROMO_DISCOUNT = 0.1;
const MAX_CART_QUANTITY = 99;

function createProduct(data) {
  return {
    id: data.id,
    title: data.title,
    category: data.category,
    price: data.price,
    discountPercent: data.discountPercent,
    rating: data.rating,
    isAvailable: data.isAvailable,
    image: data.image,
    imageAlt: data.imageAlt,
    description: data.description,
    specs: data.specs,
    srcset: data.srcset,
    sizes: '(min-width: 1200px) 360px, (min-width: 768px) 45vw, 92vw',
    width: data.width,
    height: data.height,
    webp: data.webp || '',
    webpSrcset: data.webpSrcset || ''
  };
}

const auroraImage = {
  image: 'images/aurora-67.jpg',
  srcset: 'images/aurora-67-320w.jpg 320w, images/aurora-67.jpg 335w',
  width: 335,
  height: 597,
  webp: 'images/aurora-67.webp',
  webpSrcset: 'images/aurora-67-320w.webp 320w, images/aurora-67.webp 335w'
};

const bassImage = {
  image: 'images/BassLine-Pro.jpg',
  srcset: 'images/BassLine-Pro-320w.jpg 320w, images/BassLine-Pro.jpg 439w',
  width: 439,
  height: 455
};

const volvaImage = {
  image: 'images/volva-h16.jpg',
  srcset: 'images/volva-h16-320w.jpg 320w, images/volva-h16.jpg 447w',
  width: 447,
  height: 447
};

const products = [
  createProduct({
    ...auroraImage,
    id: 1,
    title: 'Смартфон Aurora 67',
    category: 'smartphones',
    price: 24990,
    discountPercent: 0,
    rating: 4.8,
    isAvailable: true,
    imageAlt: 'Смартфон Aurora 67 с задней крышкой в открытой упаковке',
    description: 'AMOLED 6.5", 128 ГБ, камера 50 Мп и батарея 5000 мА·ч.',
    specs: [['Экран', 'AMOLED 6.5"'], ['Память', '128 ГБ'], ['Камера', '50 Мп'], ['Батарея', '5000 мА·ч']]
  }),
  createProduct({
    ...auroraImage,
    id: 2,
    title: 'Смартфон Aurora 67 Pro',
    category: 'smartphones',
    price: 29990,
    discountPercent: 10,
    rating: 4.9,
    isAvailable: true,
    imageAlt: 'Смартфон серии Aurora 67 с задней крышкой в открытой упаковке',
    description: 'Версия Pro с 256 ГБ, AMOLED 120 Гц и быстрой зарядкой 67 Вт.',
    specs: [['Экран', 'AMOLED 6.7", 120 Гц'], ['Память', '256 ГБ'], ['Камера', '50 + 12 Мп'], ['Зарядка', '67 Вт']]
  }),
  createProduct({
    ...volvaImage,
    id: 3,
    title: 'volva h16',
    category: 'smartphones',
    price: 12990,
    discountPercent: 15,
    rating: 4.5,
    isAvailable: true,
    imageAlt: 'Грузовик с авиационными двигателями — шуточная обложка смартфона volva h16',
    description: 'AMOLED, защита IP68 и фирменная мемная обложка серии volva.',
    specs: [['Экран', 'AMOLED 6.1"'], ['Память', '128 ГБ'], ['Защита', 'IP68'], ['Батарея', '4500 мА·ч']]
  }),
  createProduct({
    ...volvaImage,
    id: 4,
    title: 'volva h16 Lite',
    category: 'smartphones',
    price: 9990,
    discountPercent: 0,
    rating: 4.3,
    isAvailable: false,
    imageAlt: 'Грузовик с авиационными двигателями — шуточная обложка volva h16 Lite',
    description: 'Компактная версия с AMOLED и 64 ГБ; следующая поставка ожидается.',
    specs: [['Экран', 'AMOLED 5.9"'], ['Память', '64 ГБ'], ['Защита', 'IP67'], ['Батарея', '4000 мА·ч']]
  }),
  createProduct({
    ...bassImage,
    id: 5,
    title: 'Наушники BassLine Pro',
    category: 'headphones',
    price: 7490,
    discountPercent: 0,
    rating: 4.7,
    isAvailable: true,
    imageAlt: 'Кот в наушниках — шуточная обложка BassLine Pro',
    description: 'Беспроводные, активное шумоподавление и до 30 часов работы.',
    specs: [['Тип', 'Полноразмерные'], ['Шумоподавление', 'Активное'], ['Работа', 'до 30 часов'], ['Зарядка', 'USB-C']]
  }),
  createProduct({
    ...bassImage,
    id: 6,
    title: 'Наушники BassLine Air',
    category: 'headphones',
    price: 4990,
    discountPercent: 10,
    rating: 4.4,
    isAvailable: true,
    imageAlt: 'Кот в наушниках — шуточная обложка BassLine Air',
    description: 'Лёгкие накладные наушники с 20 часами работы и мягкими амбушюрами.',
    specs: [['Тип', 'Накладные'], ['Шумоподавление', 'Пассивное'], ['Работа', 'до 20 часов'], ['Вес', '180 г']]
  }),
  createProduct({
    ...bassImage,
    id: 7,
    title: 'Наушники BassLine Studio',
    category: 'headphones',
    price: 9990,
    discountPercent: 5,
    rating: 4.8,
    isAvailable: false,
    imageAlt: 'Кот в наушниках — шуточная обложка BassLine Studio',
    description: 'Мониторная модель с кабелем и нейтральным звучанием для домашней студии.',
    specs: [['Тип', 'Мониторные'], ['Подключение', 'Кабель / Bluetooth'], ['Импеданс', '32 Ом'], ['Кабель', '2 м']]
  }),
  createProduct({
    ...volvaImage,
    id: 8,
    title: 'Холодильник Volva Freeze H16',
    category: 'fridges',
    price: 54990,
    discountPercent: 10,
    rating: 4.6,
    isAvailable: true,
    imageAlt: 'Грузовик с авиационными двигателями — шуточная обложка холодильника Volva Freeze H16',
    description: 'Двухкамерный No Frost, 320 литров и отдельная зона свежести.',
    specs: [['Тип', 'Двухкамерный'], ['Объём', '320 л'], ['Разморозка', 'No Frost'], ['Класс', 'A++']]
  }),
  createProduct({
    ...volvaImage,
    id: 9,
    title: 'Холодильник Volva Freeze Mini',
    category: 'fridges',
    price: 32990,
    discountPercent: 0,
    rating: 4.2,
    isAvailable: true,
    imageAlt: 'Грузовик с авиационными двигателями — шуточная обложка холодильника Volva Freeze Mini',
    description: 'Компактный вариант на 180 литров для небольшой кухни или дачи.',
    specs: [['Тип', 'Однокамерный'], ['Объём', '180 л'], ['Разморозка', 'Low Frost'], ['Класс', 'A+']]
  }),
  createProduct({
    ...volvaImage,
    id: 10,
    title: 'Холодильник Volva Freeze Duo',
    category: 'fridges',
    price: 69990,
    discountPercent: 20,
    rating: 4.9,
    isAvailable: false,
    imageAlt: 'Грузовик с авиационными двигателями — шуточная обложка холодильника Volva Freeze Duo',
    description: 'Side-by-side с диспенсером воды и 430 литрами полезного объёма.',
    specs: [['Тип', 'Side-by-side'], ['Объём', '430 л'], ['Разморозка', 'Total No Frost'], ['Диспенсер', 'Вода и лёд']]
  })
];
