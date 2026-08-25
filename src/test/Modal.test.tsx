import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Modal from '../components/ui/Modal';

// jsdom leaves offsetParent null for every element, which hides visibility
// bugs in focus-trap logic. Stub it so focusable detection behaves like a
// real browser.
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get() {
      return document.body;
    },
  });
});
afterAll(() => {
  delete (HTMLElement.prototype as unknown as Record<string, unknown>)
    .offsetParent;
});

describe('Modal focus management', () => {
  it('keeps input focus when the parent rerenders with a new onClose identity', () => {
    const { rerender } = render(
      <Modal open onClose={() => {}} title="Test">
        <input aria-label="cantidad" />
      </Modal>,
    );

    const input = screen.getByLabelText('cantidad');
    act(() => input.focus());
    expect(input).toHaveFocus();

    // Typing in a controlled field rerenders the consumer, which passes a
    // fresh inline onClose. The modal must NOT steal focus on that rerender.
    fireEvent.change(input, { target: { value: '5' } });
    rerender(
      <Modal open onClose={() => {}} title="Test">
        <input aria-label="cantidad" defaultValue="5" />
      </Modal>,
    );

    expect(input).toHaveFocus();
  });

  it('calls the latest onClose when Escape is pressed', () => {
    const first = vi.fn();
    const latest = vi.fn();
    const { rerender } = render(
      <Modal open onClose={first} title="Test">
        <p>content</p>
      </Modal>,
    );
    rerender(
      <Modal open onClose={latest} title="Test">
        <p>content</p>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(latest).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
  });
});
