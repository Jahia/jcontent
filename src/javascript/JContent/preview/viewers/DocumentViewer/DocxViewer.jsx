import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import * as mammoth from 'mammoth/mammoth.browser';
import DOMPurify from 'dompurify';
import {useTranslation} from 'react-i18next';
import styles from './DocxViewer.scss';

export const DocxViewer = ({file}) => {
    const {t} = useTranslation('jcontent');
    const [html, setHtml] = useState(null);
    const [error, setError] = useState(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        // Used as guard against stale async results
        mountedRef.current = true;
        setHtml(null);
        setError(false);

        fetch(file)
            .then(r => r.arrayBuffer())
            .then(buf => mammoth.convertToHtml({arrayBuffer: buf}, {includeDefaultStyleMap: true}))
            .then(result => {
                if (mountedRef.current) {
                    setHtml(DOMPurify.sanitize(result.value, {USE_PROFILES: {html: true}}));
                }
            })
            .catch(err => {
                console.error('DocxViewer: failed to convert docx', err);
                if (mountedRef.current) {
                    setError(true);
                }
            });

        return () => {
            mountedRef.current = false;
        };
    }, [file]);

    if (error) {
        return <span>{t('label.contentManager.contentPreview.noViewAvailable')}</span>;
    }

    if (!html) {
        return null;
    }

    return (
        <div
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{__html: html}}
            className={styles.documentContainer}
        />
    );
};

DocxViewer.propTypes = {
    file: PropTypes.string.isRequired
};
