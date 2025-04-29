import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    storeName: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',
    currency: 'USD',
    taxRate: 0,
    shippingOptions: [],
    paymentGateways: [],
    lowStockAlert: 10,
    enableNotifications: true,
  });

  const [newShippingOption, setNewShippingOption] = useState({
    name: '',
    price: 0,
    estimatedDays: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/api/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      await fetch('http://localhost:5000/admin/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  };

  const handleAddShippingOption = () => {
    setSettings(prev => ({
      ...prev,
      shippingOptions: [...prev.shippingOptions, newShippingOption]
    }));
    setNewShippingOption({ name: '', price: 0, estimatedDays: '' });
  };

  return (
    <div className="settings-container">
      <h2>Store Settings</h2>

      <div className="settings-section">
        <h3>General Settings</h3>
        <div className="setting-group">
          <label>Store Name</label>
          <input
            type="text"
            value={settings.storeName}
            onChange={(e) => handleSettingChange('storeName', e.target.value)}
          />
        </div>
        <div className="setting-group">
          <label>Store Email</label>
          <input
            type="email"
            value={settings.storeEmail}
            onChange={(e) => handleSettingChange('storeEmail', e.target.value)}
          />
        </div>
        <div className="setting-group">
          <label>Store Phone</label>
          <input
            type="tel"
            value={settings.storePhone}
            onChange={(e) => handleSettingChange('storePhone', e.target.value)}
          />
        </div>
        <div className="setting-group">
          <label>Store Address</label>
          <textarea
            value={settings.storeAddress}
            onChange={(e) => handleSettingChange('storeAddress', e.target.value)}
          />
        </div>
      </div>

      <div className="settings-section">
        <h3>Business Settings</h3>
        <div className="setting-group">
          <label>Currency</label>
          <select
            value={settings.currency}
            onChange={(e) => handleSettingChange('currency', e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
        <div className="setting-group">
          <label>Tax Rate (%)</label>
          <input
            type="number"
            value={settings.taxRate}
            onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value))}
            min="0"
            max="100"
            step="0.1"
          />
        </div>
        <div className="setting-group">
          <label>Low Stock Alert Threshold</label>
          <input
            type="number"
            value={settings.lowStockAlert}
            onChange={(e) => handleSettingChange('lowStockAlert', parseInt(e.target.value))}
            min="1"
          />
        </div>
      </div>

      <div className="settings-section">
        <h3>Shipping Options</h3>
        <div className="shipping-options-list">
          {settings.shippingOptions.map((option, index) => (
            <div key={index} className="shipping-option">
              <span>{option.name} - ${option.price} ({option.estimatedDays} days)</span>
              <button
                className="delete-btn"
                onClick={() => {
                  const newOptions = settings.shippingOptions.filter((_, i) => i !== index);
                  handleSettingChange('shippingOptions', newOptions);
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <div className="add-shipping-option">
          <input
            type="text"
            placeholder="Shipping Name"
            value={newShippingOption.name}
            onChange={(e) => setNewShippingOption(prev => ({ ...prev, name: e.target.value }))}
          />
          <input
            type="number"
            placeholder="Price"
            value={newShippingOption.price}
            onChange={(e) => setNewShippingOption(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
          />
          <input
            type="text"
            placeholder="Estimated Days"
            value={newShippingOption.estimatedDays}
            onChange={(e) => setNewShippingOption(prev => ({ ...prev, estimatedDays: e.target.value }))}
          />
          <button onClick={handleAddShippingOption}>Add Shipping Option</button>
        </div>
      </div>

      <div className="settings-section">
        <h3>Notifications</h3>
        <div className="setting-group">
          <label>
            <input
              type="checkbox"
              checked={settings.enableNotifications}
              onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
            />
            Enable Email Notifications
          </label>
        </div>
      </div>

      <div className="settings-actions">
        <button className="save-btn" onClick={handleSaveSettings}>
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings; 