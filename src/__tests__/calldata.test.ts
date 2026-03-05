import { describe, it, expect } from 'vitest';
import { Attribution } from '../lib/erc8021';
import { stringToHex } from 'viem';

describe('ERC-8021 Attribution', () => {
  it('should generate the correct dataSuffix with default code', () => {
    const result = Attribution.toDataSuffix();
    expect(result.optional).toBe(true);
    // bc_dcumvl7a hex is 62635f6463756d766c3761
    expect(result.value).toContain('62635f6463756d766c3761');
    expect(result.value.endsWith('80218021802180218021802180218021')).toBe(true);
  });

  it('should handle custom codes in an array', () => {
    const result = Attribution.toDataSuffix({ codes: ['bc_dcumvl7a'] });
    expect(result.value).toContain('62635f6463756d766c3761');
    expect(result.value.endsWith('80218021802180218021802180218021')).toBe(true);
  });
});
