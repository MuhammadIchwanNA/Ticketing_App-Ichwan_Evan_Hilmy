type TransactionStatus = "accepted" | "rejected";

interface MailParams {
  status: TransactionStatus;
  eventName: string;
  userName: string;
  year: number;
  ticketCount: number;
}

export function generateTransactionEmail({
  status,
  eventName,
  userName,
  year,
  ticketCount,
}: MailParams): string {
  const isAccepted = status === "accepted";

  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f6f9; padding: 40px;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <div style="background: ${
        isAccepted ? "#16a34a" : "#dc2626"
      }; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 600;">
          ${isAccepted ? "🎉 Transaction Accepted" : "❌ Transaction Rejected"}
        </h2>
      </div>

      <!-- Body -->
      <div style="padding: 30px; line-height: 1.6; color: #374151;">
        <p style="font-size: 16px; margin-bottom: 16px;">
          Hi <strong>${userName}</strong>,
        </p>

        ${
          isAccepted
            ? `
              <p style="font-size: 16px; margin-bottom: 12px;">
                Great news! Your transaction for <strong>${eventName}</strong> has been 
                <span style="color: #16a34a; font-weight: 600;">accepted</span>.
              </p>
              <p style="font-size: 15px; margin-bottom: 20px;">
                <strong>Tickets Confirmed:</strong> ${ticketCount}
              </p>
            `
            : `
              <p style="font-size: 16px; margin-bottom: 12px;">
                We’re sorry, but your transaction for <strong>${eventName}</strong> has been 
                <span style="color: #dc2626; font-weight: 600;">rejected</span>.
              </p>
            `
        }

        <!-- Event details -->

        <p style="font-size: 14px; color: #6b7280;">
          Thank you for using <strong>Eventify</strong>. We look forward to seeing you at the event!
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
        © ${year} Eventify. All rights reserved.
      </div>
    </div>
  </div>
  `;
}
