import React from 'react';

import useBindKeys from './lib/useBindKeys';

export default function BindKeys({
  children,
  keyMap,
  keyHandlers,
  preventDefault,
}: {
  children: React.ReactNode;
  keyHandlers: { [key: string]: (event: React.KeyboardEvent) => any };
  keyMap: {
    [key: string]: string[];
  };
  preventDefault?: boolean;
}) {
  const { handleKeyUp, handleKeyDown, handleBlur } = useBindKeys({
    keyMap,
    keyHandlers,
    preventDefault,
  });

  if (React.isValidElement(children)) {
    const props = {
      onKeyUp: (evt: React.KeyboardEvent): void => {
        handleKeyUp(evt);
        if (children.props.onKeyUp) {
          children.props?.onKeyUp(evt);
        }
      },
      onKeyDown: (evt: React.KeyboardEvent): void => {
        handleKeyDown(evt);
        if (children.props.onKeyDown) {
          children.props.onKeyDown(evt);
        }
      },
      onBlur: (evt: React.FocusEvent): void => {
        handleBlur(evt);
        if (children.props.onBlur) {
          children.props.onBlur(evt);
        }
      },
    };

    return React.cloneElement(children, props);
  }

  return (
    <div onKeyUp={handleKeyUp} onKeyDown={handleKeyDown} onBlur={handleBlur}>
      {children}
    </div>
  );
}
