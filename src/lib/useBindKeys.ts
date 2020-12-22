import React, { useCallback, useEffect, useMemo } from 'react';
import usePassiveReducer, { Reducer } from 'react-use-passive-reducer';

import findSequenceHandler from './findSequenceHandler';
import generateKeyMapTrie from './generateKeyMapTrie';
import reducer, { Action, ActionType, initialState, State } from './reducer';

export default function({
  keyMap,
  keyHandlers,
  preventDefault,
}: {
  keyHandlers: { [key: string]: (event: React.KeyboardEvent) => any };
  keyMap: {
    [key: string]: string[];
  };
  preventDefault?: boolean;
}): {
  handleKeyDown: (evt: React.KeyboardEvent) => void;
  handleKeyUp: (evt: React.KeyboardEvent) => void;
  handleBlur: (evt: React.FocusEvent) => void;
} {
  // Only regenerate keymap if it changes.
  // This typically should only run once.
  const keyMapTrie = useMemo(() => generateKeyMapTrie(keyMap), [keyMap]);

  const actionHandler = useCallback(
    (passiveState: State, action: Action) => {
      if (action.type === ActionType.Keydown) {
        const sequence = [...passiveState.sequence];
        const handler = findSequenceHandler(sequence, keyMapTrie);
        if (!handler) return;

        if (preventDefault) {
          action.payload.preventDefault();
        }
        keyHandlers[handler](action.payload);
      }
    },
    [keyMap, keyHandlers],
  );

  const [, dispatch] = usePassiveReducer<Reducer<State, Action>>(
    reducer,
    initialState,
    actionHandler,
  );

  const handleKeyDown = (evt: React.KeyboardEvent): void => {
    // Ensure that the event has a key. keydown was being triggered by
    // autocomplete.
    if (evt.key) {
      dispatch({
        type: ActionType.Keydown,
        payload: evt,
      });
    }
  };

  const handleKeyUp = (evt: React.KeyboardEvent): void => {
    if (evt.key === 'Meta') {
      return dispatch({
        type: ActionType.SwallowSequence,
      });
    }

    // Ensure that the event has a key. keyup was being triggered by
    // autocomplete.
    if (evt.key) {
      dispatch({
        type: ActionType.Keyup,
        payload: evt,
      });
    }
  };

  const handleBlur = (): void => {
    return dispatch({
      type: ActionType.SwallowSequence,
    });
  };

  useEffect(() => {
    const handleClear = (): void => {
      dispatch({
        type: ActionType.SwallowSequence,
      });
    };

    // clear sequence when blurring window
    window.addEventListener('blur', handleClear);

    return (): void => {
      window.removeEventListener('blur', handleClear);
    };
  }, [dispatch]);

  return {
    handleBlur,
    handleKeyDown,
    handleKeyUp,
  };
}
