import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/layout/styles.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import App from './app/layout/App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient =  new QueryClient();

createRoot(document.getElementById('root')!).render(
  // the strict mode will make the useEffect execute twice and this won't happen in the production
  // and it execute the useEffect for the second time to clean up the code and it will execute it for the 2nd time regardless there is a clean up code or not
  <StrictMode>
    {/* now the app will have access to the client */}
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools/>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
