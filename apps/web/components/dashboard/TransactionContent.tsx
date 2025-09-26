import { CheckCircle, Eye, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../lib/axios";

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
        const eventsRes = await api.get("/events/organizer/my-events");
        const events = eventsRes.data.events;

        let allTransactions: Transaction[] = [];

        // 2. For each event, fetch its transactions
        for (const event of events) {
          const txRes = await api.get(`/transactions?eventId=${event.id}`);
          const txs = txRes.data;

          const mappedTxs: Transaction[] = txs.map((t: any) => ({
            id: t.id,
            eventName: t.event.name,
            customerName: t.user.name,
            email: t.user.email,
            ticketCount: t.ticketCount,
            totalAmount: t.totalAmount,
            status: t.status,
            paymentProof: t.paymentProof,
            createdAt: t.createdAt,
            expiresAt: t.expiresAt,
          }));

          allTransactions = [...allTransactions, ...mappedTxs];
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
      if (action === "approve") {
        await api.put(`/transactions/${transactionId}/accept`);
      } else {
        await api.put(`/transactions/${transactionId}/reject`);
      }
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
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b hairline text-left">
                <th className="pb-3 text-sm font-medium ">Customer</th>
                <th className="pb-3 text-sm font-medium ">Event</th>
                <th className="pb-3 text-sm font-medium ">Amount</th>
                <th className="pb-3 text-sm font-medium ">Status</th>
                <th className="pb-3 text-sm font-medium ">Date</th>
                <th className="pb-3 text-sm font-medium ">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-mint-tint transition-colors"
                >
                  <td className="py-4">
                    <div>
                      <div className="font-medium">
                        {transaction.customerName}
                      </div>
                      <div className="text-sm ">{transaction.email}</div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="font-medium">{transaction.eventName}</div>
                    <div className="text-sm ">
                      {transaction.ticketCount} tickets
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="font-medium">
                      IDR {transaction.totalAmount.toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4">
                    <span
                      className={`chip ${getTransactionStatusColor(
                        transaction.status
                      )}`}
                    >
                      {transaction.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-4 text-sm ">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                    {/* {transaction.expiresAt && (
                      <div className="text-xs text-rose">
                        Expires:{" "}
                        {new Date(transaction.expiresAt).toLocaleString()}
                      </div>
                    )} */}
                  </td>
                  <td className="py-4">
                    <div className="flex gap-1">
                      {transaction.status === "WAITING_CONFIRMATION" && (
                        <>
                          <button
                            onClick={() =>
                              handleTransactionAction(transaction.id, "approve")
                            }
                            className="p-2 hover:bg-mint-tint rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4 text-mint" />
                          </button>
                          <button
                            onClick={() =>
                              handleTransactionAction(transaction.id, "reject")
                            }
                            className="p-2 hover:bg-rose-tint rounded-lg transition-colors"
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
                          className="p-2 hover:bg-sky-tint rounded-lg transition-colors"
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
