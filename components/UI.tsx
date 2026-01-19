
import React from 'react';
import { Color, Tool, COLOR_MAP } from '../types';

export const ColorButton: React.FC<{
  color: Color;
  selected: boolean;
  onClick: () => void;
}> = ({ color, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`
      w-14 h-14 rounded-full border-4 transition-all duration-200 transform
      ${selected 
        ? 'border-slate-900 scale-125 shadow-xl ring-4 ring-slate-200 z-10' 
        : 'border-white scale-100 shadow-sm hover:scale-105'}
    `}
    style={{ backgroundColor: COLOR_MAP[color] }}
    aria-label={`Select ${color}`}
  />
);

export const ToolButton: React.FC<{
  tool: Tool;
  selected: boolean;
  onClick: () => void;
}> = ({ tool, selected, onClick }) => {
  const getIcon = () => {
    switch (tool) {
      case Tool.Stamp: return '🔳';
      case Tool.RollerH: return '↔️';
      case Tool.RollerV: return '↕️';
      case Tool.Spray: return '💨';
      default: return '?';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center w-16 h-16 rounded-2xl border-2 transition-all duration-200 text-3xl
        ${selected 
          ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-110 z-10' 
          : 'bg-white border-slate-200 text-slate-800 shadow-sm hover:bg-slate-50'}
      `}
      aria-label={`Select ${tool} tool`}
    >
      {getIcon()}
    </button>
  );
};

export const GameButton: React.FC<{
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}> = ({ label, onClick, variant = 'primary', fullWidth = false }) => {
  const baseClasses = "px-6 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-lg flex items-center justify-center text-lg";
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50",
    danger: "bg-red-500 text-white hover:bg-red-600"
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseClasses} ${variants[variant]} ${fullWidth ? 'w-full' : ''}`}
    >
      {label}
    </button>
  );
};
