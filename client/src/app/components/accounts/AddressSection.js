'use client';

import { useState } from 'react';
import { COUNTRIES, EMPTY_ADDRESS } from './constants';
import { addAddress, deleteAddress, updateAddress } from './accountApi';

const labelOptions = [
  { value: 'home', label: 'Home' },
  { value: 'work', label: 'Work' },
  { value: 'other', label: 'Other' },
];

export default function AddressSection({ addresses = [], onUpdated, onError, onSuccess }) {
  const [form, setForm] = useState(EMPTY_ADDRESS);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const resetForm = () => {
    setForm(EMPTY_ADDRESS);
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const startEdit = (address) => {
    setEditingId(address._id);
    setForm({
      label: address.label || 'home',
      fullName: address.fullName || '',
      phone: address.phone || '',
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || '',
      isDefault: Boolean(address.isDefault),
    });
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    onError('');
    setSaving(true);

    try {
      const user = editingId
        ? await updateAddress(editingId, form)
        : await addAddress(form);
      onUpdated(user);
      onSuccess(editingId ? 'Address updated.' : 'Address added.');
      resetForm();
    } catch (err) {
      onError(err.message || 'Failed to save address.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Remove this address?')) return;
    onError('');
    setSaving(true);

    try {
      const user = await deleteAddress(addressId);
      onUpdated(user);
      onSuccess('Address removed.');
      if (editingId === addressId) resetForm();
    } catch (err) {
      onError(err.message || 'Failed to remove address.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="user-account-card">
      <h2>Saved addresses</h2>

      {addresses.length === 0 && !showForm && (
        <p className="user-account-gallery-empty">No saved addresses yet.</p>
      )}

      {addresses.length > 0 && (
        <ul className="user-account-address-list">
          {addresses.map((address) => (
            <li key={address._id} className="user-account-address-item">
              <div>
                <strong>
                  {labelOptions.find((o) => o.value === address.label)?.label || 'Address'}
                  {address.isDefault ? ' (Default)' : ''}
                </strong>
                <p>
                  {address.street}, {address.city}
                  {address.state ? `, ${address.state}` : ''}
                </p>
                <p>
                  {address.country}
                  {address.postalCode ? ` ${address.postalCode}` : ''}
                </p>
                {address.fullName && (
                  <p>
                    {address.fullName}
                    {address.phone ? ` · ${address.phone}` : ''}
                  </p>
                )}
              </div>
              <div className="user-account-address-actions">
                <button
                  type="button"
                  className="user-account-btn user-account-btn--secondary"
                  disabled={saving}
                  onClick={() => startEdit(address)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="user-account-btn user-account-btn--danger"
                  disabled={saving}
                  onClick={() => handleDelete(address._id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <form className="user-account-address-form" onSubmit={handleSubmit}>
          <div className="user-account-grid">
            <div className="user-account-field">
              <label htmlFor="addressLabel">Label</label>
              <select
                id="addressLabel"
                value={form.label}
                onChange={(e) => handleChange('label', e.target.value)}
              >
                {labelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="user-account-field">
              <label htmlFor="addressFullName">Full name</label>
              <input
                id="addressFullName"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
              />
            </div>
            <div className="user-account-field">
              <label htmlFor="addressPhone">Phone</label>
              <input
                id="addressPhone"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            <div className="user-account-field">
              <label htmlFor="addressStreet">Street *</label>
              <input
                id="addressStreet"
                value={form.street}
                onChange={(e) => handleChange('street', e.target.value)}
                required
              />
            </div>
            <div className="user-account-field">
              <label htmlFor="addressCity">City *</label>
              <input
                id="addressCity"
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                required
              />
            </div>
            <div className="user-account-field">
              <label htmlFor="addressState">State / Province</label>
              <input
                id="addressState"
                value={form.state}
                onChange={(e) => handleChange('state', e.target.value)}
              />
            </div>
            <div className="user-account-field">
              <label htmlFor="addressPostal">Postal code</label>
              <input
                id="addressPostal"
                value={form.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
              />
            </div>
            <div className="user-account-field">
              <label htmlFor="addressCountry">Country *</label>
              <select
                id="addressCountry"
                value={form.country}
                onChange={(e) => handleChange('country', e.target.value)}
                required
              >
                <option value="" disabled>
                  Select a country
                </option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="user-account-pref-row user-account-default-row">
            <span>Set as default address</span>
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => handleChange('isDefault', e.target.checked)}
            />
          </label>
          <div className="user-account-actions">
            <button type="submit" className="user-account-btn user-account-btn--primary" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update address' : 'Save address'}
            </button>
            <button
              type="button"
              className="user-account-btn user-account-btn--secondary"
              disabled={saving}
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="user-account-actions">
          <button
            type="button"
            className="user-account-btn user-account-btn--secondary"
            onClick={() => setShowForm(true)}
          >
            Add address
          </button>
        </div>
      )}
    </section>
  );
}
