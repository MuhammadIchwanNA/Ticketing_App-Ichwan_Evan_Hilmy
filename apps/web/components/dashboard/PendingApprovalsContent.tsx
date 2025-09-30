import { CheckCircle, Eye, XCircle, Clock, User, Calendar, CreditCard, AlertTriangle } from "lucide-react";
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

export const PendingApprovalsContent: React.FC = () => {
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingTransactions();
  }, []);

  const fetchPendingTransactions = async () => {
    try {
      setLoading(true);
      // 1. Get organizer's events
      const eventsRes = await apiClient.get("/api/events/organizer/my-events");
      const events = eventsRes.events;

      let allPendingTransactions: Transaction[] = [];

      // 2. For each event, fetch its transactions and filter for pending ones
      for (const event of events) {
        try {
          const txRes = await apiClient.get(`/api/transactions?eventId=${event.id}`);
          const txs = Array.isArray(txRes) ? txRes : [];

        const mappedTxs: Transaction[] = txs
          .filter((t: any) => {
            // Only pending transactions with valid data
            return t.status === "WAITING_CONFIRMATION" && 
                   t.event && 
                   t.user && 
                   t.event.name && 
                   t.user.name;
          })
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

          allPendingTransactions = [...allPendingTransactions, ...mappedTxs];
        } catch (eventError) {
          console.error(`Error fetching transactions for event ${event.id}:`, eventError);
          // Continue with next event instead of failing completely
        }
      }

      // Sort by creation date (newest first)
      allPendingTransactions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPendingTransactions(allPendingTransactions);
    } catch (error) {
      console.error("Error fetching pending transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionAction = async (
    transactionId: string,
    action: "approve" | "reject",
    customerName?: string
  ) => {
    // Ask for confirmation
    const actionText = action === "approve" ? "approve" : "reject";
    const confirmMessage = `Are you sure you want to ${actionText} this transaction${customerName ? ` from ${customerName}` : ''}?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const actionData = { action: action === "approve" ? "confirm" : "reject" };
      await apiClient.put(`/api/transactions/${transactionId}/confirm`, actionData);
      
      // Remove from pending list after action
      setPendingTransactions((prev) =>
        prev.filter((t) => t.id !== transactionId)
      );

      // Show success message
      const message = action === "approve" 
        ? "✅ Transaction approved! Customer will be notified." 
        : "❌ Transaction rejected! Customer can retry payment.";
      alert(message);
      
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      alert(`Error ${action === "approve" ? "approving" : "rejecting"} transaction. Please try again.`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    const expireTime = new Date(expiresAt).getTime();
    const now = new Date().getTime();
    const hourInMs = 60 * 60 * 1000;
    return (expireTime - now) <= hourInMs; // Expires within 1 hour
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky"></div>
            <span className="ml-3 text-muted">Loading pending approvals...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-banana-tint rounded-lg">
              <Clock className="w-5 h-5 text-banana" />
            </div>
            <div>
              <p className="text-sm text-muted">Pending Approvals</p>
              <p className="text-xl font-bold">{pendingTransactions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-mint-tint rounded-lg">
              <CreditCard className="w-5 h-5 text-mint" />
            </div>
            <div>
              <p className="text-sm text-muted">Total Amount</p>
              <p className="text-xl font-bold">
                {formatCurrency(pendingTransactions.reduce((sum, t) => sum + t.totalAmount, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-tint rounded-lg">
              <AlertTriangle className="w-5 h-5 text-rose" />
            </div>
            <div>
              <p className="text-sm text-muted">Expiring Soon</p>
              <p className="text-xl font-bold">
                {pendingTransactions.filter(t => isExpiringSoon(t.expiresAt)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Transactions */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-banana" />
            Transactions Waiting for Approval
          </h3>
          {pendingTransactions.length > 0 && (
            <button
              onClick={fetchPendingTransactions}
              className="btn btn-ghost text-sm"
            >
              Refresh
            </button>
          )}
        </div>

        {pendingTransactions.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-mint mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">All Caught Up!</h4>
            <p className="text-muted">No pending transactions require your approval at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`border rounded-lg p-6 ${
                  isExpiringSoon(transaction.expiresAt) 
                    ? "border-rose bg-rose-tint" 
                    : "border-[var(--line)] bg-white"
                }`}
              >
                <div className="grid md:grid-cols-12 gap-4 items-center">
                  {/* Customer Info */}
                  <div className="md:col-span-3">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-muted" />
                      <span className="font-medium">{transaction.customerName}</span>
                    </div>
                    <p className="text-sm text-muted">{transaction.email}</p>
                  </div>

                  {/* Event Info */}
                  <div className="md:col-span-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-muted" />
                      <span className="font-medium">{transaction.eventName}</span>
                    </div>
                    <p className="text-sm text-muted">{transaction.ticketCount} tickets</p>
                  </div>

                  {/* Amount & Date */}
                  <div className="md:col-span-3">
                    <div className="mb-1">
                      <span className="font-bold text-lg">
                        {formatCurrency(transaction.totalAmount)}
                      </span>
                    </div>
                    <p className="text-sm text-muted">
                      {formatDate(transaction.createdAt)}
                    </p>
                    {isExpiringSoon(transaction.expiresAt) && (
                      <div className="flex items-center gap-1 text-rose text-xs mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        Expires soon!
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-3 flex justify-end gap-2">
                    {transaction.paymentProof && (
                      <button
                        onClick={() => window.open(transaction.paymentProof as string, "_blank")}
                        className="btn btn-ghost text-sm"
                        title="View Payment Proof"
                      >
                        <Eye className="w-4 h-4" />
                        View Proof
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleTransactionAction(transaction.id, "reject", transaction.customerName)}
                      className="btn btn-ghost text-rose hover:bg-rose-tint text-sm"
                      title="Reject Transaction"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    
                    <button
                      onClick={() => handleTransactionAction(transaction.id, "approve", transaction.customerName)}
                      className="btn btn-primary text-sm"
                      title="Approve Transaction"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {pendingTransactions.length > 0 && (
        <div className="card p-6">
          <h4 className="font-semibold mb-4">Quick Actions</h4>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => {
                if (confirm(`Are you sure you want to approve all ${pendingTransactions.length} pending transactions?`)) {
                  pendingTransactions.forEach(t => handleTransactionAction(t.id, "approve"));
                }
              }}
              className="btn btn-primary text-sm"
              disabled={pendingTransactions.length === 0}
            >
              <CheckCircle className="w-4 h-4" />
              Approve All ({pendingTransactions.length})
            </button>
            
            <button 
              onClick={() => {
                const expiring = pendingTransactions.filter(t => isExpiringSoon(t.expiresAt));
                if (expiring.length > 0 && confirm(`Approve ${expiring.length} transactions expiring soon?`)) {
                  expiring.forEach(t => handleTransactionAction(t.id, "approve"));
                }
              }}
              className="btn btn-ghost text-sm"
              disabled={pendingTransactions.filter(t => isExpiringSoon(t.expiresAt)).length === 0}
            >
              <AlertTriangle className="w-4 h-4" />
              Approve Expiring Soon
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-sky-tint rounded-lg">
            <p className="text-sm text-muted">
              💡 <strong>Tip:</strong> Review payment proofs before approving transactions. 
              Rejected transactions will notify users to retry their payment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
