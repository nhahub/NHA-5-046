import { createBrowserRouter } from 'react-router-dom';

import Layout from '@shared/components/layout/Layout';

import {
  AboutPage,
  AccountPage,
  AuthPage,
  CartPage,
  CheckoutPage,
  ComparePage,
  ContactPage,
  FAQPage,
  FinderPage,
  HomePage,
  NotFoundPage,
  OrderSuccessPage,
  OrdersPage,
  PoliciesPage,
  ProductDetailsPage,
  ProductsPage,
  WishlistPage,
} from './lazyPages';
import { PATHS } from './paths';

export const routes = [
  {
    path: PATHS.HOME,
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: PATHS.PRODUCTS, element: <ProductsPage /> },
      { path: PATHS.PRODUCT_DETAILS, element: <ProductDetailsPage /> },
      { path: PATHS.CART, element: <CartPage /> },
      { path: PATHS.CHECKOUT, element: <CheckoutPage /> },
      { path: PATHS.ORDER_SUCCESS, element: <OrderSuccessPage /> },
      { path: PATHS.AUTH, element: <AuthPage /> },
      { path: PATHS.ACCOUNT, element: <AccountPage /> },
      { path: PATHS.ORDERS, element: <OrdersPage /> },
      { path: PATHS.WISHLIST, element: <WishlistPage /> },
      { path: PATHS.FINDER, element: <FinderPage /> },
      { path: PATHS.COMPARE, element: <ComparePage /> },
      { path: PATHS.ABOUT, element: <AboutPage /> },
      { path: PATHS.CONTACT, element: <ContactPage /> },
      { path: PATHS.FAQ, element: <FAQPage /> },
      { path: PATHS.POLICIES, element: <PoliciesPage /> },
      { path: PATHS.NOT_FOUND, element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
