'use client';

import { useState } from 'react';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { useLocale } from '@/app/i18n/LocaleProvider';
import { completePayment } from './paymentApi';
import '../../assets/css/checkout.css';