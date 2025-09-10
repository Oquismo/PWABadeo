// src/types/material-web.d.ts
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-chip-set': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'md-filter-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        label?: string;
        elevated?: boolean;
        disabled?: boolean;
        selected?: boolean;
        removable?: boolean;
        onClick?: (event: Event) => void;
        'data-category'?: string;
      }, HTMLElement>;
      'md-assist-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        label?: string;
        elevated?: boolean;
        disabled?: boolean;
        onClick?: (event: Event) => void;
      }, HTMLElement>;
      'md-suggestion-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        label?: string;
        elevated?: boolean;
        disabled?: boolean;
        onClick?: (event: Event) => void;
      }, HTMLElement>;
      'md-input-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        label?: string;
        elevated?: boolean;
        disabled?: boolean;
        removable?: boolean;
        onClick?: (event: Event) => void;
      }, HTMLElement>;
    }
  }
}

export {};
