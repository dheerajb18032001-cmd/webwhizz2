import { useState } from 'react';
import './Form.css';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Signup:', { fullName, email, countryCode, phone, password, agreeTerms });
  };

  return (
    <div className="form-card signup-card">
      <div className="form-header">
        <h1>Create Account</h1>
        <p>Lorem ipsum dolor sit amet, consectetuer adipiscing sed diam nonummy nibh euismod tincidunt.</p>
      </div>

      <form onSubmit={handleSignup}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <span className="input-icon">👤</span>
        </div>

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

        <div className="form-group phone-group">
          <div className="country-select">
            <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+91">🇮🇳 +91</option>
              <option value="+86">🇨🇳 +86</option>
              <option value="+81">🇯🇵 +81</option>
              <option value="+33">🇫🇷 +33</option>
            </select>
          </div>
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <span className="input-icon">📞</span>
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

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            required
          />
          Agree with Terms & Conditions
        </label>

        <button type="submit" className="btn btn-primary" disabled={!agreeTerms}>
          Create Account
        </button>
      </form>

      <div className="divider">Or, Register with</div>

      <div className="social-buttons">
        <button className="btn btn-social btn-abc">ABC</button>
        <button className="btn btn-social btn-xyz">XYZ</button>
      </div>

      <div className="form-footer">
        <p>Already have an account?</p>
        <button type="button" className="btn btn-outline" onClick={onSwitchToLogin}>
          Back to Login
        </button>
      </div>
    </div>
  );
}
