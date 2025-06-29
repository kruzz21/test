import React from 'react';
import { useTranslation } from 'react-i18next';
import App from './App';

const AppWrapper: React.FC = () => {
  const { ready } = useTranslation();

  if (!ready) return null; // or return a loader

  return <App />;
};

export default AppWrapper;
