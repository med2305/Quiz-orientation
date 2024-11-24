'use client';
import { useEffect, useRef } from 'react';
import { VisualDescriptor, VisualLayout } from 'powerbi-visuals-api';

export default function PowerBIEmbed({ reportId, accessToken }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !reportId || !accessToken) return;

    const initializeReport = async () => {
      try {
        const layout = new VisualLayout({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });

        const visual = new VisualDescriptor({
          id: reportId,
          layout: layout,
          accessToken: accessToken,
        });

        await visual.init(containerRef.current);
        
        // Handle window resize
        const handleResize = () => {
          visual.updateSize({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
          });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      } catch (error) {
        console.error('Error initializing Power BI report:', error);
      }
    };

    initializeReport();
  }, [reportId, accessToken]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[600px] bg-gray-50 rounded-lg"
    />
  );
}
