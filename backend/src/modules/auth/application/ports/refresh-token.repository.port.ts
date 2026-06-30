/**
 * Port (interface) for the Refresh Token Repository.
 *
 * Contains exactly the operations that AuthService currently needs
 * for the refresh_tokens table. No speculative methods added.
 */

export interface CreateRefreshTokenData {
  userId: string;
  tokenHash: string;
  deviceInfo?: string;
  ipAddress?: string;
  deviceId?: string;
  expiresAt: Date;
}

export interface RefreshTokenRecord {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
}

export interface IRefreshTokenRepository {
  /**
   * Find a refresh token by its SHA-256 hash.
   * Used in: refreshTokens() to validate the incoming token.
   */
  findByHash(tokenHash: string): Promise<RefreshTokenRecord | null>;

  /**
   * Delete a refresh token by its hash.
   * Used in: logout() to invalidate the current session.
   */
  deleteByHash(tokenHash: string): Promise<void>;

  /**
   * Delete a refresh token by its primary key id.
   * Used in: refreshTokens() — delete the old record before rotating.
   */
  deleteById(id: string): Promise<void>;

  /**
   * Delete all refresh tokens belonging to a user.
   * Used in: logoutAll() — currently has no endpoint but must not be removed.
   */
  deleteAllByUserId(userId: string): Promise<void>;

  /**
   * Delete expired tokens for a user.
   * Used in: saveRefreshToken() — housekeeping before inserting a new token.
   */
  deleteExpiredByUserId(userId: string): Promise<void>;

  /**
   * Persist a new refresh token record.
   * Used in: saveRefreshToken() after generating a new token pair.
   */
  create(data: CreateRefreshTokenData): Promise<void>;
}
