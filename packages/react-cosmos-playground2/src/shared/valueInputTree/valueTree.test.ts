import {
  FixtureStateValue,
  FixtureStateValues,
} from 'react-cosmos-shared2/fixtureState';
import { ValueNode } from './shared';
import { getFixtureStateValueTree } from './valueTree';

const str1: FixtureStateValue = {
  type: 'primitive',
  value: 'foo',
};

const str2: FixtureStateValue = {
  type: 'primitive',
  value: 'bar',
};

const str3: FixtureStateValue = {
  type: 'primitive',
  value: 'baz',
};

const num: FixtureStateValue = {
  type: 'primitive',
  value: 56,
};

const bool: FixtureStateValue = {
  type: 'primitive',
  value: false,
};

const jsx: FixtureStateValue = {
  type: 'unserializable',
  stringifiedValue: '<div />',
};

const values: FixtureStateValues = {
  str1,
  object1: {
    type: 'object',
    values: {
      str2,
      num,
      bool,
      object2: {
        type: 'object',
        values: { str3, jsx },
      },
      array1: {
        type: 'array',
        values: [num, bool],
      },
    },
  },
};

const rootNode: ValueNode = {
  data: { type: 'collection' },
  children: {
    str1: {
      data: {
        type: 'item',
        value: str1,
      },
    },
    object1: {
      data: { type: 'collection' },
      children: {
        str2: {
          data: {
            type: 'item',
            value: str2,
          },
        },
        num: {
          data: {
            type: 'item',
            value: num,
          },
        },
        bool: {
          data: {
            type: 'item',
            value: bool,
          },
        },
        object2: {
          data: { type: 'collection' },
          children: {
            str3: {
              data: {
                type: 'item',
                value: str3,
              },
            },
            jsx: {
              data: {
                type: 'item',
                value: jsx,
              },
            },
          },
        },
        array1: {
          data: { type: 'collection' },
          children: {
            0: {
              data: {
                type: 'item',
                value: num,
              },
            },
            1: {
              data: {
                type: 'item',
                value: bool,
              },
            },
          },
        },
      },
    },
  },
};

it('creates value tree', () => {
  expect(getFixtureStateValueTree(values)).toEqual(rootNode);
});
