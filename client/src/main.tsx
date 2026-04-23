import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/layout/styles.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router';
import { router } from './app/router/Routes.tsx';
import { StoreContext, store } from "./lib/stores/store.ts";


const queryClient =  new QueryClient();

createRoot(document.getElementById('root')!).render(
  // the strict mode will make the useEffect execute twice and this won't happen in the production
  // and it execute the useEffect for the second time to clean up the code and it will execute it for the 2nd time regardless there is a clean up code or not
  <StrictMode>
    {/* we will need to use our storecontext as a provider so the rest of our react application have access to it */}
    {/* since it uses context it has the .Provider */}
    <StoreContext.Provider value={store}>
      {/* now the app will have access to the client */}
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools/>
        <RouterProvider router={router}/>
      </QueryClientProvider>
    </StoreContext.Provider> 
  </StrictMode>,
)
