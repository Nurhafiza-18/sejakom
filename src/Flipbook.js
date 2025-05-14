import React, { useRef, useState, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';

const Page = React.forwardRef(({ children }, ref) => (
  <div
    ref={ref}
    className="page"
    style={{
      width: '100%',
      height: '100%',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
      borderRadius: '0'
    }}
  >
    {children}
  </div>
));

const Flipbook = () => {
  const bookRef = useRef(null);
  const totalPages = 33;
  const pages = Array.from({ length: totalPages }, (_, i) => `/komik/${i + 1}.png`);
  
  // State for current page and loading status
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(true);
  
  // Determine if desktop or mobile
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 900);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Handle window resize to recalculate book dimensions
  useEffect(() => {
    const handleResize = () => {
      // Force a re-render when window is resized
      setIsDesktop(window.innerWidth > 900);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Responsively set book dimensions - increased for better visibility
  const bookWidth = isDesktop ? 900 : 400;
  const bookHeight = isDesktop ? 1200 : 600;
  
  // Handle page turn
  const handlePageFlip = (e) => {
    setCurrentPage(e.data);
  };
  
  // Handle loading completion
  useEffect(() => {
    const loadImages = async () => {
      try {
        // Preload at least the first few images
        const preloadCount = Math.min(5, totalPages);
        const imagePromises = Array.from({ length: preloadCount }, (_, i) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = pages[i];
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Continue even if an image fails
          });
        });
        
        await Promise.all(imagePromises);
        setIsLoading(false);
      } catch (error) {
        console.error("Error preloading images:", error);
        setIsLoading(false);
      }
    };
    
    loadImages();
  }, []);
  
  // Navigation functions
  const prevPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
    }
  };
  
  const nextPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }
  };
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '92vh',
        width: '100%',
        background: '#f4f4f4',
        padding: '0'
      }}
    >
      {isLoading ? (
        <div style={{ textAlign: 'center' }}>
          <div 
            style={{ 
              width: '50px', 
              height: '50px', 
              border: '5px solid #f3f3f3',
              borderTop: '5px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }} 
          />
          <p>Loading comic...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : (
        <>
          <HTMLFlipBook
            width={bookWidth}
            height={bookHeight}
            size="stretch"
            minWidth={300}
            maxWidth={2000}
            minHeight={400}
            maxHeight={2000}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            ref={bookRef}
            onFlip={handlePageFlip}
            className="flip-book"
          >
            {pages.map((src, index) => (
              <Page key={index}>
                <img
                  src={src}
                  alt={`Page ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                  loading={index < 5 ? "eager" : "lazy"}
                />
              </Page>
            ))}
          </HTMLFlipBook>
          
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '20px', 
              marginTop: '10px' 
            }}
          >
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              style={{
                padding: '8px 16px',
                background: currentPage === 0 ? '#cccccc' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: currentPage === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            
            <span style={{ alignSelf: 'center' }}>
              Page {currentPage + 1} of {totalPages}
            </span>
            
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              style={{
                padding: '8px 16px',
                background: currentPage === totalPages - 1 ? '#cccccc' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
          
          {/* Keyboard instructions */}
          <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
            Tip: You can also use ← and → arrow keys to navigate
          </div>
        </>
      )}
    </div>
  );
};

// Add keyboard navigation
const FlipbookWithKeyboardNav = () => {
  const rootRef = useRef(null);
  const flipbookRef = useRef(null);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (flipbookRef.current?.bookRef?.current) {
        if (e.key === 'ArrowLeft') {
          flipbookRef.current.bookRef.current.pageFlip().flipPrev();
        } else if (e.key === 'ArrowRight') {
          flipbookRef.current.bookRef.current.pageFlip().flipNext();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  return (
    <div ref={rootRef} style={{ width: '100%' }}>
      <Flipbook ref={flipbookRef} />
    </div>
  );
};

export default FlipbookWithKeyboardNav;