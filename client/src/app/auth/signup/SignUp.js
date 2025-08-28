'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from '../../assets/css/auth.module.css';
import '../../assets/css/buttons.css'; 



const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const userData = { username, email, password };

    try {
      const response = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("You have been signed up successfully.", data);
        router.push("/auth/signin");
      } else {
        if (data.errors) {
          setError(data.errors.map((err) => err.msg).join(", "));
        } else if (data.error) {
          setError("User already registered.");
        } else {
          setError("Signing up failed. Please try again.");
        }
      }
    } catch (error) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = ( ) => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Sign Up</h2>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="username" className={styles.label}>Username</label>
          <input
            type="text"
            id="username"
            placeholder="Enter your username"
            className={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <div className={styles.passwordInputContainer}>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="Enter your password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
             type="button"
             className={styles.passwordToggle}
             onClick={togglePasswordVisibility}
             aria-label={showPassword ? "Show password" : "Hide password"}
             >
              {showPassword ? (
              // Eye with slash icon (password visible)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.0007 12C15.0007 13.6569 13.6576 15 12.0007 15C10.3439 15 9.00073 13.6569 9.00073 12C9.00073 10.3431 10.3439 9 12.0007 9C13.6576 9 15.0007 10.3431 15.0007 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94288 16.4788 5 12.0012 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            // Eye icon (password hidden)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7302 5.07319C11.1448 5.02485 11.5684 5 11.9999 5C16.6639 5 20.3998 7.90264 21.6997 12C21.3957 12.9217 20.8589 13.7533 20.1471 14.4196M6.52026 6.51944C4.47949 7.76406 2.90205 9.69259 2.30011 12C3.60002 16.0974 7.33588 19 12.0001 19C14.037 19 15.8979 18.446 17.4805 17.4804M9.87871 9.87859C9.33576 10.4215 9.00012 11.1715 9.00012 12C9.00012 13.6569 10.3433 15 12.0001 15C12.8286 15 13.5785 14.6644 14.1215 14.1214" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 4L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>

            )}
             </button>
        </div>
      </div>
        <button type="submit" className="button" disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
        <p className={styles.loginRedirect}>
            already have an account? <a href="/auth/signin">Signin</a>
        </p>
      </form>
    </div>
  );
};

export default SignUp;

