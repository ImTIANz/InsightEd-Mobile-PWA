import React, { useState } from 'react';
import logo from './assets/InsightEd1.png'; 
import { auth, googleProvider, db } from './firebase';
// 👇 IMPORT NEW PERSISTENCE TOOLS
import { 
    signInWithEmailAndPassword, 
    signInWithPopup,
    setPersistence,             // 👈 IMPORT THIS
    browserLocalPersistence     // 👈 IMPORT THIS
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Helper: Determine where to go based on role
    const getDashboardPath = (role) => {
        const roleMap = {
            'Engineer': '/engineer-dashboard',
            'School Head': '/schoolhead-dashboard',
            'Human Resource': '/hr-dashboard',
            'Admin': '/admin-dashboard',
        };
        return roleMap[role] || '/';
    };

    // Helper: Check Role and Redirect
    const checkUserRole = async (uid) => {
        try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const role = userData.role;
                const path = getDashboardPath(role);
                navigate(path);
            } else {
                alert("User profile not found.");
            }
        } catch (error) {
            console.error("Role Check Error:", error);
            alert("Failed to retrieve user role.");
        } finally {
            setLoading(false);
        }
    };

    // --- MAIN LOGIN FUNCTION ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 👇 1. FORCE THE APP TO REMEMBER YOU
            // This writes the login token to the phone's internal storage
            await setPersistence(auth, browserLocalPersistence);

            // 2. NOW LOGIN
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // 3. CHECK ROLE & REDIRECT
            await checkUserRole(userCredential.user.uid);
            
        } catch (error) {
            console.error(error);
            alert("Login Failed: " + error.message);
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            // 👇 ALSO SET PERSISTENCE FOR GOOGLE
            await setPersistence(auth, browserLocalPersistence);
            
            const result = await signInWithPopup(auth, googleProvider);
            // Check if user exists in DB, otherwise might need registration logic
            // For now, we just check the role assuming they exist
            await checkUserRole(result.user.uid);
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="logo-container">
                    <img src={logo} alt="InsightEd Logo" className="logo" />
                </div>
                <h2>InsightEd</h2>
                <p>School Data Capture Tool</p>

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="juandelacruz@deped.gov.ph" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'LOGIN'}
                    </button>
                </form>

                <div className="divider">
                    <span>OR</span>
                </div>

                <button onClick={handleGoogleLogin} className="google-login-btn">
                    <svg className="google-icon" width="18" height="18" viewBox="0 0 18 18">
                        <path d="M17.64 9.2c0-.637-.057-1.252-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.815H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                        <path d="M3.964 10.606A5.41 5.41 0 0 1 3.682 9c0-.566.098-1.117.282-1.606V5.062H.957a9.006 9.006 0 0 0 0 7.915l3.007-2.371z" fill="#FBBC05"/>
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .96 4.962l3.008 2.392C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                </button>
                
                <div className="login-footer">
                    Don't have an account? <Link to="/register" className="link-text">Register here</Link>
                </div>
            </div>

            {/* Waves Container */}
            <div className="waves-container">
                <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
                    <defs>
                        <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                    </defs>
                    <g className="parallax">
                        <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7" />
                        <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
                        <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
                        <use xlinkHref="#gentle-wave" x="48" y="7" fill="#fff" />
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default Login;