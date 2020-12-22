import { cleanup, fireEvent, render } from '@testing-library/react';
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

import BindKeys from './BindKeys';

describe('useTableHotkeys()', () => {
  const keyMap = {
    MOVE_LEFT: ['arrowleft', 'shift+tab'],
    MOVE_RIGHT: ['arrowright', 'tab'],
    MOVE_DOWN: ['arrowdown'],
    MOVE_UP: ['arrowup'],
    MUTE: ['meta+e', 'e+meta'],
  };

  let keyHandlers = {
    MOVE_LEFT: jest.fn(),
    MOVE_RIGHT: jest.fn(),
    MOVE_DOWN: jest.fn(),
    MOVE_UP: jest.fn(),
    MUTE: jest.fn(),
  };

  let customOnKeyDown = jest.fn();
  const customOnKeyUp = jest.fn();
  const customOnBlur = jest.fn();

  afterEach(() => {
    cleanup();
    keyHandlers = {
      MOVE_LEFT: jest.fn(),
      MOVE_RIGHT: jest.fn(),
      MOVE_DOWN: jest.fn(),
      MOVE_UP: jest.fn(),
      MUTE: jest.fn(),
    };
    customOnKeyDown = jest.fn();
  });

  function TestWithSingleChild({
    preventDefault,
  }: {
    preventDefault?: boolean;
  }) {
    return (
      <BindKeys
        keyMap={keyMap}
        keyHandlers={keyHandlers}
        preventDefault={preventDefault}
      >
        <div
          onKeyDown={customOnKeyDown}
          onKeyUp={customOnKeyUp}
          onBlur={customOnBlur}
          data-testid="test"
        />
      </BindKeys>
    );
  }

  function TestWithMultipleChildren({
    preventDefault,
  }: {
    preventDefault?: boolean;
  }) {
    return (
      <BindKeys
        keyMap={keyMap}
        keyHandlers={keyHandlers}
        preventDefault={preventDefault}
      >
        <div data-testid="test-child-1" />

        <div data-testid="test-child-2" />
      </BindKeys>
    );
  }

  function TestWithPortal({ preventDefault }: { preventDefault?: boolean }) {
    const portalContainerRef = useRef<HTMLDivElement>(null);
    const el = document.createElement('div');
    useEffect(() => {
      portalContainerRef.current?.appendChild(el);

      return () => {
        portalContainerRef.current?.removeChild(el);
      };
    }, []);
    return (
      <div>
        <BindKeys
          keyMap={keyMap}
          keyHandlers={keyHandlers}
          preventDefault={preventDefault}
        >
          {ReactDOM.createPortal(<div data-testid="test-portal" />, el)}
        </BindKeys>
        <div ref={portalContainerRef} />
      </div>
    );
  }
  it('calls the handlers properly when triggered inside of portal', () => {
    const { getByTestId, debug } = render(<TestWithPortal />);
    fireEvent.keyDown(getByTestId('test-portal'), { key: 'ArrowRight' });
    debug();

    expect(keyHandlers.MOVE_RIGHT).toHaveBeenCalledTimes(1);
  });

  it('calls the custom handlers that get merged with hook handlers', () => {
    const { getByTestId } = render(<TestWithSingleChild />);
    fireEvent.keyDown(getByTestId('test'), { key: 'ArrowRight' });
    fireEvent.keyUp(getByTestId('test'), { key: 'ArrowRight' });
    fireEvent.blur(getByTestId('test'), { key: 'ArrowRight' });

    expect(customOnKeyDown).toHaveBeenCalledTimes(1);
    expect(customOnKeyUp).toHaveBeenCalledTimes(1);
    expect(customOnBlur).toHaveBeenCalledTimes(1);
  });

  it('it calls handlers properly and creates wrapper div when multiple children', () => {
    const { getByTestId } = render(<TestWithMultipleChildren />);
    fireEvent.keyDown(getByTestId('test-child-1'), { key: 'ArrowRight' });
    fireEvent.keyDown(getByTestId('test-child-2'), { key: 'ArrowRight' });
    fireEvent.keyUp(getByTestId('test-child-1'), { key: 'ArrowRight' });
    fireEvent.keyUp(getByTestId('test-child-2'), { key: 'ArrowRight' });
    fireEvent.blur(getByTestId('test-child-1'), { key: 'ArrowRight' });

    expect(keyHandlers.MOVE_RIGHT).toHaveBeenCalledTimes(2);
  });

  it('calls the handler for a single keypresss', () => {
    const { getByTestId } = render(<TestWithSingleChild />);
    fireEvent.keyDown(getByTestId('test'), { key: 'ArrowRight' });

    expect(keyHandlers.MOVE_RIGHT).toHaveBeenCalledTimes(1);
  });

  it('calls the handler for a combination keypress', () => {
    const { getByTestId } = render(<TestWithSingleChild />);
    fireEvent.keyDown(getByTestId('test'), { key: 'Shift' });
    fireEvent.keyDown(getByTestId('test'), { key: 'E' });
    fireEvent.keyUp(getByTestId('test'), { key: 'E' });
    fireEvent.keyDown(getByTestId('test'), { key: 'Tab' });

    expect(keyHandlers.MOVE_LEFT).toHaveBeenCalledTimes(1);
  });

  it('does not call the handler for a combination keypress if part of the sequence is released', () => {
    const { getByTestId } = render(<TestWithSingleChild />);
    fireEvent.keyDown(getByTestId('test'), { key: 'Shift' });
    fireEvent.keyUp(getByTestId('test'), { key: 'Shift' });
    fireEvent.keyDown(getByTestId('test'), { key: 'Tab' });

    expect(keyHandlers.MOVE_LEFT).toHaveBeenCalledTimes(0);
    expect(keyHandlers.MOVE_RIGHT).toHaveBeenCalledTimes(1);
  });

  it('calls the handler twice when triggered in succession', () => {
    const { getByTestId } = render(<TestWithSingleChild />);
    fireEvent.keyDown(getByTestId('test'), { key: 'ArrowRight' });
    expect(keyHandlers.MOVE_RIGHT).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(getByTestId('test'), { key: 'ArrowRight' });
    expect(keyHandlers.MOVE_RIGHT).toHaveBeenCalledTimes(2);
  });

  it('does not call the handler for a combination keypress if window got blurred', () => {
    const { getByTestId } = render(<TestWithSingleChild />);
    fireEvent.keyDown(getByTestId('test'), { key: 'Shift' });
    fireEvent.blur(window);
    fireEvent.keyDown(getByTestId('test'), { key: 'Tab' });

    expect(keyHandlers.MOVE_LEFT).toHaveBeenCalledTimes(0);
    expect(keyHandlers.MOVE_RIGHT).toHaveBeenCalledTimes(1);
  });

  it('does not call the handler for a combination keypress if window got blurred', () => {
    const { getByTestId } = render(<TestWithSingleChild />);
    fireEvent.keyDown(getByTestId('test'), { key: 'Shift' });
    fireEvent.blur(window);
    fireEvent.keyDown(getByTestId('test'), { key: 'Tab' });

    expect(keyHandlers.MOVE_LEFT).toHaveBeenCalledTimes(0);
    expect(keyHandlers.MOVE_RIGHT).toHaveBeenCalledTimes(1);
  });
  it('properly swallows the sequence when meta is hit', () => {
    const { getByTestId } = render(<TestWithSingleChild />);
    fireEvent.keyDown(getByTestId('test'), { key: 'Meta' });
    fireEvent.keyDown(getByTestId('test'), { key: 'F' });
    fireEvent.keyUp(getByTestId('test'), { key: 'Meta' });
    fireEvent.keyDown(getByTestId('test'), { key: 'Meta' });
    fireEvent.keyDown(getByTestId('test'), { key: 'E' });

    expect(keyHandlers.MUTE).toHaveBeenCalledTimes(1);
  });
  it('properly swallows the sequence when focus is lost', () => {
    const { getByTestId } = render(<TestWithSingleChild />);
    fireEvent.keyDown(getByTestId('test'), { key: 'Meta' });
    fireEvent.keyDown(getByTestId('test'), { key: 'F' });
    fireEvent.blur(getByTestId('test'), { key: 'Meta' });
    fireEvent.keyDown(getByTestId('test'), { key: 'Meta' });
    fireEvent.keyDown(getByTestId('test'), { key: 'E' });

    expect(keyHandlers.MUTE).toHaveBeenCalledTimes(1);
  });
});
