# react-bind-keys

[react-bind-keys](https://github.com/inturn/react-use-bind-keys) is a react component that makes it easy to bind key events to elements

## Usage

```tsx
import BindKeys from 'react-bind-keys';

export default function MyComponent({ children }) {
  const keyHandlers = {
    MOVE_LEFT: () => console.log('left'),
    MOVE_RIGHT: () => console.log('right'),
    MOVE_DOWN: () => console.log('down'),
    MOVE_UP: () => console.log('up'),
    MUTE: () => console.log('mute'),
  };
  const keyMap = {
    MOVE_LEFT: ['arrowleft', 'shift+tab'],
    MOVE_RIGHT: ['arrowright', 'tab'],
    MOVE_DOWN: ['arrowdown'],
    MOVE_UP: ['arrowup'],
    MUTE: ['meta+e', 'e+meta'],
  };

  return (
    <BindKeys keyMap={keyMap} keyHandlers={keyHandlers}>
      {children}
    </BindKeys>
  );
}
```

## Fature Checklist

[x] - proper event propogation with portals
[ ] - allow binding to window
[ ] - add debugging logs and hook debuger
