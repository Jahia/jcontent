import { useEffect, useRef } from 'react';


export function useSyncScroll() {
    const leftColRef = useRef(null);
    const rightColRef = useRef(null);
    const isSyncing = useRef(false);
    const observerCleanupRef = useRef([]);

    useEffect(() => {
        let leftForm = null;
        let rightForm = null;

        const syncScroll = (source, target) => {
            if (isSyncing.current) return;
            isSyncing.current = true;
            target.scrollTop = source.scrollTop;
            requestAnimationFrame(() => {
                isSyncing.current = false;
            });
        };

        const tryAttachListeners = () => {
            if (!leftForm || !rightForm) return;

            const handleLeftScroll = () => syncScroll(leftForm, rightForm);
            const handleRightScroll = () => syncScroll(rightForm, leftForm);

            leftForm.addEventListener('scroll', handleLeftScroll);
            rightForm.addEventListener('scroll', handleRightScroll);

            // Store cleanup functions
            observerCleanupRef.current.push(() => {
                leftForm.removeEventListener('scroll', handleLeftScroll);
                rightForm.removeEventListener('scroll', handleRightScroll);
            });
        };

        const observeForForm = (containerRef, setForm) => {
            const container = containerRef.current;
            if (!container) return;

            const form = container.querySelector('form');
            if (form) {
                setForm(form);
                return;
            }

            const observer = new MutationObserver(() => {
                const detected = container.querySelector('form');
                if (detected) {
                    setForm(detected);
                    observer.disconnect();
                }
            });

            observer.observe(container, {
                childList: true,
                subtree: true,
            });

            observerCleanupRef.current.push(() => observer.disconnect());
        };

        // Observe each column for the form
        observeForForm(leftColRef, (form) => {
            leftForm = form;
            if (rightForm) tryAttachListeners();
        });

        observeForForm(rightColRef, (form) => {
            rightForm = form;
            if (leftForm) tryAttachListeners();
        });

        // Cleanup on unmount
        return () => {
            observerCleanupRef.current.forEach((cleanup) => cleanup());
            observerCleanupRef.current = [];
        };
    }, [leftColRef, rightColRef]);

    return { leftColRef, rightColRef };
}

export function useSyncScrollOld() {
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
