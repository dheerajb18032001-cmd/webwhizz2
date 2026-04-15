import { useState } from 'react';
import './Form.css';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export default function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [savePassword, setSavePassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login:', { email, password, savePassword });
  };

  return (
    <div className="form-card login-card">
      <div className="form-header">
        <h1>Login Account</h1>
        <p>Lorem ipsum dolor sit amet, consectetuer adipiscing sed diam nonummy nibh euismod tincidunt.</p>
      </div>

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <span className="input-icon">✉</span>
        </div>

        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className="input-icon">🔒</span>
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={savePassword}
              onChange={(e) => setSavePassword(e.target.checked)}
            />
            Save Password
          </label>
          <a href="#" className="forgot-password">Forgot Password</a>
        </div>

        <button type="submit" className="btn btn-primary">Login Account</button>
      </form>

      <div className="divider">Or, Login with</div>

      <div className="social-buttons">
        <button className="btn btn-social btn-abc">Login with ABC</button>
        <button className="btn btn-social btn-xyz">Login with XYZ</button>
      </div>

      <div className="form-footer">
        <p>Don't have an account?</p>
        <button type="button" className="btn btn-outline" onClick={onSwitchToSignup}>
          Create Account
        </button>
      </div>
    </div>
  );
}
