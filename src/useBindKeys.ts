import React, { useCallback, useEffect, useMemo } from 'react';
import usePassiveReducer, { Reducer } from 'react-use-passive-reducer';

import findSequenceHandler from './lib/findSequenceHandler';
import generateKeyMapTrie from './lib/generateKeyMapTrie';
import reducer, {
  Action,
  ActionType,
  initialState,
  State,
} from './lib/reducer';

export default function(
  ref: React.RefObject<HTMLElement>,
  {
    keyMap,
    keyHandlers,
    preventDefault,
  }: {
    keyHandlers: { [key: string]: (event: KeyboardEvent) => any };
    keyMap: {
      [key: string]: string[];
    };
    preventDefault?: boolean;
  },
): void {
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

  useEffect(() => {
    const handleKeyDown = (evt: KeyboardEvent): void => {
      // Ensure that the event has a key. keydown was being triggered by
      // autocomplete.
      if (evt.key) {
        dispatch({
          type: ActionType.Keydown,
          payload: evt,
        });
      }
    };

    const handleKeyUp = (evt: KeyboardEvent): void => {
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

    if (ref.current) {
      ref.current.tabIndex = -1;
      ref.current.addEventListener('keyup', handleKeyUp);
      ref.current.addEventListener('keydown', handleKeyDown);
      ref.current.addEventListener('blur', handleBlur);
    }

    return (): void => {
      if (ref.current) {
        ref.current.removeEventListener('keyup', handleKeyUp);
        ref.current.removeEventListener('keydown', handleKeyDown);
        ref.current.removeEventListener('blur', handleBlur);
      }
    };
  }, [ref, dispatch]);

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
}
