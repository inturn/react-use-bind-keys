export enum ActionType {
  Keydown,
  Keyup,
  SwallowSequence,
}

export interface State {
  sequence: Set<string>;
}

export const initialState = {
  sequence: new Set([]) as Set<string>,
};

export type Action =
  | {
      type: ActionType.Keydown;
      payload: React.KeyboardEvent;
    }
  | {
      type: ActionType.Keyup;
      payload: React.KeyboardEvent;
    }
  | {
      type: ActionType.SwallowSequence;
    };

export default function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.Keydown: {
      const keyBeingPressed = action.payload.key.toLowerCase();

      return {
        ...state,
        sequence: new Set([...state.sequence, keyBeingPressed]),
      };
    }
    case ActionType.Keyup: {
      const keyBeingReleased = action.payload.key.toLowerCase();
      const updatedSequence = state.sequence;
      updatedSequence.delete(keyBeingReleased);

      return {
        ...state,
        sequence: updatedSequence,
      };
    }
    case ActionType.SwallowSequence: {
      const updatedSequence = state.sequence;

      updatedSequence.clear();

      return {
        ...state,
        sequence: updatedSequence,
      };
    }
  }
}
