import React from 'react';
import Link from 'next/link';
import styles from '../../styles/masonry.module.scss';
import { PinData } from './MasonryGrid';
import { useRouter } from 'next/navigation';
import { pinService } from '@/services/pinService';

interface PinCardProps {
  pin: PinData;
}

const PinCard: React.FC<PinCardProps> = ({ pin }) => {
  const router = useRouter();
  const handleGoToDetail = () => {
    router.push(`/pin/${pin.id}`);
  };

  const handleSavePin = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    try {
      const result: any = await pinService.toggleSavePin(pin.id);
      alert(result.message);
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert('Vui lòng đăng nhập để lưu ảnh!');
      } else {
        alert('Có lỗi xảy ra, không thể lưu ảnh.');
      }
    }
  };

  return (
    <div 
      className="mb-4 position-relative pin-card" 
      style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }} 
    >
      <div 
        className="rounded-4 overflow-hidden position-relative bg-light cursor-pointer" 
        style={{ cursor: 'zoom-in' }}
        onClick={handleGoToDetail}
      >
        <img src={pin.imageUrl} alt={pin.title} className="w-100 h-auto object-fit-cover" />
        
        <div className="pin-overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-between p-3">
          
          <div className="d-flex justify-content-end">
            <button 
              className="btn btn-danger rounded-pill fw-bold px-3 py-2 text-white"
              onClick={handleSavePin}
            >
              Lưu
            </button>
          </div>
          
          <div className="d-flex justify-content-between">
            <div className="d-flex gap-2">
              <button 
                className="btn btn-light rounded-circle btn-icon shadow-sm d-flex align-items-center justify-content-center p-0" 
                style={{ width: '32px', height: '32px' }}
                onClick={(e) => { e.stopPropagation(); alert('Tính năng chia sẻ'); }}
              >
                <i className="bi bi-upload fs-6"></i>
              </button>
            </div>
            
            <button 
              className="btn btn-light rounded-circle btn-icon shadow-sm d-flex align-items-center justify-content-center p-0" 
              style={{ width: '32px', height: '32px' }}
              onClick={(e) => { e.stopPropagation(); alert('Tính năng mở rộng'); }}
            >
              <i className="bi bi-three-dots fs-6"></i>
            </button>
          </div>

        </div>
      </div>
      
      <h6 className={`mt-2 mb-0 px-2 fw-bold ${styles.textClamp2}`}>{pin.title}</h6>
    </div>
  );
};

export default PinCard;