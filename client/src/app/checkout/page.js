'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { useCart } from '@/app/components/cart/Cart';
import { useLocale } from '@/app/i18n/LocaleProvider';
import { createPaymentIntent, fetchStripeConfig } from '@/app/components/checkout/paymentApi';
import StripeCheckoutPanel from '@/app/components/checkout/StripeCheckoutPanel';
import '@/app/assets/css/checkout.css';
import '@/app/assets/css/cart.css';

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, isLoading: cartLoading, clearCartLocal } = useCart();
    const { formatPrice } = useLocale();
  
    const [authReady, setAuthReady] = useState(false);
    const [config, setConfig] = useState(null);
    const [clientSecret, setClientSecret] = useState('');
    const [paymentIntentId, setPaymentIntentId] = useState('');
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
  
    const cartItems = Array.isArray(cart?.items) ? cart.items : [];
    const cartTotal = Number(cart?.totalPrice ?? 0);