import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { UpdateDashboard } from './components/UpdateDashboard';

const queryClient = new QueryClient();

export function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <UpdateDashboard />
    </QueryClientProvider>
  );
}
