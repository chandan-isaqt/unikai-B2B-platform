import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { getErrorMessage } from '../api/axiosClient';

const AppConfigContext = createContext(null);

export const AppConfigProvider = ({ children }) => {
  const [salesman, setSalesman] = useState({
    name: 'Sachin',
    title: 'Senior B2B Key Account Executive - Oman & GCC',
    phone: '+96891234567',
    whatsappNumber: '+96891234567',
    email: 'sachin.sales@unikai.local',
    region: 'Muscat, Sultanate of Oman',
    workingHours: 'Sun - Thu: 7:30 AM - 6:30 PM',
    photoUrl: '/image/Sachin.jpeg',
    isActive: true,
  });

  const [settings, setSettings] = useState({
    companyName: 'Unikai Foods PJSC - B2B Wholesale Portal',
    currency: 'OMR',
    currencyDecimals: 3,
    supportEmail: 'b2b.oman@unikai.com',
    supportPhone: '+968 2450 1234',
    headOfficeAddress: 'Ghala Industrial Estate, Muscat, Sultanate of Oman',
  });

  const [health, setHealth] = useState({
    loading: true,
    server: 'running',
    database: 'connected',
    errorBanner: null,
  });

  const fetchConfigAndHealth = useCallback(async () => {
    try {
      const healthRes = await api.get('/health');
      const isDbConnected = healthRes.data?.database === 'connected';

      setHealth({
        loading: false,
        server: 'running',
        database: isDbConnected ? 'connected' : 'disconnected',
        errorBanner: isDbConnected
          ? null
          : 'Database connection unavailable. Please start MongoDB and try again.',
      });

      if (isDbConnected) {
        const [salesmanRes, settingsRes] = await Promise.all([
          api.get('/salesman'),
          api.get('/settings'),
        ]);
        if (salesmanRes.data?.salesman) {
          setSalesman({
            ...salesmanRes.data.salesman,
            photoUrl: salesmanRes.data.salesman.photoUrl || '/image/Sachin.jpeg',
          });
        }
        if (settingsRes.data?.settings) {
          setSettings(settingsRes.data.settings);
        }
      }
    } catch (error) {
      const msg = getErrorMessage(error);
      const isDbErr = msg.includes('Database connection unavailable');
      setHealth({
        loading: false,
        server: isDbErr ? 'running' : 'offline',
        database: 'disconnected',
        errorBanner: msg,
      });
    }
  }, []);

  useEffect(() => {
    fetchConfigAndHealth();
  }, [fetchConfigAndHealth]);

  return (
    <AppConfigContext.Provider
      value={{
        salesman,
        setSalesman,
        settings,
        setSettings,
        health,
        refreshConfig: fetchConfigAndHealth,
      }}
    >
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => useContext(AppConfigContext);
