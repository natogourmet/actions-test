import { describe, expect, test } from 'vitest';
import { camelize, camelizeObject, interpolate } from '../text';

describe('camelize function', () => {
  const samples = [
    { input: 'foo', output: 'foo' },
    { input: 'Foo', output: 'foo' },
    { input: 'foo-bar', output: 'fooBar' },
    { input: 'Foo-bar', output: 'fooBar' },
    { input: 'foo_bar', output: 'fooBar' },
    { input: 'Foo_bar', output: 'fooBar' },
    { input: 'Foo_bar_12', output: 'fooBar12' }
  ];
  samples.forEach(({ input, output }) => {
    test(`GIVEN ${input} string THEN should return ${output}`, () => {
      expect(camelize(input)).toBe(output);
    });
  });
});

describe('camelizeObject function', () => {
  const sample = {
    input: {
      fooBar: 'huehue',
      Lorem_ipsum: 'dolor sit',
      SedQuis_12: '12'
    },
    output: {
      fooBar: 'huehue',
      loremIpsum: 'dolor sit',
      sedQuis12: '12'
    }
  };

  test(`GIVEN object with keys in different cases THEN should return object with all keys in camel case`, () => {
    expect(camelizeObject(sample.input)).toEqual(sample.output);
  });
});

describe('interpolate function', () => {
  const samples = [
    { input: { str: 'foo', replacements: { notAKey: 'none' } }, output: 'foo' },
    {
      input: {
        str: 'number should be between {min} and {max}',
        replacements: { min: '5', max: '10' } as Record<string, string>
      },
      output: 'number should be between 5 and 10'
    },
    {
      input: {
        str: 'The total amount to pay is {currency} {value}',
        replacements: { currency: 'USD', value: '500' } as Record<string, string>
      },
      output: 'The total amount to pay is USD 500'
    }
  ];
  samples.forEach(({ input, output }) => {
    const { str, replacements } = input;
    test(`GIVEN ${str} and replacements params THEN should return ${output}`, () =>
      expect(interpolate(str, replacements)).toBe(output));
  });
});
