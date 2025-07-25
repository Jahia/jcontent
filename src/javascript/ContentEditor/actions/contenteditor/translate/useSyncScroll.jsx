import {useEffect, useRef} from 'react';

export function useSyncScroll() {
    const leftColRef = useRef(null);
    const rightColRef = useRef(null);

    const isSyncing = useRef(false);
    const cleanupRef = useRef(null);

    useEffect(() => {
        const observer = new MutationObserver(() => {
            // Clean up previous listeners
            if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
            }

            const leftForm = leftColRef.current?.querySelector('form');
            const rightForm = rightColRef.current?.querySelector('form');

            if (!leftForm || !rightForm) {
                return;
            }

            const syncScroll = (source, target) => {
                if (isSyncing.current) {
                    return;
                }

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

            cleanupRef.current = () => {
                leftForm?.removeEventListener('scroll', handleLeftScroll);
                rightForm?.removeEventListener('scroll', handleRightScroll);
            };
        });

        if (leftColRef.current && rightColRef.current) {
            observer.observe(leftColRef.current, {childList: true, subtree: true});
            observer.observe(rightColRef.current, {childList: true, subtree: true});
        }

        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
            }

            observer.disconnect();
        };
    }, []);

    return {leftColRef, rightColRef};
}
