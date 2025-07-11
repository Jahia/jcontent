import { useEffect, useRef } from 'react';

export function useSyncScroll() {
    const leftColRef = useRef(null);
    const rightColRef = useRef(null);
    const isSyncing = useRef(false);

    useEffect(() => {
        const leftForm = leftColRef.current?.querySelector('form');
        const rightForm = rightColRef.current?.querySelector('form');

        if (!leftForm || !rightForm) return;

        const syncScroll = (source, target) => {
            if (isSyncing.current) return;
            isSyncing.current = true;
            target.scrollTop = source.scrollTop;
            requestAnimationFrame(() => {
                isSyncing.current = false;
            });
        };

        const handleLeftScroll = () => syncScroll(leftForm, rightForm);
        const handleRightScroll = () => syncScroll(rightForm, leftForm);

        leftForm.addEventListener('scroll', handleLeftScroll);
        rightForm.addEventListener('scroll', handleRightScroll);

        return () => {
            leftForm.removeEventListener('scroll', handleLeftScroll);
            rightForm.removeEventListener('scroll', handleRightScroll);
        };
    }, [leftColRef, rightColRef]);

    return { leftColRef, rightColRef };
}
