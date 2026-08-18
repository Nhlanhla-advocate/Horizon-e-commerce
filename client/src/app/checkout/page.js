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