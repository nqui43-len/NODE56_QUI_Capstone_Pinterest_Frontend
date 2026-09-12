// src/app/create/page.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pinService } from '@/services/pinService';

export default function CreatePinPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState({
    username: 'Người dùng',
    avatarUrl: 'https://ui-avatars.com/api/?name=User&background=random'
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', link: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Vui lòng đăng nhập để tạo Pin!');
      router.push('/');
      return;
    }

    const userInfoStr = localStorage.getItem('user_info');
    if (userInfoStr && userInfoStr !== 'undefined') {
      try {
        const parsed = JSON.parse(userInfoStr);
        if (parsed) {
          const displayName = parsed.username || parsed.email?.split('@')[0] || 'User';
          setUser({
            username: displayName,
            avatarUrl: parsed.avatarUrl || `https://ui-avatars.com/api/?name=${displayName}&background=random`
          });
        }
      } catch (error) {
        console.error('Lỗi đọc thông tin user:', error);
      }
    }
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!file) {
      alert('Vui lòng chọn một hình ảnh!');
      return;
    }
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề!');
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('title', formData.title);
      data.append('description', formData.description);

      await pinService.createPin(data);
      alert('Tạo Pin thành công!');
      router.push('/'); 
    } catch (error) {
      console.error('Lỗi khi upload:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: '1000px' }}>
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button onClick={() => router.back()} className="btn btn-light rounded-circle" style={{ width: '48px', height: '48px' }}>
            <i className="bi bi-arrow-left fs-4"></i>
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="btn btn-danger rounded-pill fw-bold px-4 py-2"
          >
            {isLoading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>

        <div className="row g-5">
          {/* Cột trái */}
          <div className="col-md-5">
            <div 
              className="bg-light rounded-4 d-flex flex-column align-items-center justify-content-center p-4 position-relative overflow-hidden cursor-pointer"
              style={{ minHeight: '400px', border: '2px dashed #ccc', cursor: 'pointer' }}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-100 h-100 object-fit-cover position-absolute top-0 start-0" />
              ) : (
                <div className="text-center text-muted">
                  <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '32px', height: '32px' }}>
                    <i className="bi bi-arrow-up"></i>
                  </div>
                  <p className="mb-1 fw-medium">Nhấp để tải lên</p>
                  <small style={{ fontSize: '12px' }}>Bạn nên sử dụng tập tin .jpg chất lượng cao dưới 20MB</small>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          {/* Cột phải */}
          <div className="col-md-7 d-flex flex-column gap-4">
            <input 
              type="text" 
              name="title"
              className="form-control border-0 border-bottom border-2 fs-2 fw-bold px-0 shadow-none rounded-0" 
              placeholder="Thêm tiêu đề"
              value={formData.title}
              onChange={handleChange}
              style={{ paddingBottom: '10px' }}
            />

            <div className="d-flex align-items-center gap-3 mt-2">
              <img 
                src={user.avatarUrl} 
                alt="avatar" 
                className="rounded-circle object-fit-cover shadow-sm" 
                style={{ width: '48px', height: '48px' }} 
              />
              <span className="fw-bold">{user.username}</span>
            </div>

            <textarea 
              name="description"
              className="form-control border-0 border-bottom border-2 px-0 shadow-none rounded-0" 
              placeholder="Cho mọi người biết Ghim của bạn giới thiệu điều gì"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              style={{ resize: 'none' }}
            />

            <input 
              type="text" 
              name="link"
              className="form-control border-0 border-bottom border-2 px-0 shadow-none rounded-0 mt-auto" 
              placeholder="Thêm một liên kết đến"
              value={formData.link}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}