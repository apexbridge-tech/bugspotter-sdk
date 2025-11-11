type ButtonPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export interface FloatingButtonOptions {
  position?: ButtonPosition;
  /** Icon to display - can be text/emoji or 'svg' for default bug icon */
  icon?: string;
  /** Custom SVG icon (overrides icon if provided) */
  customSvg?: string;
  backgroundColor?: string;
  size?: number;
  offset?: { x: number; y: number };
  zIndex?: number;
  /** Custom tooltip text */
  tooltip?: string;
}

// Professional bug report icon SVG
const DEFAULT_SVG_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M8 2v4"/>
<path d="M16 2v4"/>
<path d="M12 12v5"/>
<circle cx="12" cy="10" r="4"/>
<path d="M9 16c-1.5 1-3 2-3 4h12c0-2-1.5-3-3-4"/>
<path d="M3 8h4"/>
<path d="M17 8h4"/>
<path d="M5 12h2"/>
<path d="M17 12h2"/>
<path d="M6 16h2"/>
<path d="M16 16h2"/>
</svg>`;

const DEFAULT_BUTTON_OPTIONS = {
  position: 'bottom-right' as const,
  icon: 'svg', // Use SVG icon by default
  customSvg: undefined,
  backgroundColor: '#2563eb', // Professional blue color
  size: 56,
  offset: { x: 20, y: 20 },
  zIndex: 999999,
  tooltip: 'Report an Issue',
} as const;

const BUTTON_STYLES = {
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  boxShadow: {
    default: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    hover: '0 10px 15px rgba(0, 0, 0, 0.2), 0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  transform: {
    default: 'scale(1)',
    hover: 'scale(1.1)',
    active: 'scale(0.95)',
  },
} as const;

export class FloatingButton {
  private button: HTMLButtonElement;
  private options: Required<Omit<FloatingButtonOptions, 'customSvg'>> & {
    customSvg?: string;
  };
  private eventHandlers = new Map<string, EventListener>();

  constructor(options: FloatingButtonOptions = {}) {
    this.options = {
      position: options.position ?? DEFAULT_BUTTON_OPTIONS.position,
      icon: options.icon ?? DEFAULT_BUTTON_OPTIONS.icon,
      customSvg: options.customSvg ?? DEFAULT_BUTTON_OPTIONS.customSvg,
      backgroundColor: options.backgroundColor ?? DEFAULT_BUTTON_OPTIONS.backgroundColor,
      size: options.size ?? DEFAULT_BUTTON_OPTIONS.size,
      offset: options.offset ?? DEFAULT_BUTTON_OPTIONS.offset,
      zIndex: options.zIndex ?? DEFAULT_BUTTON_OPTIONS.zIndex,
      tooltip: options.tooltip ?? DEFAULT_BUTTON_OPTIONS.tooltip,
    };

    this.button = this.createButton();

    // Ensure DOM is ready before appending
    if (document.body) {
      document.body.appendChild(this.button);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(this.button);
      });
    }
  }

  private createButton(): HTMLButtonElement {
    const btn = document.createElement('button');

    // Set button content (SVG or text)
    if (this.options.customSvg) {
      btn.innerHTML = this.options.customSvg;
    } else if (this.options.icon === 'svg') {
      btn.innerHTML = DEFAULT_SVG_ICON;
    } else {
      btn.textContent = this.options.icon;
    }

    btn.setAttribute('aria-label', this.options.tooltip);
    btn.setAttribute('title', this.options.tooltip);
    btn.setAttribute('data-bugspotter-exclude', 'true');
    btn.style.cssText = this.getButtonStyles();

    this.addHoverEffects(btn);

    return btn;
  }

  private getButtonStyles(): string {
    const { position, size, offset, backgroundColor, zIndex } = this.options;
    const positionStyles = this.getPositionStyles(position, offset);

    // SVG icons need slightly different sizing
    const isSvgIcon = this.options.customSvg || this.options.icon === 'svg';
    const iconSize = size * 0.5;

    return `
      position: fixed;
      ${positionStyles}
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${backgroundColor};
      color: white;
      border: none;
      cursor: pointer;
      font-size: ${iconSize}px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: ${isSvgIcon ? size * 0.25 : 0}px;
      box-shadow: ${BUTTON_STYLES.boxShadow.default};
      transition: ${BUTTON_STYLES.transition};
      z-index: ${zIndex};
    `;
  }

  private getPositionStyles(position: ButtonPosition, offset: { x: number; y: number }): string {
    switch (position) {
      case 'bottom-right':
        return `bottom: ${offset.y}px; right: ${offset.x}px;`;
      case 'bottom-left':
        return `bottom: ${offset.y}px; left: ${offset.x}px;`;
      case 'top-right':
        return `top: ${offset.y}px; right: ${offset.x}px;`;
      case 'top-left':
        return `top: ${offset.y}px; left: ${offset.x}px;`;
      default:
        return `bottom: ${offset.y}px; right: ${offset.x}px;`;
    }
  }

  private handleMouseEnter = (): void => {
    this.button.style.transform = BUTTON_STYLES.transform.hover;
    this.button.style.boxShadow = BUTTON_STYLES.boxShadow.hover;
  };

  private handleMouseLeave = (): void => {
    this.button.style.transform = BUTTON_STYLES.transform.default;
    this.button.style.boxShadow = BUTTON_STYLES.boxShadow.default;
  };

  private handleMouseDown = (): void => {
    this.button.style.transform = BUTTON_STYLES.transform.active;
  };

  private handleMouseUp = (): void => {
    this.button.style.transform = BUTTON_STYLES.transform.hover;
  };

  private addHoverEffects(btn: HTMLButtonElement): void {
    const handlers: Record<string, EventListener> = {
      mouseenter: this.handleMouseEnter,
      mouseleave: this.handleMouseLeave,
      mousedown: this.handleMouseDown,
      mouseup: this.handleMouseUp,
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      btn.addEventListener(event, handler);
      this.eventHandlers.set(event, handler);
    });
  }

  onClick(handler: () => void): void {
    this.button.addEventListener('click', handler);
  }

  show(): void {
    this.button.style.display = 'flex';
  }

  hide(): void {
    this.button.style.display = 'none';
  }

  setIcon(icon: string): void {
    this.options.icon = icon;
    if (icon === 'svg') {
      this.button.innerHTML = DEFAULT_SVG_ICON;
    } else {
      this.button.textContent = icon;
    }
  }

  setBackgroundColor(color: string): void {
    this.button.style.backgroundColor = color;
  }

  destroy(): void {
    // Remove all event listeners
    this.eventHandlers.forEach((handler, event) => {
      this.button.removeEventListener(event, handler);
    });
    this.eventHandlers.clear();

    // Remove button from DOM
    this.button.remove();
  }
}
