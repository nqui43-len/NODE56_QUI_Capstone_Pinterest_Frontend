// src/app/profile/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MasonryGrid, { PinData } from '@/components/pin/MasonryGrid';
import { pinService } from '@/services/pinService';
import { userService } from '@/services/userService';

export default function ProfilePage() {
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [createdPins, setCreatedPins] = useState<PinData[]>([]);
  const [savedPins, setSavedPins] = useState<PinData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'created' | 'saved'>('created');

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', avatarUrl: '' });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userInfoStr = localStorage.getItem('user');

    if (!token) {
      router.push('/');
      return;
    }

    // 1. Quét dữ liệu an toàn, xử lý cả trường hợp object lồng nhau
    let parsedUser: any = {};
    if (userInfoStr && userInfoStr !== 'undefined') {
      try {
        const rawParsed = JSON.parse(userInfoStr);
        parsedUser = rawParsed.user ? rawParsed.user : rawParsed; 
      } catch (error) {
        console.error('Lỗi parse JSON user:', error);
      }
    }

    // 2. Lấy ID từ Token để dự phòng
    let tokenUserId = null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      tokenUserId = payload.userId || payload.sub || payload.id;
    } catch (error) {
      console.error('Lỗi giải mã Token:', error);
    }

    const finalUserId = parsedUser.id || parsedUser.userId || tokenUserId;
    
    // 3. Tìm tên thật qua nhiều lớp, nếu vẫn rỗng thì mặc định là tên từ Email hoặc 'Levid'
    const displayName = parsedUser.username || parsedUser.name || parsedUser.email?.split('@')[0] || 'Levid';

    setUser({
      ...parsedUser,
      id: finalUserId,
      username: displayName,
      avatarUrl: parsedUser.avatarUrl || `https://ui-avatars.com/api/?name=${displayName}&background=random`
    });
    
    if (finalUserId) {
      fetchUserPins(finalUserId);
      fetchSavedPins(); // Gọi thêm hàm tải ảnh đã lưu
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const fetchUserPins = async (userId: number) => {
    try {
      const data = await pinService.getPinsByUser(userId);
      setCreatedPins(data);
    } catch (error) {
      console.error('Lỗi tải danh sách ảnh:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedPins = async () => {
    try {
      const data = await pinService.getSavedPins();
      setSavedPins(data);
    } catch (error) {
      console.error('Lỗi tải ảnh đã lưu:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm.username.trim()) return alert('Tên không được để trống!');
    
    setIsSaving(true);
    try {
      await userService.updateProfile(editForm);
      
      // Cập nhật State hiện tại để giao diện đổi ngay lập tức
      const updatedUser = { ...user, username: editForm.username, avatarUrl: editForm.avatarUrl };
      setUser(updatedUser);

      // Cập nhật localStorage để các trang khác (như Navbar) nhận diện được
      const userInfoStr = localStorage.getItem('user');
      if (userInfoStr) {
        let parsed = JSON.parse(userInfoStr);
        if (parsed.user) {
          parsed.user.username = editForm.username;
          parsed.user.avatarUrl = editForm.avatarUrl;
        } else {
          parsed.username = editForm.username;
          parsed.avatarUrl = editForm.avatarUrl;
        }
        localStorage.setItem('user', JSON.stringify(parsed));
      }

      // Đánh tín hiệu để TopNavigation tự reload lại Avatar ở góc phải
      window.dispatchEvent(new Event('storage'));
      setIsEditing(false);
      alert('Cập nhật hồ sơ thành công!');
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      alert('Có lỗi xảy ra, không thể cập nhật.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container-fluid pt-5 px-3 px-md-4 pb-5 position-relative">
        {isEditing && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
          <div className="bg-white p-4 rounded-4 shadow-lg w-100 mx-3" style={{ maxWidth: '450px' }}>
            <h4 className="fw-bold mb-4 text-center">Chỉnh sửa hồ sơ</h4>
            
            <div className="mb-3">
              <label className="form-label fw-medium">Tên hiển thị</label>
              <input 
                type="text" 
                className="form-control rounded-3 py-2" 
                value={editForm.username} 
                onChange={(e) => setEditForm({...editForm, username: e.target.value})} 
              />
            </div>
            
            <div className="mb-4">
              <label className="form-label fw-medium">Link Ảnh đại diện (URL)</label>
              <input 
                type="text" 
                className="form-control rounded-3 py-2" 
                placeholder="https://..."
                value={editForm.avatarUrl} 
                onChange={(e) => setEditForm({...editForm, avatarUrl: e.target.value})} 
              />
            </div>
            
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button 
                className="btn btn-light rounded-pill fw-bold px-4" 
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Hủy
              </button>
              <button 
                className="btn btn-danger rounded-pill fw-bold px-4" 
                onClick={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header Hồ sơ */}
      <div className="d-flex flex-column align-items-center text-center mb-5">
        <img 
          src={user.avatarUrl} 
          alt={user.username} 
          className="rounded-circle object-fit-cover shadow-sm mb-3" 
          style={{ width: '120px', height: '120px' }} 
        />
        <h1 className="fw-bold mb-1">{user.username}</h1>
        <p className="text-muted mb-3">{user.email || ''}</p>
        
        <div className="d-flex gap-2">
          <button className="btn btn-light rounded-pill fw-bold px-4 py-2">Chia sẻ</button>
          <button 
            className="btn btn-light rounded-pill fw-bold px-4 py-2"
            onClick={() => {
              setEditForm({ username: user.username, avatarUrl: user.avatarUrl });
              setIsEditing(true);
            }}
          >
            Chỉnh sửa hồ sơ
          </button>
        </div>
      </div>

      {/* Tabs Điều hướng */}
      <div className="d-flex justify-content-center gap-4 mb-4">
        <button 
          className={`btn fw-bold px-3 py-2 border-0 ${activeTab === 'created' ? 'border-bottom border-dark border-3 rounded-0 text-dark' : 'text-muted'}`}
          onClick={() => setActiveTab('created')}
          style={{ boxShadow: 'none' }}
        >
          Đã tạo
        </button>
        <button 
          className={`btn fw-bold px-3 py-2 border-0 ${activeTab === 'saved' ? 'border-bottom border-dark border-3 rounded-0 text-dark' : 'text-muted'}`}
          onClick={() => setActiveTab('saved')}
          style={{ boxShadow: 'none' }}
        >
          Đã lưu
        </button>
      </div>

      {/* Nội dung Tab */}
      <div className="mt-4">
        {activeTab === 'created' ? (
          createdPins.length > 0 ? (
            <MasonryGrid pins={createdPins} />
          ) : (
            <div className="text-center text-muted py-5 mt-4">
              <i className="bi bi-camera fs-1 mb-3 d-block"></i>
              <h5>Chưa có Ghim nào được tạo</h5>
              <p>Chưa có gì để hiển thị! Những Ghim bạn tạo sẽ xuất hiện ở đây.</p>
              <button onClick={() => router.push('/create')} className="btn btn-danger rounded-pill fw-bold mt-2">
                Tạo Ghim
              </button>
            </div>
          )
        ) : (
          savedPins.length > 0 ? (
            <MasonryGrid pins={savedPins} />
          ) : (
            <div className="text-center text-muted py-5 mt-4">
              <i className="bi bi-bookmark fs-1 mb-3 d-block"></i>
              <h5>Bạn chưa lưu Ghim nào</h5>
              <p>Khám phá và lưu những ý tưởng bạn yêu thích.</p>
              <button onClick={() => router.push('/')} className="btn btn-danger rounded-pill fw-bold mt-2">
                Khám phá ngay
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}