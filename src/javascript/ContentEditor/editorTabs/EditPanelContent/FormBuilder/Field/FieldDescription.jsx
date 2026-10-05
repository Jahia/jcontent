import React, {useId, useLayoutEffect, useRef, useState} from 'react';
import {Typography} from '@jahia/moonstone';
import clsx from 'clsx';
import {useTranslation} from 'react-i18next';
import * as PropTypes from 'prop-types';
import styles from './FieldDescription.scss';

/**
 * Shows the first visual line of a field description, and a button that expands it when the
 * text does not fit on that line.
 */
export const FieldDescription = ({description}) => {
    const {t} = useTranslation('jcontent');
    const textId = useId();
    const textRef = useRef(null);
    const [isExpanded, setExpanded] = useState(false);
    const [isTruncated, setTruncated] = useState(false);

    // Only the folded text is measured: once expanded, the button stays to fold it back.
    useLayoutEffect(() => {
        const element = textRef.current;
        if (isExpanded || !element) {
            return undefined;
        }

        const measure = () => setTruncated(element.scrollHeight > element.clientHeight);
        measure();
        if (typeof ResizeObserver === 'undefined') {
            return undefined;
        }

        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, [description, isExpanded]);

    return (
        <div className={styles.fieldDescription} data-sel-role="field-description">
            <Typography ref={textRef}
                        id={textId}
                        className={clsx(styles.text, {[styles.collapsed]: !isExpanded})}
                        variant="caption"
            >
                {/* eslint-disable-next-line react/no-danger */}
                <span dangerouslySetInnerHTML={{__html: description}}/>
            </Typography>
            {isTruncated && (
                <button type="button"
                        className={styles.toggle}
                        aria-controls={textId}
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? undefined : t('jcontent:label.contentEditor.edit.fieldDescription.expand')}
                        title={isExpanded ? undefined : t('jcontent:label.contentEditor.edit.fieldDescription.expand')}
                        data-sel-role="field-description-toggle"
                        onClick={() => setExpanded(!isExpanded)}
                >
                    {isExpanded ? t('jcontent:label.contentEditor.edit.fieldDescription.collapse') : '…'}
                </button>
            )}
        </div>
    );
};

FieldDescription.propTypes = {
    description: PropTypes.string.isRequired
};
