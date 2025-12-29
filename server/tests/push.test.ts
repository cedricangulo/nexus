import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock firebase-admin before importing push service
vi.mock('firebase-admin', () => {
    const mockSendEachForMulticast = vi.fn();

    return {
        default: {
            initializeApp: vi.fn(() => ({})),
            credential: {
                cert: vi.fn(() => ({})),
            },
            messaging: vi.fn(() => ({
                sendEachForMulticast: mockSendEachForMulticast,
            })),
        },
    };
});

// Mock the device token service
vi.mock('../src/modules/device-token/device-token.service', () => ({
    getDeviceTokensByUserId: vi.fn(),
    deleteTokensByValues: vi.fn(),
}));

// Mock the env config
vi.mock('../src/config/env', () => ({
    env: {
        FIREBASE_PROJECT_ID: 'test-project',
        FIREBASE_CLIENT_EMAIL: 'test@test.iam.gserviceaccount.com',
        FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n',
    },
}));

// Mock logger
vi.mock('../src/utils/logger', () => ({
    default: {
        info: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        error: vi.fn(),
    },
}));

import admin from 'firebase-admin';
import { getDeviceTokensByUserId, deleteTokensByValues } from '../src/modules/device-token/device-token.service';
import { sendPushToUser, sendPushToUsers } from '../src/services/push.service';

describe('Push Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetModules();
    });

    describe('sendPushToUser', () => {
        it('should send push notification to user devices', async () => {
            const mockTokens = [
                { id: '1', userId: 'user-1', token: 'token-1', platform: 'web', createdAt: new Date(), updatedAt: new Date() },
                { id: '2', userId: 'user-1', token: 'token-2', platform: 'android', createdAt: new Date(), updatedAt: new Date() },
            ];

            vi.mocked(getDeviceTokensByUserId).mockResolvedValue(mockTokens);

            const mockMessaging = admin.messaging({} as admin.app.App);
            vi.mocked(mockMessaging.sendEachForMulticast).mockResolvedValue({
                successCount: 2,
                failureCount: 0,
                responses: [
                    { success: true, messageId: 'msg-1' },
                    { success: true, messageId: 'msg-2' },
                ],
            });

            await sendPushToUser('user-1', {
                title: 'Test Title',
                body: 'Test Body',
                link: '/dashboard',
            });

            expect(getDeviceTokensByUserId).toHaveBeenCalledWith('user-1');
            expect(mockMessaging.sendEachForMulticast).toHaveBeenCalledWith(
                expect.objectContaining({
                    tokens: ['token-1', 'token-2'],
                    notification: {
                        title: 'Test Title',
                        body: 'Test Body',
                    },
                })
            );
        });

        it('should skip if user has no device tokens', async () => {
            vi.mocked(getDeviceTokensByUserId).mockResolvedValue([]);

            await sendPushToUser('user-no-tokens', {
                title: 'Test',
                body: 'Test',
            });

            const mockMessaging = admin.messaging({} as admin.app.App);
            expect(mockMessaging.sendEachForMulticast).not.toHaveBeenCalled();
        });

        it('should remove invalid tokens from database', async () => {
            const mockTokens = [
                { id: '1', userId: 'user-1', token: 'valid-token', platform: 'web', createdAt: new Date(), updatedAt: new Date() },
                { id: '2', userId: 'user-1', token: 'invalid-token', platform: 'web', createdAt: new Date(), updatedAt: new Date() },
            ];

            vi.mocked(getDeviceTokensByUserId).mockResolvedValue(mockTokens);
            vi.mocked(deleteTokensByValues).mockResolvedValue({ count: 1 });

            const mockMessaging = admin.messaging({} as admin.app.App);
            vi.mocked(mockMessaging.sendEachForMulticast).mockResolvedValue({
                successCount: 1,
                failureCount: 1,
                responses: [
                    { success: true, messageId: 'msg-1' },
                    {
                        success: false,
                        error: {
                            code: 'messaging/registration-token-not-registered',
                            message: 'Token not registered',
                        } as admin.FirebaseError,
                    },
                ],
            });

            await sendPushToUser('user-1', {
                title: 'Test',
                body: 'Test',
            });

            expect(deleteTokensByValues).toHaveBeenCalledWith(['invalid-token']);
        });
    });

    describe('sendPushToUsers', () => {
        it('should send push to multiple users', async () => {
            vi.mocked(getDeviceTokensByUserId).mockResolvedValue([
                { id: '1', userId: 'user-1', token: 'token-1', platform: 'web', createdAt: new Date(), updatedAt: new Date() },
            ]);

            const mockMessaging = admin.messaging({} as admin.app.App);
            vi.mocked(mockMessaging.sendEachForMulticast).mockResolvedValue({
                successCount: 1,
                failureCount: 0,
                responses: [{ success: true, messageId: 'msg-1' }],
            });

            await sendPushToUsers(['user-1', 'user-2', 'user-3'], {
                title: 'Bulk Test',
                body: 'Bulk Body',
            });

            expect(getDeviceTokensByUserId).toHaveBeenCalledTimes(3);
        });
    });
});
