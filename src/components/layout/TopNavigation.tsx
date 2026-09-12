// src/components/layout/TopNavigation.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthModal from '../auth/AuthModal';

const TopNavigation: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      const userInfoStr = localStorage.getItem('user_info');

      if (token) {
        let parsedUser: any = {};
        if (userInfoStr && userInfoStr !== 'undefined') {
          try {
            const rawParsed = JSON.parse(userInfoStr);
            // Xử lý cả trường hợp object lồng nhau
            parsedUser = rawParsed.user ? rawParsed.user : rawParsed;
          } catch (error) {
            console.error('Lỗi parse JSON user:', error);
          }
        }

        const displayName = parsedUser.username || parsedUser.name || parsedUser.email?.split('@')[0] || 'Levid';
        
        setUser({
          ...parsedUser,
          username: displayName,
          avatarUrl: parsedUser.avatarUrl || `https://ui-avatars.com/api/?name=${displayName}&background=random`
        });
      } else {
        setUser(null);
      }
    };

    // Kiểm tra lúc component mount
    checkAuth();

    // Lắng nghe sự kiện để cập nhật Navbar khi đăng nhập từ nơi khác
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchTerm.trim()) {
        router.push(`/?search=${encodeURIComponent(searchTerm.trim())}`);
      } else {
        router.push('/');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    setUser(null);
    setShowUserMenu(false);
    router.push('/');
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-white sticky-top p-2" style={{ zIndex: 1040 }}>
        <div className="container-fluid align-items-center gap-2 gap-md-3">
          
          {/* Logo */}
          <Link href="/" className="navbar-brand text-danger p-0 m-0 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
            <i className="bi bi-pinterest fs-2"></i>
          </Link>

          {/* Các nút điều hướng */}
          <div className="d-none d-md-flex gap-2">
            <Link href="/" className="btn btn-dark rounded-pill fw-bold px-3 py-2">Trang chủ</Link>
            <Link href="/create" className="btn btn-light rounded-pill fw-bold px-3 py-2">Tạo</Link>
          </div>

          {/* Thanh tìm kiếm */}
          <div className="flex-grow-1 position-relative">
            <div className="input-group">
              <span className="input-group-text bg-light border-0 rounded-start-pill text-muted ps-3">
                <i className="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                className="form-control bg-light border-0 rounded-end-pill py-2 shadow-none" 
                placeholder="Tìm kiếm..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>

          {/* Cụm công cụ bên phải */}
          <div className="d-flex align-items-center gap-1 gap-md-2">
            {user ? (
              <>
                <button className="btn btn-light rounded-circle btn-icon d-none d-md-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                  <i className="bi bi-bell-fill text-muted fs-5"></i>
                </button>
                <button className="btn btn-light rounded-circle btn-icon d-none d-md-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                  <i className="bi bi-chat-dots-fill text-muted fs-5"></i>
                </button>
                
                {/* Menu thả xuống cho Avatar bằng React State */}
                <div className="position-relative ms-1 ms-md-2">
                  <button 
                    className="btn btn-light rounded-circle p-0 overflow-hidden d-flex align-items-center justify-content-center border-0" 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    style={{ width: '40px', height: '40px' }}
                  >
                    <img src={user.avatarUrl} alt="User Avatar" className="w-100 h-100 object-fit-cover" />
                  </button>
                  
                  {showUserMenu && (
                    <div className="position-absolute bg-white shadow-lg rounded-3 py-2 mt-2 border" style={{ right: 0, width: '200px', zIndex: 1050 }}>
                      <Link 
                        href="/profile" 
                        className="d-block px-3 py-2 text-dark text-decoration-none fw-medium hover-bg-light" 
                        onClick={() => setShowUserMenu(false)}
                      >
                        Hồ sơ cá nhân
                      </Link>
                      <hr className="my-1" />
                      <button 
                        onClick={handleLogout} 
                        className="btn btn-link text-danger text-decoration-none w-100 text-start px-3 py-2 fw-bold hover-bg-light"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button className="btn btn-danger rounded-pill fw-bold px-3 py-2" onClick={() => setShowAuthModal(true)}>Đăng nhập</button>
                <button className="btn btn-light rounded-pill fw-bold px-3 py-2 d-none d-md-inline-block" onClick={() => setShowAuthModal(true)}>Đăng ký</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Modal Đăng nhập/Đăng ký */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          onLoginSuccess={() => {
            setShowAuthModal(false);
            // Kích hoạt event để Navbar tự động load lại Avatar mà không cần F5
            window.dispatchEvent(new Event('storage')); 
          }} 
        />
      )}
    </>
  );
};

export default TopNavigation;