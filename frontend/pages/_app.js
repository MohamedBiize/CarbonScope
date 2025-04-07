import { AuthProvider, AuthStyles } from '../components/auth/AuthContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <AuthStyles />
    </AuthProvider>
  );
}

export default MyApp;
