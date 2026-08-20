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

function CheckoutForm({ paymentIntentId, onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setSubmitting(true);
        setError('');
    }
}