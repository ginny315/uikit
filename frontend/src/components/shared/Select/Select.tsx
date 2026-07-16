import { useState, useRef, useEffect, useCallback } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import classes from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({ options, value, onChange, placeholder, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, handleClickOutside]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((prev) => !prev);
      return;
    }
    if (e.key === 'ArrowDown' && open) {
      e.preventDefault();
      const currentIdx = options.findIndex((o) => o.value === value);
      const nextIdx = Math.min(currentIdx + 1, options.length - 1);
      onChange(options[nextIdx].value);
    }
    if (e.key === 'ArrowUp' && open) {
      e.preventDefault();
      const currentIdx = options.findIndex((o) => o.value === value);
      const prevIdx = Math.max(currentIdx - 1, 0);
      onChange(options[prevIdx].value);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${classes.wrapper} ${className ?? ''}`}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className={`${classes.trigger} ${open ? classes.triggerOpen : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selectedOption ? classes.selectedText : classes.placeholder}>
          {selectedOption?.label ?? placeholder ?? ''}
        </span>
        <IconChevronDown
          size={12}
          strokeWidth={2.2}
          className={`${classes.chevron} ${open ? classes.chevronOpen : ''}`}
        />
      </button>

      {open && (
        <ul className={classes.dropdown} role="listbox" aria-activedescendant={value}>
          {options.map((opt) => (
            <li
              key={opt.value}
              id={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`${classes.option} ${opt.value === value ? classes.optionActive : ''}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
              {opt.value === value && <span className={classes.check} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
