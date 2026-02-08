import {useEffect, useMemo, useState} from 'react';

/**
 * Tracks which module elements are visible in the iframe viewport (IntersectionObserver).
 * Returns a Set of jahiaPath strings.
 */
export const useVisibleModulePaths = ({currentDocument, modules}) => {
    const [visible, setVisible] = useState(() => new Set());

    const moduleList = useMemo(() => modules.filter(Boolean), [modules]);

    useEffect(() => {
        if (!currentDocument?.defaultView || moduleList.length === 0) {
            setVisible(new Set());
            return;
        }

        const win = currentDocument.defaultView;
        const next = new Set();

        const observer = new win.IntersectionObserver(entries => {
            let changed = false;
            for (const entry of entries) {
                const el = entry.target;
                const p = el?.dataset?.jahiaPath;
                if (!p) continue;

                if (entry.isIntersecting) {
                    if (!next.has(p)) {
                        next.add(p);
                        changed = true;
                    }
                } else if (next.delete(p)) {
                    changed = true;
                }
            }

            if (changed) {
                // create a new Set instance so React state change is detected
                setVisible(new Set(next));
            }
        }, {
            root: null,
            rootMargin: '300px', // pre-render ahead/behind viewport
            threshold: 0.01
        });

        for (const el of moduleList) {
            observer.observe(el);
        }

        return () => observer.disconnect();
    }, [currentDocument, moduleList]);

    return visible;
};
