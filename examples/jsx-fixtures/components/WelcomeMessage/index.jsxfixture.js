// @flow

import React from 'react';
import { Viewport } from '../../decorators/Viewport';
import { Hello } from '.';

export default (
  <Viewport width={320} height={568}>
    <Hello greeting="Hi" name="Maggie" />
  </Viewport>
);
