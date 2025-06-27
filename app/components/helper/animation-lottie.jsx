// animation-lottie.jsx
'use client';

import dynamic from 'next/dynamic';

// The nuclear option - completely prevent SSR for this component
const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
    </div>
  )
});

function AnimationLottie({ animationPath, width = 300, height = 300, ...props }) {
  return (
    <div style={{ width, height }} className="flex items-center justify-center">
      <Lottie
        animationData={animationPath}
        style={{ width, height }}
        loop={true}
        autoplay={true}
        {...props}
      />
    </div>
  );
}

export default AnimationLottie;