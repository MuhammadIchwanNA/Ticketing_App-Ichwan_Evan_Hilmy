import { CheckCircle, Eye, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "../../lib/api";

interface Transaction {
  id: string;
  eventName: string;
  customerName: string;
  email: string;
  ticketCount: number;
  totalAmount: number;
  status:
    | "WAITING_CONFIRMATION"
    | "CONFIRMED"
    | "WAITING_PAYMENT"
    | "REJECTED"
    | "EXPIRED";
  paymentProof: string | null;
  createdAt: string;
  expiresAt: string | null;
}

export const TransactionsContent = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // 1. Get organizer's events
        const eventsRes = await apiClient.get("/api/events/organizer/my-events");
        const events = eventsRes.events;

        let allTransactions: Transaction[] = [];

        // 2. For each event, fetch its transactions
        for (const event of events) {
          try {
            const txRes = await apiClient.get(`/api/transactions?eventId=${event.id}`);
            const txs = Array.isArray(txRes) ? txRes : [];

            const mappedTxs: Transaction[] = txs
              .filter((t: any) => t && t.event && t.user) // Filter out invalid data
              .map((t: any) => ({
                id: t.id,
                eventName: t.event?.name || 'Unknown Event',
                customerName: t.user?.name || 'Unknown Customer',
                email: t.user?.email || 'No email',
                ticketCount: t.ticketCount || 0,
                totalAmount: t.totalAmount || 0,
                status: t.status,
                paymentProof: t.paymentProof,
                createdAt: t.createdAt,
                expiresAt: t.expiresAt,
              }));

            allTransactions = [...allTransactions, ...mappedTxs];
          } catch (eventError) {
            console.error(`Error fetching transactions for event ${event.id}:`, eventError);
            // Continue with next event
          }
        }

        setTransactions(allTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "status-available";
      case "WAITING_CONFIRMATION":
      case "WAITING_PAYMENT":
        return "status-limited";
      case "REJECTED":
      case "EXPIRED":
        return "status-sold-out";
      default:
        return "chip";
    }
  };

  const handleTransactionAction = async (
    transactionId: string,
    action: "approve" | "reject"
  ) => {
    try {
      const actionData = { action: action === "approve" ? "confirm" : "reject" };
      await apiClient.patch(`/api/transactions/${transactionId}/confirm`, actionData);
      // Refresh after action
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === transactionId
            ? {
                ...t,
                status: action === "approve" ? "CONFIRMED" : "REJECTED",
              }
            : t
        )
      );
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">All Transactions</h3>
          <div className="flex gap-2 text-sm">
            <span className="chip status-available">Confirmed</span>
            <span className="chip status-limited">Pending</span>
            <span className="chip status-sold-out">Rejected/Expired</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="divide-y">
              <tr className="text-left">
                <th className="pb-3 text-sm font-medium ">Customer</th>
                <th className="pb-3 text-sm font-medium ">Event</th>
                <th className="pb-3 text-sm font-medium ">Amount</th>
                <th className="pb-3 text-sm font-medium ">Status</th>
                <th className="pb-3 text-sm font-medium ">Date</th>
                <th className="pb-3 text-sm font-medium ">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className=""
                >
                  <td className="p-4">
                    <div>
                      <div className="font-medium">
                        {transaction.customerName}
                      </div>
                      <div className="text-sm ">{transaction.email}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{transaction.eventName}</div>
                    <div className="text-sm ">
                      {transaction.ticketCount} tickets
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">
                      IDR {transaction.totalAmount.toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`chip ${getTransactionStatusColor(
                        transaction.status
                      )}`}
                    >
                      {transaction.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 text-sm ">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {transaction.status === "WAITING_CONFIRMATION" && (
                        <>
                          <button
                            onClick={() =>
                              handleTransactionAction(transaction.id, "approve")
                            }
                            className="p-2 rounded-lg"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4 text-mint" />
                          </button>
                          <button
                            onClick={() =>
                              handleTransactionAction(transaction.id, "reject")
                            }
                            className="p-2 rounded-lg"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4 text-rose" />
                          </button>
                        </>
                      )}
                      {transaction.paymentProof && (
                        <button
                          onClick={() =>
                            window.open(transaction.paymentProof as string, "_blank")
                          }
                          className="p-2 rounded-lg"
                          title="View Payment Proof"
                        >
                          <Eye className="w-4 h-4 text-sky" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-6">
              No transactions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
