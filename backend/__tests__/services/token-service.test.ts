import jwt from 'jsonwebtoken';

import CONFIG from '@/apps/config';
import tokenService from '@/services/token.service';
import { UnauthorizedError } from '@/utils/errors.utils';

describe('TokenService', () => {
  const mockPayload = { id: 1, email: 'test@example.com' };

  describe('hash', () => {
    it('should hash a password', async () => {
      const hashed = await tokenService.hash(CONFIG.SEED_USER_PASSWORD);
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(CONFIG.SEED_USER_PASSWORD);
      expect(hashed.length).toBeGreaterThan(0);
    });
  });

  describe('compare', () => {
    it('should return true for matching password', async () => {
      const hashed = await tokenService.hash(CONFIG.SEED_USER_PASSWORD);
      const result = await tokenService.compare(CONFIG.SEED_USER_PASSWORD, hashed);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const hashed = await tokenService.hash(CONFIG.SEED_USER_PASSWORD);
      const result = await tokenService.compare('wrongPassword', hashed);
      expect(result).toBe(false);
    });
  });

  describe('signAccessToken', () => {
    it('should generate access token', () => {
      const token = tokenService.signAccessToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.decode(token) as { id: number; email: string };
      expect(decoded.id).toBe(mockPayload.id);
      expect(decoded.email).toBe(mockPayload.email);
    });
  });

  describe('signRefreshToken', () => {
    it('should generate refresh token', () => {
      const token = tokenService.signRefreshToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.decode(token) as { id: number; email: string };
      expect(decoded.id).toBe(mockPayload.id);
      expect(decoded.email).toBe(mockPayload.email);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const token = tokenService.signAccessToken(mockPayload);
      const verified = tokenService.verifyToken(token);
      expect(verified.id).toBe(mockPayload.id);
      expect(verified.email).toBe(mockPayload.email);
    });

    it('should throw UnauthorizedError for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      expect(() => tokenService.verifyToken(invalidToken)).toThrow(UnauthorizedError);
      expect(() => tokenService.verifyToken(invalidToken)).toThrow('Invalid token');
    });

    it('should throw UnauthorizedError for token with wrong signature', () => {
      const tokenWithWrongSignature = jwt.sign(mockPayload, 'wrong-secret');
      expect(() => tokenService.verifyToken(tokenWithWrongSignature)).toThrow(UnauthorizedError);
      expect(() => tokenService.verifyToken(tokenWithWrongSignature)).toThrow('Invalid token');
    });

    it('should throw UnauthorizedError for expired token', (done) => {
      const expiredToken = jwt.sign(mockPayload, CONFIG.JWT_SECRET, { expiresIn: '1ms' });

      setTimeout(() => {
        expect(() => tokenService.verifyToken(expiredToken)).toThrow(UnauthorizedError);
        expect(() => tokenService.verifyToken(expiredToken)).toThrow('Token has expired');
        done();
      }, 100);
    });

    it('should re-throw unexpected errors', () => {
      // Mock jwt.verify to throw a generic error
      const originalVerify = jwt.verify;
      jwt.verify = jest.fn(() => {
        throw new Error('Unexpected error');
      });

      expect(() => tokenService.verifyToken('some-token')).toThrow('Unexpected error');

      // Restore original
      jwt.verify = originalVerify;
    });
  });
});
