import { MetaProvider, Title } from '@solidjs/meta';
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';

import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';

import '@phosphor-icons/web/fill/style.css';
import '@phosphor-icons/web/regular/style.css';
import '@phosphor-icons/web/bold/style.css';

import './app.css';

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>App</Title>
          <Suspense>{props.children}</Suspense>
        </MetaProvider>
      )}>
      <FileRoutes />
    </Router>
  );
}
