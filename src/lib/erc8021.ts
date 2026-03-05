import { type Hex, stringToHex } from 'viem';

/**
 * ERC-8021 Builder Code Attribution Utility
 * Handles encoding of builder codes and the standard 8021 suffix.
 */

const DEFAULT_CODE = "bc_dcumvl7a";
const ERC_8021_MARKER = "80218021802180218021802180218021";

export const Attribution = {
  /**
   * Encodes builder codes into the dataSuffix capability format.
   * Supports both raw strings and hex strings.
   */
  toDataSuffix: (options?: { codes: string[] }) => {
    // Use the provided code or fall back to the default
    const codes = options?.codes || [process.env.NEXT_PUBLIC_BUILDER_CODE || DEFAULT_CODE];
    
    // Combine and encode codes to hex
    const hexCode = codes.map(code => 
      code.startsWith('0x') ? code.slice(2) : stringToHex(code).slice(2)
    ).join('');

    return {
      value: `0x${hexCode}${ERC_8021_MARKER}` as Hex,
      optional: true
    };
  }
};
