import { useState } from 'react';
import './AuthPage.css';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

export default function AuthPage() {
  const [isLoginActive, setIsLoginActive] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {isLoginActive ? (
          <LoginForm onSwitchToSignup={() => setIsLoginActive(false)} />
        ) : (
          <SignupForm onSwitchToLogin={() => setIsLoginActive(true)} />
        )}
      </div>
    </div>
  );
}
