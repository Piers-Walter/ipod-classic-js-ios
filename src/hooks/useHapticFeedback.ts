import { useCallback, useMemo } from "react";

const canUseHaptics = typeof navigator !== 'undefined' && 'vibrate' in navigator;

declare let window: any;

const useHapticFeedback = () => {
  const triggerHaptics = useCallback((pattern: number | number[]) => {
    if(window.TapticEngine){
      window.TapticEngine.selection();
    }
    if (!canUseHaptics) {
      return;
    }
    navigator.vibrate(pattern);
  }, []);

  const hooks = useMemo(() => ({
    triggerHaptics
  }), [triggerHaptics]);

  return hooks;
}

export default useHapticFeedback;