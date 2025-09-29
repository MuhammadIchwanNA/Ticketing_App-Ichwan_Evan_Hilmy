import TransactionList from '@/components/booking/TransactionList';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function TransactionsPage() {
  return (
    <ProtectedRoute>
      <TransactionList />
    </ProtectedRoute>
  );
}