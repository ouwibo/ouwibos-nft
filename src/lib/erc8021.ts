import { type Hex, toHex } from 'viem';

/**
 * ERC-8021 Builder Code Utilities
 * Converts a string builder code into the required dataSuffix capability format.
 */

// Your Base Dev Builder Code
const envCode = process.env.NEXT_PUBLIC_BUILDER_CODE as Hex | undefined;
const BUILDER_CODE_HEX = envCode || ("0x62635f6463756d766c37610b00" as Hex); 
const ERC_8021_SUFFIX = "80218021802180218021802180218021";

export const Attribution = {
  /**
   * Generates the dataSuffix object for wagmi's useSendCalls capabilities.
   */
  toDataSuffix: (customCode?: Hex) => {
    const code = customCode || BUILDER_CODE_HEX;
    // Ensure we combine the code and the 16-byte 8021 repeating suffix
    const suffixValue = `${code}${ERC_8021_SUFFIX}` as Hex;
    
    return {
      value: suffixValue,
      optional: true // Highly recommended so tx doesn't fail if wallet doesn't support capabilities
    };
  }
};
