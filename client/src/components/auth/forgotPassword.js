import { useState } from "react";
import { useRouter } from "next/router";
import axios from 'axios';
import styles from './auth.module.css';

const ForgotPassword = () => {
    const router = useRouter();
    const {resetToken} = router.query;

    const [password,setPassword] = useState("");
    const [message,setMessage] = useState("");
    const [error ,setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(" ");
        setError("");

        try {
            const res =  await axios.post(`http://localhost:3000/auth/reset-password/${resetToken}`, { password });
            setMessage(res.data.message);
        } catch (err) {
            setError(error.response.data.error || "An error occurred, please try again.");
        }
    };
   
  return (
    <div className={styles.container}>
        <h2>Reset Password</h2>
<form onSubmit={handleSubmit} className={styles.form}>
    <input
        type="password"
        placeholder="Enter new Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
    />
    <button type="submit">Reset Password</button>
    </form>
    {message && <p className={styles.success}>{message}</p>}
    {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default ForgotPassword;