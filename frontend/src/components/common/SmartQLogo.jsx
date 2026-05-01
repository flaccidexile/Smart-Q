import React from 'react';
import logoImage from '../../assets/logo.PNG';

/**
 * SmartQLogo — Uses the provided logo image.
 *
 * Props:
 *   height   — overall height (default 36px)
 *   className - optional classes
 */
export default function SmartQLogo({ height = 36, className = '' }) {
  return (
    <img
      src={logoImage}
      alt="SMARTQ logo"
      style={{ height: `${height}px`, width: 'auto' }}
      className={`object-contain ${className}`}
    />
  );
}
