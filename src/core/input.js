import { LOGICAL_W, LOGICAL_H } from './util.js';

/**
 * Ввод: клавиатура, мышь и касания в логических координатах холста.
 * Клик живёт ровно один кадр — UI потребляет его при отрисовке.
 */
export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.justPressed = new Set();
    this.pointer = { x: -100, y: -100, down: false, inside: false };
    this.click = null;
    this.dragging = false;

    window.addEventListener('keydown', this.onKeyDown, { passive: false });
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointerleave', this.onPointerLeave);
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  }

  toLogical(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * LOGICAL_W;
    const y = ((event.clientY - rect.top) / rect.height) * LOGICAL_H;
    return { x, y };
  }

  onKeyDown = (event) => {
    const code = event.code;
    if (
      [
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Space',
        'Enter',
        'Tab',
        'KeyE',
        'KeyA',
        'KeyD',
        'KeyW',
        'KeyS',
      ].includes(code)
    ) {
      event.preventDefault();
    }
    if (!this.keys.has(code)) {
      this.justPressed.add(code);
    }
    this.keys.add(code);
  };

  onKeyUp = (event) => {
    this.keys.delete(event.code);
  };

  onBlur = () => {
    this.keys.clear();
    this.pointer.down = false;
  };

  onPointerMove = (event) => {
    const p = this.toLogical(event);
    this.pointer.x = p.x;
    this.pointer.y = p.y;
    this.pointer.inside = p.x >= 0 && p.x <= LOGICAL_W && p.y >= 0 && p.y <= LOGICAL_H;
  };

  onPointerDown = (event) => {
    const p = this.toLogical(event);
    this.pointer.x = p.x;
    this.pointer.y = p.y;
    this.pointer.down = true;
    this.pointer.inside = true;
    this.dragging = true;
    this.click = { x: p.x, y: p.y };
    if (event.pointerId !== undefined && this.canvas.setPointerCapture) {
      try {
        this.canvas.setPointerCapture(event.pointerId);
      } catch {
        // некоторые браузеры не дают захват для уже отпущенного указателя
      }
    }
    event.preventDefault();
  };

  onPointerUp = (event) => {
    if (event.pointerType === 'touch' || this.pointer.down) {
      this.pointer.down = false;
      this.dragging = false;
    }
  };

  onPointerLeave = () => {
    this.pointer.inside = false;
  };

  isDown(...codes) {
    return codes.some((code) => this.keys.has(code));
  }

  consumePressed(...codes) {
    for (const code of codes) {
      if (this.justPressed.has(code)) {
        this.justPressed.delete(code);
        return true;
      }
    }
    return false;
  }

  consumeClick() {
    const click = this.click;
    this.click = null;
    return click;
  }

  peekClick() {
    return this.click;
  }

  isHovering(x, y, w, h) {
    const { x: px, y: py } = this.pointer;
    return px >= x && px <= x + w && py >= y && py <= y + h;
  }

  endFrame() {
    this.justPressed.clear();
    this.click = null;
  }
}
