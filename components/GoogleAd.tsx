import React, { useEffect, useRef } from 'react';

interface GoogleAdProps {
  className?: string;
  client?: string;
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  layoutKey?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const GoogleAd: React.FC<GoogleAdProps> = ({ 
  className = "", 
  client = "ca-pub-9524469096599112", // Updated default ID
  slot = "0000000000", 
  format = "auto",
  layoutKey,
  style = { display: 'block' }
}) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      const pushAd = () => {
        if (typeof window !== 'undefined') {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      };
      
      // Small timeout to ensure DOM is ready
      const timer = setTimeout(pushAd, 100);
      return () => clearTimeout(timer);
    } catch (e) {
      console.error("AdSense failed to load", e);
    }
  }, []);

  return (
    <div className={`relative overflow-hidden bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center p-4 transition-all ${className}`}>
       <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/80 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-slate-300 border border-slate-100 z-10">
         Advertisement
       </div>
       
       <div className="w-full h-full flex items-center justify-center min-h-[100px]">
         {/* Actual AdSlot */}
         <ins className="adsbygoogle w-full"
            ref={adRef}
            style={style}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format={format}
            data-ad-layout-key={layoutKey}
            data-full-width-responsive="true">
         </ins>

         {/* Visual Placeholder (Visible if ad fails or script missing) */}
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 -z-1">
            <div className="text-slate-400 font-mono text-xs">
              Google Ads <br/> {format.toUpperCase()}
            </div>
         </div>
       </div>
    </div>
  );
};

export default GoogleAd;