import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Intelligent route scroll manager for React Router v6.
 *
 * Rules:
 * 1. For PUSH / REPLACE navigation (normal route transition or link click):
 *    - Scrolls to top-left (0, 0) immediately.
 *    - Resets any horizontal scroll on body / html.
 * 2. For POP navigation (browser Back / Forward):
 *    - Restores the exact scroll position previously recorded for that history key.
 * 3. Does not fire repeatedly on internal component re-renders.
 */
const ScrollToTop = () => {
  const location = useLocation();
  const navType = useNavigationType();
  const scrollPositions = useRef(new Map());

  // Record scroll position before navigating away
  useEffect(() => {
    const handleScroll = () => {
      if (location.key) {
        scrollPositions.current.set(location.key, {
          x: window.scrollX || document.documentElement.scrollLeft || 0,
          y: window.scrollY || document.documentElement.scrollTop || 0,
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.key]);

  // Handle route change scroll restoration / reset
  useEffect(() => {
    // Check if user is navigating back/forward (POP)
    if (navType === 'POP' && location.key && scrollPositions.current.has(location.key)) {
      const savedPos = scrollPositions.current.get(location.key);
      window.scrollTo({
        left: savedPos.x || 0,
        top: savedPos.y || 0,
        behavior: 'instant',
      });
      return;
    }

    // Normal forward navigation (PUSH or REPLACE)
    window.scrollTo({
      left: 0,
      top: 0,
      behavior: 'instant',
    });

    // Ensure document and body horizontal scroll are strictly reset
    if (document.documentElement) {
      document.documentElement.scrollLeft = 0;
    }
    if (document.body) {
      document.body.scrollLeft = 0;
    }
  }, [location.pathname, location.search, navType, location.key]);

  return null;
};

export default ScrollToTop;
