import { FixtureStateValue, FixtureStateValues, KeyValue } from './shared';

// Use fixture state for serializable values and fall back to base values
// TODO: s/KeyValue/FixtureStateObjectValueType
export function extendWithValues(
  obj: KeyValue,
  values: FixtureStateValues
): KeyValue {
  const extendedObj: KeyValue = {};
  Object.keys(values).forEach(key => {
    extendedObj[key] = extendWithValue(obj[key], values[key]);
  });
  return extendedObj;
}

export function extendWithValue(
  baseValue: unknown,
  value: FixtureStateValue
): unknown {
  if (value.type === 'unserializable') {
    return baseValue;
  }

  if (value.type === 'object') {
    // This works (for now) because users can't add/remove object keys nor can
    // they change the type of any value. If any of these requirements show up
    // in the future this will need to be redesign to handle merge conflicts
    const baseObj =
      typeof baseValue === 'object' && baseValue !== null
        ? (baseValue as KeyValue)
        : {};
    return extendWithValues(baseObj, value.values);
  }

  if (value.type === 'array') {
    // This works (for now) because users can't add/remove array items nor can
    // they change the type of any value. If any of these requirements show up
    // in the future this will need to be redesign to handle merge conflicts
    const baseArr: unknown[] = Array.isArray(baseValue) ? baseValue : [];
    return value.values.map((v, idx) => extendWithValue(baseArr[idx], v));
  }

  return value.value;
}
