import React from 'react';
import styled from 'styled-components';
import { Label } from './shared';

type Props = {
  id: string;
  label: string;
  value: boolean;
  onChange: (newValue: boolean) => unknown;
};

export function BooleanInput({ id, label, value, onChange }: Props) {
  const onInputToggle = React.useCallback(() => onChange(!value), [
    onChange,
    value
  ]);

  return (
    <>
      <Label as="span" onClick={onInputToggle}>
        {label}
      </Label>
      <BooleanButton onClick={onInputToggle}>
        {value ? 'true' : 'false'}
      </BooleanButton>
    </>
  );
}

const BooleanButton = styled.button`
  height: 24px;
  margin-top: 2px;
  padding: 0 4px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: var(--grey6);
  line-height: 24px;
  outline: none;
  user-select: none;

  :focus {
    box-shadow: 0 0 0.5px 1px var(--primary4);
  }
`;
