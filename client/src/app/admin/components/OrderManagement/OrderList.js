'use client';

import { useState, useEffect } from 'react';
import '../../../assets/css/admin.css';
import Pagination from '../Pagination';

//Backend base URL

const BASE_URL = 'http://localhost:5000';

const ORDER_STATUSES = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delievered' },
    { value: 'cancelled', label: 'Cancelled' }
];