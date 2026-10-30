import { lazy } from 'react';

export const HomePage = lazy(() => import('@pages/Home'));
export const ProductsPage = lazy(() => import('@pages/Products'));
export const ProductDetailsPage = lazy(() => import('@pages/ProductDetails'));
export const CartPage = lazy(() => import('@pages/Cart'));
export const CheckoutPage = lazy(() => import('@pages/Checkout'));
export const OrderSuccessPage = lazy(() => import('@pages/OrderSuccess'));
export const AuthPage = lazy(() => import('@pages/Auth'));
export const AccountPage = lazy(() => import('@pages/Account'));
export const OrdersPage = lazy(() => import('@pages/Orders'));
export const WishlistPage = lazy(() => import('@pages/Wishlist'));
export const FinderPage = lazy(() => import('@pages/Finder'));
export const ComparePage = lazy(() => import('@pages/Compare'));
export const AboutPage = lazy(() => import('@pages/About'));
export const ContactPage = lazy(() => import('@pages/Contact'));
export const FAQPage = lazy(() => import('@pages/FAQ'));
export const PoliciesPage = lazy(() => import('@pages/Policies'));
export const NotFoundPage = lazy(() => import('@pages/NotFound'));
