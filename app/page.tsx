'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MasonryGrid, { PinData } from '@/components/pin/MasonryGrid';
import { pinService } from '@/services/pinService';

function HomeContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [pins, setPins] = useState<PinData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPins = async () => {
      setIsLoading(true); 
      try {
        const data = await pinService.getAllPins(searchQuery);
        setPins(data);
      } catch (error) {
        console.error('Lỗi khi tải danh sách Pin:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPins();
  }, [searchQuery]);

  return (
    <main className="container-fluid pt-4 px-3 px-md-4">
      {searchQuery && (
        <h4 className="mb-4">
          Kết quả tìm kiếm cho: <span className="text-danger">"{searchQuery}"</span>
        </h4>
      )}

      {isLoading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      ) : pins.length > 0 ? (
        <MasonryGrid pins={pins} />
      ) : (
        <div className="text-center text-muted py-5">
          <i className="bi bi-image fs-1 mb-3 d-block"></i>
          <h5>Không tìm thấy hình ảnh nào phù hợp</h5>
        </div>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Đang khởi tạo...</span>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}