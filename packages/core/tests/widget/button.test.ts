import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FloatingButton } from '../../src/widget/button';

describe('FloatingButton', () => {
  let floatingButton: FloatingButton;

  afterEach(() => {
    floatingButton?.destroy();
  });

  describe('Initialization', () => {
    it('should create button with default options', () => {
      floatingButton = new FloatingButton();

      const buttons = document.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);

      const button = Array.from(buttons).find((btn) => {
        return btn.innerHTML.includes('<svg') || btn.textContent === '🐛';
      });
      expect(button).toBeDefined();
      expect(button?.getAttribute('aria-label')).toBe('Report an Issue');
      expect(button?.getAttribute('data-bugspotter-exclude')).toBe('true');
    });

    it('should create button with custom icon', () => {
      floatingButton = new FloatingButton({ icon: '🚨' });

      const button = Array.from(document.querySelectorAll('button')).find(
        (btn) => {
          return btn.textContent === '🚨';
        }
      );
      expect(button).toBeDefined();
    });

    it('should create button with custom size', () => {
      floatingButton = new FloatingButton({ size: 80 });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1];

      expect(button.style.width).toBe('80px');
      expect(button.style.height).toBe('80px');
    });

    it('should create button with custom background color', () => {
      floatingButton = new FloatingButton({ backgroundColor: '#3b82f6' });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1];

      expect(button.style.backgroundColor).toContain('rgb(59, 130, 246)');
    });

    it('should position button bottom-right by default', () => {
      floatingButton = new FloatingButton();

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1];

      expect(button.style.bottom).toBe('20px');
      expect(button.style.right).toBe('20px');
    });

    it('should position button top-left when specified', () => {
      floatingButton = new FloatingButton({ position: 'top-left' });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1];

      expect(button.style.top).toBe('20px');
      expect(button.style.left).toBe('20px');
    });

    it('should apply custom offset', () => {
      floatingButton = new FloatingButton({
        position: 'bottom-right',
        offset: { x: 50, y: 100 },
      });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1];

      expect(button.style.bottom).toBe('100px');
      expect(button.style.right).toBe('50px');
    });

    it('should apply custom z-index', () => {
      floatingButton = new FloatingButton({ zIndex: 123456 });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1];

      expect(button.style.zIndex).toBe('123456');
    });
  });

  describe('Event Handling', () => {
    it('should call onClick handler when button is clicked', () => {
      const handler = vi.fn();
      floatingButton = new FloatingButton();
      floatingButton.onClick(handler);

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      button.click();

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should support multiple click handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      floatingButton = new FloatingButton();
      floatingButton.onClick(handler1);
      floatingButton.onClick(handler2);

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      button.click();

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      floatingButton = new FloatingButton();
    });

    it('should show button', () => {
      floatingButton.hide();
      floatingButton.show();

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;

      expect(button.style.display).toBe('flex');
    });

    it('should hide button', () => {
      floatingButton.hide();

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;

      expect(button.style.display).toBe('none');
    });

    it('should change icon', () => {
      floatingButton.setIcon('📝');

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;

      expect(button.textContent).toBe('📝');
    });

    it('should change background color', () => {
      floatingButton.setBackgroundColor('#10b981');

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;

      expect(button.style.backgroundColor).toContain('rgb(16, 185, 129)');
    });

    it('should remove button on destroy', () => {
      const initialButtonCount = document.querySelectorAll('button').length;

      floatingButton.destroy();

      const finalButtonCount = document.querySelectorAll('button').length;
      expect(finalButtonCount).toBe(initialButtonCount - 1);
    });
  });

  describe('Hover Effects', () => {
    beforeEach(() => {
      floatingButton = new FloatingButton();
    });

    it('should apply hover effects on mouseenter', () => {
      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;

      button.dispatchEvent(new MouseEvent('mouseenter'));

      expect(button.style.transform).toBe('scale(1.1)');
    });

    it('should remove hover effects on mouseleave', () => {
      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;

      button.dispatchEvent(new MouseEvent('mouseenter'));
      button.dispatchEvent(new MouseEvent('mouseleave'));

      expect(button.style.transform).toBe('scale(1)');
    });

    it('should scale down on mousedown', () => {
      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;

      button.dispatchEvent(new MouseEvent('mousedown'));

      expect(button.style.transform).toBe('scale(0.95)');
    });

    it('should scale back up on mouseup', () => {
      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;

      button.dispatchEvent(new MouseEvent('mouseenter'));
      button.dispatchEvent(new MouseEvent('mousedown'));
      button.dispatchEvent(new MouseEvent('mouseup'));

      expect(button.style.transform).toBe('scale(1.1)');
    });
  });

  describe('SVG Sanitization - Security', () => {
    it('should block malicious onload event handler', () => {
      const maliciousSVG =
        '<svg onload="alert(\'XSS\')"><circle cx="10" cy="10" r="5"/></svg>';
      floatingButton = new FloatingButton({ customSvg: maliciousSVG });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const svg = button.querySelector('svg');

      expect(svg).toBeDefined();
      expect(svg?.hasAttribute('onload')).toBe(false);
    });

    it('should block malicious onclick event handler', () => {
      const maliciousSVG =
        '<svg onclick="alert(\'XSS\')"><circle cx="10" cy="10" r="5"/></svg>';
      floatingButton = new FloatingButton({ customSvg: maliciousSVG });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const svg = button.querySelector('svg');

      expect(svg).toBeDefined();
      expect(svg?.hasAttribute('onclick')).toBe(false);
    });

    it('should block onerror event handlers on child elements', () => {
      const maliciousSVG =
        '<svg><circle onerror="alert(\'XSS\')" cx="10" cy="10" r="5"/></svg>';
      floatingButton = new FloatingButton({ customSvg: maliciousSVG });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const circle = button.querySelector('circle');

      expect(circle).toBeDefined();
      expect(circle?.hasAttribute('onerror')).toBe(false);
    });

    it('should remove script tags from SVG', () => {
      const maliciousSVG =
        '<svg><script>alert(\'XSS\')</script><circle cx="10" cy="10" r="5"/></svg>';
      floatingButton = new FloatingButton({ customSvg: maliciousSVG });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const script = button.querySelector('script');

      expect(script).toBeNull();
    });

    it('should remove foreignObject tags', () => {
      const maliciousSVG =
        '<svg><foreignObject><body xmlns="http://www.w3.org/1999/xhtml"><script>alert(\'XSS\')</script></body></foreignObject></svg>';
      floatingButton = new FloatingButton({ customSvg: maliciousSVG });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const foreignObject = button.querySelector('foreignObject');

      expect(foreignObject).toBeNull();
    });

    it('should reject multiple root elements', () => {
      const maliciousSVG = "<svg></svg><script>alert('XSS')</script>";
      floatingButton = new FloatingButton({ customSvg: maliciousSVG });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;

      // Should fall back to textContent
      expect(button.querySelector('svg')).toBeNull();
      expect(button.textContent).toContain('<svg>');
    });

    it('should block javascript: URLs in href attributes', () => {
      const maliciousSVG =
        '<svg><a href="javascript:alert(\'XSS\')"><circle cx="10" cy="10" r="5"/></a></svg>';
      floatingButton = new FloatingButton({ customSvg: maliciousSVG });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const anchor = button.querySelector('a');

      // Anchor tag should be removed as it's not in the whitelist
      expect(anchor).toBeNull();
    });

    it('should block data:text/html URIs', () => {
      const maliciousSVG =
        '<svg><a href="data:text/html,<script>alert(\'XSS\')</script>"><circle cx="10" cy="10" r="5"/></a></svg>';
      floatingButton = new FloatingButton({ customSvg: maliciousSVG });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;

      // <a> tag should be removed as it's not in the whitelist
      const anchor = button.querySelector('a');
      expect(anchor).toBeNull();
    });

    it('should block vbscript: URLs', () => {
      const maliciousSVG =
        '<svg><rect fill="url(vbscript:msgbox(\'XSS\'))"/></svg>';
      floatingButton = new FloatingButton({ customSvg: maliciousSVG });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const rect = button.querySelector('rect');

      expect(rect).toBeDefined();
      expect(rect?.hasAttribute('fill')).toBe(false);
    });

    it('should block data:application/javascript URIs', () => {
      const maliciousSVG =
        '<svg><rect fill="data:application/javascript,alert(\'XSS\')"/></svg>';
      floatingButton = new FloatingButton({ customSvg: maliciousSVG });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const rect = button.querySelector('rect');

      expect(rect).toBeDefined();
      // fill attribute should be removed due to data: URI
      expect(rect?.hasAttribute('fill')).toBe(false);
    });

    it('should block data:image/svg+xml URIs (can contain scripts)', () => {
      const maliciousSVG =
        '<svg><text fill="data:image/svg+xml,payload">Safe Text</text></svg>';
      floatingButton = new FloatingButton({ customSvg: maliciousSVG });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const text = button.querySelector('text');

      expect(text).toBeDefined();
      expect(text?.textContent).toBe('Safe Text');
      // fill attribute should be removed due to data: URI
      expect(text?.hasAttribute('fill')).toBe(false);
    });

    it('should block CSS expression() attacks', () => {
      const maliciousSVG =
        '<svg><rect fill="expression(alert(\'XSS\'))"/></svg>';
      floatingButton = new FloatingButton({ customSvg: maliciousSVG });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const rect = button.querySelector('rect');

      expect(rect).toBeDefined();
      expect(rect?.hasAttribute('fill')).toBe(false);
    });

    it('should block CSS url() attacks', () => {
      const maliciousSVG =
        '<svg><rect fill="url(javascript:alert(\'XSS\'))"/></svg>';
      floatingButton = new FloatingButton({ customSvg: maliciousSVG });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const rect = button.querySelector('rect');

      expect(rect).toBeDefined();
      expect(rect?.hasAttribute('fill')).toBe(false);
    });

    it('should block @import in attributes', () => {
      const maliciousSVG =
        '<svg><text class="@import url(evil.css)">Text</text></svg>';
      floatingButton = new FloatingButton({ customSvg: maliciousSVG });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const text = button.querySelector('text');

      expect(text).toBeDefined();
      expect(text?.hasAttribute('class')).toBe(false);
    });

    it('should block -moz-binding XBL attacks', () => {
      const maliciousSVG =
        '<svg><rect class="-moz-binding: url(xss.xml#xss)"/></svg>';
      floatingButton = new FloatingButton({ customSvg: maliciousSVG });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const rect = button.querySelector('rect');

      expect(rect).toBeDefined();
      expect(rect?.hasAttribute('class')).toBe(false);
    });

    it('should reject wrapper elements around SVG', () => {
      const maliciousSVG =
        '<div><svg><circle cx="10" cy="10" r="5"/></svg></div>';
      floatingButton = new FloatingButton({ customSvg: maliciousSVG });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;

      // Should fall back to textContent since root is not <svg>
      expect(button.querySelector('svg')).toBeNull();
      expect(button.textContent).toContain('<div>');
    });

    it('should accept valid SVG with safe attributes', () => {
      const validSVG =
        '<svg viewBox="0 0 100 100" fill="blue"><circle cx="50" cy="50" r="40" stroke="red" stroke-width="2"/></svg>';
      floatingButton = new FloatingButton({ customSvg: validSVG });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const svg = button.querySelector('svg');

      expect(svg).toBeDefined();
      expect(svg?.getAttribute('viewBox')).toBe('0 0 100 100');
      expect(svg?.getAttribute('fill')).toBe('blue');

      const circle = svg?.querySelector('circle');
      expect(circle?.getAttribute('cx')).toBe('50');
      expect(circle?.getAttribute('stroke')).toBe('red');
    });

    it('should preserve safe transform attributes', () => {
      const validSVG =
        '<svg><g transform="translate(10,10) scale(2)"><circle cx="5" cy="5" r="3"/></g></svg>';
      floatingButton = new FloatingButton({ customSvg: validSVG });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const g = button.querySelector('g');

      expect(g).toBeDefined();
      expect(g?.getAttribute('transform')).toBe('translate(10,10) scale(2)');
    });

    it('should handle malformed SVG gracefully', () => {
      const malformedSVG = '<svg><circle cx="broken';
      floatingButton = new FloatingButton({ customSvg: malformedSVG });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;

      // Should fall back to textContent on parse error
      expect(button.textContent).toBeTruthy();
    });

    it('should strip non-whitelisted attributes', () => {
      const svgWithExtraAttrs =
        '<svg data-malicious="value" custom-attr="test"><circle cx="10" cy="10" r="5"/></svg>';
      floatingButton = new FloatingButton({ customSvg: svgWithExtraAttrs });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const svg = button.querySelector('svg');

      expect(svg).toBeDefined();
      expect(svg?.hasAttribute('data-malicious')).toBe(false);
      expect(svg?.hasAttribute('custom-attr')).toBe(false);
    });

    it('should accept SVG with leading whitespace', () => {
      const svgWithWhitespace =
        '   \n\t<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
      floatingButton = new FloatingButton({ customSvg: svgWithWhitespace });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const svg = button.querySelector('svg');

      expect(svg).toBeDefined();
      expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
      expect(svg?.querySelector('circle')).toBeDefined();
    });

    it('should accept SVG with trailing whitespace', () => {
      const svgWithWhitespace =
        '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>\n\t   ';
      floatingButton = new FloatingButton({ customSvg: svgWithWhitespace });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const svg = button.querySelector('svg');

      expect(svg).toBeDefined();
      expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
    });

    it('should accept SVG with XML comments', () => {
      const svgWithComments =
        '<!-- Generator: Adobe Illustrator -->\n<svg viewBox="0 0 24 24"><!-- Icon path --><path d="M12 2L2 7v10l10 5 10-5V7z"/></svg>';
      floatingButton = new FloatingButton({ customSvg: svgWithComments });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const svg = button.querySelector('svg');

      expect(svg).toBeDefined();
      expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
      expect(svg?.querySelector('path')).toBeDefined();
    });

    it('should preserve viewBox attribute (lowercase normalization test)', () => {
      const svgWithViewBox =
        '<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80"/></svg>';
      floatingButton = new FloatingButton({ customSvg: svgWithViewBox });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const svg = button.querySelector('svg');

      expect(svg).toBeDefined();
      // viewBox should be preserved despite lowercase normalization in sanitizer
      expect(svg?.hasAttribute('viewBox')).toBe(true);
      expect(svg?.getAttribute('viewBox')).toBe('0 0 100 100');
    });

    it('should preserve linearGradient elements', () => {
      const svgWithGradient =
        '<svg><defs><linearGradient id="grad1"><stop offset="0%" stop-color="red"/><stop offset="100%" stop-color="blue"/></linearGradient></defs><rect fill="url(#grad1)" width="100" height="100"/></svg>';
      floatingButton = new FloatingButton({ customSvg: svgWithGradient });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const gradient = button.querySelector('linearGradient');

      expect(gradient).toBeDefined();
      expect(gradient?.getAttribute('id')).toBe('grad1');
      expect(gradient?.querySelectorAll('stop').length).toBe(2);

      // CRITICAL: Verify that fill="url(#grad1)" is preserved on the rect
      const rect = button.querySelector('rect');
      expect(rect).toBeDefined();
      expect(rect?.getAttribute('fill')).toBe('url(#grad1)');
    });

    it('should preserve radialGradient elements', () => {
      const svgWithGradient =
        '<svg><defs><radialGradient id="grad2"><stop offset="0%" stop-color="yellow"/><stop offset="100%" stop-color="green"/></radialGradient></defs><circle fill="url(#grad2)" cx="50" cy="50" r="40"/></svg>';
      floatingButton = new FloatingButton({ customSvg: svgWithGradient });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const gradient = button.querySelector('radialGradient');

      expect(gradient).toBeDefined();
      expect(gradient?.getAttribute('id')).toBe('grad2');
      expect(gradient?.querySelectorAll('stop').length).toBe(2);

      // CRITICAL: Verify that fill="url(#grad2)" is preserved on the circle
      const circle = button.querySelector('circle');
      expect(circle).toBeDefined();
      expect(circle?.getAttribute('fill')).toBe('url(#grad2)');
    });

    it('should preserve clipPath elements', () => {
      const svgWithClipPath =
        '<svg><defs><clipPath id="clip1"><circle cx="50" cy="50" r="40"/></clipPath></defs><rect clip-path="url(#clip1)" width="100" height="100" fill="red"/></svg>';
      floatingButton = new FloatingButton({ customSvg: svgWithClipPath });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const clipPath = button.querySelector('clipPath');

      expect(clipPath).toBeDefined();
      expect(clipPath?.getAttribute('id')).toBe('clip1');
      expect(clipPath?.querySelector('circle')).toBeDefined();

      // CRITICAL: Verify that clip-path="url(#clip1)" is preserved on the rect
      const rect = button.querySelector('rect');
      expect(rect).toBeDefined();
      expect(rect?.getAttribute('clip-path')).toBe('url(#clip1)');
    });

    it('should remove style attribute from elements', () => {
      const svgWithStyle =
        '<svg style="background: red;"><circle style="fill: blue;" cx="10" cy="10" r="5"/></svg>';
      floatingButton = new FloatingButton({ customSvg: svgWithStyle });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const svg = button.querySelector('svg');
      const circle = button.querySelector('circle');

      expect(svg).toBeDefined();
      expect(svg?.hasAttribute('style')).toBe(false);
      expect(circle).toBeDefined();
      expect(circle?.hasAttribute('style')).toBe(false);
    });

    it('should remove use elements (requires href)', () => {
      const svgWithUse =
        '<svg><defs><g id="shape"><circle cx="5" cy="5" r="5"/></g></defs><use href="#shape"/></svg>';
      floatingButton = new FloatingButton({ customSvg: svgWithUse });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const use = button.querySelector('use');

      // use element should be removed as it's not in the whitelist
      expect(use).toBeNull();
    });

    it('should remove image elements (requires href)', () => {
      const svgWithImage =
        '<svg><image href="icon.png" x="0" y="0" width="100" height="100"/></svg>';
      floatingButton = new FloatingButton({ customSvg: svgWithImage });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const image = button.querySelector('image');

      // image element should be removed as it's not in the whitelist
      expect(image).toBeNull();
    });

    it('should block all event handlers (comprehensive on* test)', () => {
      const eventHandlers = [
        'onload',
        'onclick',
        'onerror',
        'onmouseover',
        'onmouseout',
        'onanimationstart',
        'onanimationend',
        'ontransitionend',
        'onfocus',
        'onblur',
        'onchange',
        'oninput',
      ];

      const attributes = eventHandlers
        .map((handler) => `${handler}="alert('XSS')"`)
        .join(' ');
      const maliciousSVG = `<svg ${attributes}><circle cx="10" cy="10" r="5"/></svg>`;
      floatingButton = new FloatingButton({ customSvg: maliciousSVG });

      const buttons = document.querySelectorAll('button');
      const button = buttons[buttons.length - 1] as HTMLButtonElement;
      const svg = button.querySelector('svg');

      expect(svg).toBeDefined();
      eventHandlers.forEach((handler) => {
        expect(svg?.hasAttribute(handler)).toBe(false);
      });
    });
  });
});
