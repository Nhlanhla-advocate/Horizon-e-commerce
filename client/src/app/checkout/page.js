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

    const stripePromise = useMemo(() => {
        if (!config?.publishableKey) return null;
        return loadStripe(config.publishableKey);
      }, [config?.publishableKey]);
    
      useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
          router.replace('/auth/signin?redirect=/checkout');
          return;
        }
        setAuthReady(true);
      }, [router]);

      useEffect(() => {
        if (!authReady || cartLoading) return;
    
        if (cartItems.length === 0) {
          setLoading(false);
          return;
        }
    
        let cancelled = false;
    
        (async () => {
          setLoading(true);
          setError('');
          try {
            const stripeConfig = await fetchStripeConfig();
            if (!stripeConfig.enabled || !stripeConfig.publishableKey) {
              throw new Error('Stripe is not configured on the server. Add STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY.');
            }
            if (cancelled) return;
            setConfig(stripeConfig);
    
            const intent = await createPaymentIntent();
            if (cancelled) return;
            setClientSecret(intent.clientSecret);
            setPaymentIntentId(intent.paymentIntentId);
            setAmount(intent.amount);
          } catch (err) {
            if (!cancelled) {
              setError(err.message || 'Unable to start checkout');
            }
          } finally {
            if (!cancelled) setLoading(false);
          }
        })();