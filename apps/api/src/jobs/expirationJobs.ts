import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Check for expired transactions every minute
export const startTransactionExpirationJob = () => {
  cron.schedule('* * * * *', async () => {
    console.log('Checking for expired transactions...');
    
    try {
      const expiredTransactions = await prisma.transaction.findMany({
        where: {
          status: 'WAITING_PAYMENT',
          expiresAt: {
            lte: new Date()
          }
        },
        include: {
          event: true,
          vouchers: { include: { voucher: true } },
          coupons: { include: { coupon: true } }
        }
      });

      for (const transaction of expiredTransactions) {
        await prisma.$transaction(async (tx) => {
          // Restore seats
          await tx.event.update({
            where: { id: transaction.eventId },
            data: { availableSeats: { increment: transaction.ticketCount } }
          });

          // Restore points if used
          if (transaction.pointsUsed > 0) {
            await tx.user.update({
              where: { id: transaction.userId },
              data: { pointsBalance: { increment: transaction.pointsUsed } }
            });

            await tx.pointsHistory.create({
              data: {
                userId: transaction.userId,
                points: transaction.pointsUsed,
                type: 'EARNED',
                description: `Refund from expired transaction: ${transaction.event.name}`,
                expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
              }
            });
          }

          // Restore voucher usage
          for (const tv of transaction.vouchers) {
            await tx.voucher.update({
              where: { id: tv.voucher.id },
              data: { currentUses: { decrement: 1 } }
            });
          }

          // Restore coupons
          for (const tc of transaction.coupons) {
            await tx.coupon.update({
              where: { id: tc.coupon.id },
              data: { isUsed: false }
            });
          }

          // Mark transaction as expired
          await tx.transaction.update({
            where: { id: transaction.id },
            data: { status: 'EXPIRED' }
          });
        });
      }

      if (expiredTransactions.length > 0) {
        console.log(`Processed ${expiredTransactions.length} expired transactions`);
      }

    } catch (error) {
      console.error('Error processing expired transactions:', error);
    }
  });
};

// Check for expired points every day at midnight
export const startPointsExpirationJob = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Checking for expired points...');
    
    try {
      const expiredPoints = await prisma.pointsHistory.findMany({
        where: {
          type: 'EARNED',
          expiresAt: {
            lte: new Date()
          }
        },
        include: { user: true }
      });

      for (const point of expiredPoints) {
        await prisma.$transaction(async (tx) => {
          // Deduct expired points from user balance
          await tx.user.update({
            where: { id: point.userId },
            data: { pointsBalance: { decrement: point.points } }
          });

          // Create expiration record
          await tx.pointsHistory.create({
            data: {
              userId: point.userId,
              points: -point.points,
              type: 'EXPIRED',
              description: `Points expired: ${point.description}`,
              expiresAt: null
            }
          });

          // Update original record
          await tx.pointsHistory.update({
            where: { id: point.id },
            data: { 
              type: 'EXPIRED',
              expiresAt: null 
            }
          });
        });
      }

      if (expiredPoints.length > 0) {
        console.log(`Processed ${expiredPoints.length} expired point records`);
      }

    } catch (error) {
      console.error('Error processing expired points:', error);
    }
  });
};

// Start all expiration jobs
export const startAllJobs = () => {
  startTransactionExpirationJob();
  startPointsExpirationJob();
  console.log('All expiration jobs started');
};