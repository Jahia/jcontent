import React, {useId, useLayoutEffect, useRef, useState} from 'react';
import {Chip, Typography} from '@jahia/moonstone';
import clsx from 'clsx';
import {useTranslation} from 'react-i18next';
import * as PropTypes from 'prop-types';
import styles from './FieldDescription.scss';

/**
 * The right edge of the first visual line of the text under `element`, from the left edge of
 * `container`. Text nodes only: the box of a block element spans the whole width.
 */
const getFirstLineEnd = (element, container) => {
    if (typeof document.createRange !== 'function') {
        return null;
    }

    const range = document.createRange();
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const rects = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (node.textContent.trim()) {
            range.selectNodeContents(node);
            rects.push(...Array.from(range.getClientRects?.() || []));
        }
    }

    if (rects.length === 0) {
        return null;
    }

    const firstTop = Math.min(...rects.map(rect => rect.top));
    const firstLine = rects.filter(rect => rect.top - firstTop < rect.height / 2);
    return Math.max(...firstLine.map(rect => rect.right)) - container.getBoundingClientRect().left;
};

/**
 * Shows the first visual line of a field description, and a button that expands it when the
 * text does not fit on that line.
 */
export const FieldDescription = ({description}) => {
    const {t} = useTranslation('jcontent');
    const textId = useId();
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const [isExpanded, setExpanded] = useState(false);
    const [isTruncated, setTruncated] = useState(false);
    const [lineEnd, setLineEnd] = useState(null);

    // Only the folded text is measured: once expanded, the button stays to fold it back.
    useLayoutEffect(() => {
        const element = textRef.current;
        if (isExpanded || !element) {
            return undefined;
        }

        const measure = () => {
            setTruncated(element.scrollHeight > element.clientHeight);
            setLineEnd(getFirstLineEnd(element, containerRef.current));
        };

        measure();
        if (typeof ResizeObserver === 'undefined') {
            return undefined;
        }

        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, [description, isExpanded]);

    const toggleProps = {
        className: styles.toggle,
        'aria-controls': textId,
        'aria-expanded': isExpanded,
        'data-sel-role': 'field-description-toggle',
        onClick: () => setExpanded(!isExpanded)
    };

    return (
        <div ref={containerRef} className={styles.fieldDescription} data-sel-role="field-description">
            <Typography ref={textRef}
                        id={textId}
                        className={clsx(styles.text, {[styles.collapsed]: !isExpanded, [styles.truncated]: isTruncated && !isExpanded})}
                        variant="caption"
            >
                {/* eslint-disable-next-line react/no-danger */}
                <span dangerouslySetInnerHTML={{__html: description}}/>
                {isTruncated && isExpanded && (
                    <button type="button" {...toggleProps}>
                        <Chip className={styles.chip} color="default" label={t('jcontent:label.contentEditor.edit.fieldDescription.collapse')}/>
                    </button>
                )}
            </Typography>
            {isTruncated && !isExpanded && (
                // Placed right after the end of the first visual line, which the text keeps room for
                <button type="button"
                        {...toggleProps}
                        className={clsx(styles.toggle, styles.expand)}
                        style={lineEnd === null ? undefined : {left: lineEnd, right: 'auto'}}
                        aria-label={t('jcontent:label.contentEditor.edit.fieldDescription.expand')}
                        title={t('jcontent:label.contentEditor.edit.fieldDescription.expand')}
                >
                    <Chip className={styles.chip} color="default" label="…"/>
                </button>
            )}
        </div>
    );
};

FieldDescription.propTypes = {
    description: PropTypes.string.isRequired
};
