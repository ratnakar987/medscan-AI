import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name });
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        phone: phone,
        age: parseInt(age),
        gender: gender,
        createdAt: serverTimestamp(),
      });

      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pt-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary">Create Account</h2>
        <p className="text-slate-500 mt-2">Start managing your health today</p>
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Full Name"
            className="input-field pl-12"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="email"
            placeholder="Email Address"
            className="input-field pl-12"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="password"
            placeholder="Password"
            className="input-field pl-12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="number"
              placeholder="Age"
              className="input-field"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <select
              className="input-field appearance-none"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <input
            type="tel"
            placeholder="Phone Number (e.g. +1234567890)"
            className="input-field"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button disabled={loading} className="btn-primary flex items-center justify-center gap-2 py-4">
          {loading ? 'Creating account...' : <><UserPlus size={20} /> Register</>}
        </button>
      </form>

      <p className="text-center text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
      </p>
    </div>
  );
};

export default Register;
