import { prisma } from '@/lib/prisma';

export type ActivityAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'CLEAR';
export type ActivityEntity = 'TRANSACTION' | 'CATEGORY' | 'LEDGER' | 'STORAGE';

interface LogActivityParams {
    ledgerId: string;
    userId: string;
    action: ActivityAction;
    entityType: ActivityEntity;
    entityId?: string; // Optional ID of the entity being acted upon
    details: string;
}

/**
 * Logs a user activity to the database.
 * This function swallows errors to prevent logging failures from blocking the main application flow.
 */
export async function logActivity({
    ledgerId,
    userId,
    action,
    entityType,
    entityId,
    details,
}: LogActivityParams) {
    try {
        await prisma.activityLog.create({
            data: {
                ledgerId,
                userId,
                action,
                entityType,
                entityId,
                message: details,
            },
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
}
