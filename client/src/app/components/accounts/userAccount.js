'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    changePassword,
    fetchProfile,
    removeGalleryImages,
    updateProfile,
    uploadAvatar,
    uploadGalleryImages,
} from './accountApi';

import {
    buildPersonalInfoPayload,
    formatDateForInput,
    getInitials,
} from '/accountUtils';

import { EMPTY_PERSONAL, EMPTY_PREFS, IMAGE_ACCEPT } from './constants';
import AddressSection from './AddressSection';
import '../../assets/css/userAccount.css';