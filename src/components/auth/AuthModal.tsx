// src/components/auth/AuthModal.tsx
'use client';

import React, { useState } from 'react';
import { authService } from '@/services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        const res = await authService.login({ email, password });
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('user', JSON.stringify(res.user));
        onLoginSuccess();
        onClose();
      } else {
        await authService.register({ email, password, username });
        setError('Đăng ký thành công! Vui lòng đăng nhập.');
        setIsLogin(true); // Tự động chuyển sang form đăng nhập
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
      <div className="bg-white p-5 rounded-4 position-relative shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
        {/* Nút đóng */}
        <button 
          onClick={onClose} 
          className="btn border-0 position-absolute top-0 end-0 m-3 fs-5"
        >
          <i className="bi bi-x-lg"></i>
        </button>

        <h3 className="text-center fw-bold mb-4">Welcome to my picture</h3>

        {error && <div className={`alert ${error.includes('thành công') ? 'alert-success' : 'alert-danger'} py-2 text-center`}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-3">
              <label className="form-label text-muted small">Tên hiển thị</label>
              <input type="text" className="form-control rounded-4 py-2" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
          )}
          
          <div className="mb-3">
            <label className="form-label text-muted small">Email</label>
            <input type="email" className="form-control rounded-4 py-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="mb-4">
            <label className="form-label text-muted small">Mật khẩu</label>
            <input type="password" className="form-control rounded-4 py-2" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="btn btn-danger w-100 rounded-pill py-2 fw-bold">
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </form>

        <div className="text-center mt-3">
          <button className="btn btn-link text-dark text-decoration-none small fw-bold" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;