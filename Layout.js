import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-900">
      {children}
    </div>
  );
}