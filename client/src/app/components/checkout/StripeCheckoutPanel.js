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

        try {
            const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
              elements,
              redirect: 'if_required',
            });
      
            if (stripeError) {
              throw new Error(stripeError.message || 'Payment failed');
            }
      
            const intentId = paymentIntent?.id || paymentIntentId;
            if (!intentId) {
              throw new Error('Payment could not be confirmed');
            }
      
            if (paymentIntent?.status !== 'succeeded') {
              throw new Error(`Payment status: ${paymentIntent?.status || 'unknown'}`);
            }
      
            const result = await completePayment(intentId);
            onSuccess?.(result.order);
          } catch (err) {
            setError(err.message || 'Payment failed. Please try again.');
          } finally {
            setSubmitting(false);
          }
        };
    }
}