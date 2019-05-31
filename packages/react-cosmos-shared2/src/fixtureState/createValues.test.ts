import { createValues } from './createValues';

it('creates string value', () => {
  const values = createValues({ myProp: 'foo' });
  expect(values).toEqual({
    myProp: {
      type: 'simple',
      value: 'foo'
    }
  });
});

it('creates number value', () => {
  const values = createValues({ myProp: 56 });
  expect(values).toEqual({
    myProp: {
      type: 'simple',
      value: 56
    }
  });
});

it('creates boolean value', () => {
  const values = createValues({ myProp: false });
  expect(values).toEqual({
    myProp: {
      type: 'simple',
      value: false
    }
  });
});

it('ignores undefined value', () => {
  const values = createValues({ myProp: undefined });
  expect(values).toEqual({});
});

it('creates null value', () => {
  const values = createValues({ myProp: null });
  expect(values).toEqual({
    myProp: {
      type: 'simple',
      value: null
    }
  });
});

it('creates unserializable function value', () => {
  const values = createValues({ myProp: () => {} });
  expect(values).toEqual({
    myProp: {
      type: 'unserializable',
      stringifiedValue: 'function () { }'
    }
  });
});

it('creates unserializable regexp value', () => {
  const values = createValues({ myProp: /impossible/g });
  expect(values).toEqual({
    myProp: {
      type: 'unserializable',
      stringifiedValue: '/impossible/g'
    }
  });
});

it('creates empty object value', () => {
  const values = createValues({ myProp: {} });
  expect(values).toEqual({
    myProp: {
      type: 'object',
      values: {}
    }
  });
});

it('creates serializable object value', () => {
  const values = createValues({
    myProp: { strProp: 'foo', numProp: 56, boolProp: false }
  });
  expect(values).toEqual({
    myProp: {
      type: 'object',
      values: {
        strProp: {
          type: 'simple',
          value: 'foo'
        },
        numProp: {
          type: 'simple',
          value: 56
        },
        boolProp: {
          type: 'simple',
          value: false
        }
      }
    }
  });
});

it('creates partially serializable object value', () => {
  const values = createValues({
    myProp: { strProp: 'foo', fnProp: () => {} }
  });
  expect(values).toEqual({
    myProp: {
      type: 'object',
      values: {
        strProp: {
          type: 'simple',
          value: 'foo'
        },
        fnProp: {
          type: 'unserializable',
          stringifiedValue: 'function () { }'
        }
      }
    }
  });
});
