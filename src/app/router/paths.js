export const PATHS = Object.freeze({
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAILS: '/products/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDER_SUCCESS: '/order-success',
  AUTH: '/auth',
  ACCOUNT: '/account',
  ORDERS: '/orders',
  WISHLIST: '/wishlist',
  FINDER: '/finder',
  COMPARE: '/compare',
  ABOUT: '/about',
  CONTACT: '/contact',
  FAQ: '/faq',
  POLICIES: '/policies',
  NOT_FOUND: '*',
});

export const productDetails = (id) => `/products/${encodeURIComponent(id)}`;
