import React from 'react';
import { ValueInputSlotProps } from 'react-cosmos-playground2/plugin';
import { createPlugin } from 'react-plugin';
import { BooleanInput } from './BooleanInput';

type BooleanInputPluginSpec = {
  name: 'booleanInputPlugin';
};

const { plug, register } = createPlugin<BooleanInputPluginSpec>({
  name: 'booleanInputPlugin',
});

plug<ValueInputSlotProps>('valueInput', ({ slotProps, children }) => {
  const { name, value, parents, onInputChange } = slotProps;

  if (value.type === 'primitive' && typeof value.data === 'boolean')
    return (
      <BooleanInput
        name={name}
        value={value.data}
        indentLevel={parents.length}
        onChange={onInputChange}
      />
    );

  // Fall back to default inputs
  return <>{children}</>;
});

register();
