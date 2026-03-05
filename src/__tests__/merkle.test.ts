import { describe, it, expect } from 'vitest';
import { POST } from '../app/api/merkle/route';
import { NextRequest } from 'next/server';

describe('Merkle API', () => {
  it('should return error if address is missing', async () => {
    const req = new NextRequest('http://localhost/api/merkle', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    
    const res = await POST(req);
    const json = await res.json();
    
    expect(res.status).toBe(400);
    expect(json.error).toBe('Address is required');
  });

  it('should return default proof and args for valid address', async () => {
    const req = new NextRequest('http://localhost/api/merkle', {
      method: 'POST',
      body: JSON.stringify({ address: '0x1234567890123456789012345678901234567890' }),
    });
    
    const res = await POST(req);
    const json = await res.json();
    
    expect(res.status).toBe(200);
    expect(json.proof).toEqual([]);
    expect(json.quantityLimit).toBe("1");
    expect(json.price).toBe("0"); // Updated expectation for Free Mint
  });
});
