import { describe, it, expect } from 'vitest';
import { Attribution } from '../lib/erc8021';
import { type Hex } from 'viem';

describe('ERC-8021 Attribution', () => {
  it('should generate the correct dataSuffix with default code', () => {
    const result = Attribution.toDataSuffix();
    expect(result.optional).toBe(true);
    expect(result.value.endsWith('80218021802180218021802180218021')).toBe(true);
    expect(result.value.startsWith('0x62635f64')).toBe(true);
  });

  it('should handle custom hex builder codes', () => {
    const customCode = '0x12345' as Hex;
    const result = Attribution.toDataSuffix(customCode);
    expect(result.value).toBe('0x1234580218021802180218021802180218021');
  });
});
