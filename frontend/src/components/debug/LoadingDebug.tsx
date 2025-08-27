import React from 'react';
import { useAuth } from '@/auth';

export const LoadingDebug: React.FC = () => {
  const { isLoading: loading, profile: user, error } = useAuth();

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <div>🔄 Loading: {loading ? 'TRUE' : 'FALSE'}</div>
      <div>👤 User: {user ? user.userType : 'null'}</div>
      <div>❌ Error: {error ? error.code : 'null'}</div>
    </div>
  );
};