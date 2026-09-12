// src/app/pin/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pinService } from '@/services/pinService';

export default function PinDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pinId = Number(params.id);

  const [pin, setPin] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // State quản lý trạng thái chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '' });

  useEffect(() => {
    // 1. Đọc thông tin user để phân quyền
    const userInfoStr = localStorage.getItem('user_info');
    if (userInfoStr && userInfoStr !== 'undefined') {
      try {
        setUser(JSON.parse(userInfoStr));
      } catch (error) {
        console.error('Lỗi parse user:', error);
      }
    }

    // 2. Tải dữ liệu ảnh từ backend
    const fetchPin = async () => {
      try {
        const data = await pinService.getPinById(pinId);
        setPin(data);
        setEditData({ title: data.title, description: data.description || '' });
      } catch (error) {
        console.error('Lỗi tải chi tiết ảnh:', error);
        alert('Không tìm thấy hình ảnh!');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    if (pinId) fetchPin();
  }, [pinId, router]);

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa hình ảnh này không?')) return;
    
    try {
      await pinService.deletePin(pinId);
      alert('Xóa thành công!');
      router.push('/');
    } catch (error) {
      console.error('Lỗi xóa ảnh:', error);
      alert('Không thể xóa ảnh lúc này.');
    }
  };

  const handleUpdate = async () => {
    if (!editData.title.trim()) return alert('Tiêu đề không được để trống');
    
    try {
      await pinService.updatePin(pinId, editData);
      setPin({ ...pin, title: editData.title, description: editData.description });
      setIsEditing(false);
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      alert('Không thể cập nhật ảnh.');
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

  if (!pin) return null;

  // So sánh ID để cấp quyền hiển thị nút Xóa/Sửa
  if (!pin) return null;

  // 1. Thử lấy ID từ user_info trước
  let currentUserId = user?.id || user?.userId;

  // 2. Nếu không có, tự động giải mã JWT Token để lấy chính xác ID
  if (!currentUserId) {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // NestJS thường lưu ID trong 'sub' hoặc 'userId'
        currentUserId = payload.userId || payload.sub || payload.id; 
      } catch (error) {
        console.error('Không thể giải mã Token:', error);
      }
    }
  }

  // 3. So sánh an toàn
  const isOwner = Boolean(
    currentUserId && 
    pin.authorId && 
    Number(currentUserId) === Number(pin.authorId)
  );

  return (
    <div className="container py-4 py-md-5" style={{ maxWidth: '1000px' }}>
      {/* Nút Quay lại */}
      <button onClick={() => router.back()} className="btn btn-light rounded-circle mb-4 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
        <i className="bi bi-arrow-left fs-4"></i>
      </button>

      <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
        <div className="row g-0">
          {/* Cột trái: Hình ảnh cỡ lớn */}
          <div className="col-md-6 bg-light d-flex align-items-center justify-content-center">
            <img 
              src={pin.imageUrl} 
              alt={pin.title} 
              className="img-fluid w-100 h-100 object-fit-cover" 
              style={{ maxHeight: '80vh' }} 
            />
          </div>

          {/* Cột phải: Thông tin & Thao tác */}
          <div className="col-md-6 p-4 p-md-5 d-flex flex-column">
            
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex gap-2">
                {/* Các nút công cụ chỉ hiện nếu là chủ sở hữu ảnh */}
                {isOwner && !isEditing && (
                  <>
                    <button className="btn btn-light rounded-circle" onClick={() => setIsEditing(true)} title="Sửa bài">
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-light text-danger rounded-circle" onClick={handleDelete} title="Xóa bài">
                      <i className="bi bi-trash"></i>
                    </button>
                  </>
                )}
                {!isOwner && (
                  <button className="btn btn-light rounded-circle" title="Chia sẻ">
                    <i className="bi bi-upload"></i>
                  </button>
                )}
              </div>
              <button className="btn btn-danger rounded-pill fw-bold px-4 py-2">
                Lưu
              </button>
            </div>

            {/* Khu vực nội dung: Chuyển đổi linh hoạt giữa Xem và Sửa */}
            {isEditing ? (
              <div className="d-flex flex-column gap-3 mb-4">
                <input 
                  type="text" 
                  className="form-control fs-3 fw-bold border-0 border-bottom rounded-0 px-0 shadow-none" 
                  placeholder="Tiêu đề"
                  value={editData.title} 
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })} 
                />
                <textarea 
                  className="form-control border-0 border-bottom rounded-0 px-0 shadow-none" 
                  placeholder="Thêm mô tả..."
                  rows={3} 
                  value={editData.description} 
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })} 
                  style={{ resize: 'none' }}
                />
                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-secondary rounded-pill px-4 fw-bold" onClick={() => setIsEditing(false)}>Hủy</button>
                  <button className="btn btn-danger rounded-pill px-4 fw-bold" onClick={handleUpdate}>Cập nhật</button>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <h1 className="fw-bold mb-3">{pin.title}</h1>
                <p className="text-muted fs-5">{pin.description || 'Chưa có mô tả'}</p>
              </div>
            )}

            {/* Box Tác giả luôn nằm ở đáy */}
            <div className="d-flex align-items-center gap-3 mt-auto pt-4">
              <img 
                src={pin.author?.avatarUrl || 'https://ui-avatars.com/api/?name=User'} 
                alt="Author" 
                className="rounded-circle object-fit-cover shadow-sm" 
                style={{ width: '56px', height: '56px' }} 
              />
              <div>
                <h6 className="mb-0 fw-bold">{pin.author?.username || 'Người dùng ẩn danh'}</h6>
                <small className="text-muted">
                  Đã tải lên vào {new Date(pin.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                </small>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}