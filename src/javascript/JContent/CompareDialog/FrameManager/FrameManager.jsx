import Frame from './Frame';
import React, {useEffect, useRef} from 'react';
import {useApolloClient, useQuery} from '@apollo/client';
import {DiffHtml, RenderUrl} from './FrameManager.gql-queries';
import {shallowEqual, useSelector} from 'react-redux';
import styles from './FrameManager.scss';
import clsx from 'clsx';
import {Typography} from '@jahia/moonstone';
import {resolveUrlForLiveOrPreview} from '../../JContent.utils';
import {useTranslation} from 'react-i18next';

const FrameManager = () => {
    const {t} = useTranslation('jcontent');
    const client = useApolloClient();
    const leftFrame = useRef();
    const rightFrame = useRef();
    const {path, showHighlights, reloadCount, language} = useSelector(state => ({
        path: state.jcontent.compareStagingAndLive.path,
        showHighlights: state.jcontent.compareStagingAndLive.showHighlights,
        reloadCount: state.jcontent.compareStagingAndLive.reloadCount,
        language: state.language
    }), shallowEqual);
    const {data} = useQuery(RenderUrl, {variables: {
        path: path,
        language: language
    }, skip: !path});

    // Reload both frames
    useEffect(() => {
        if (reloadCount > 0) {
            leftFrame.current.contentWindow.location.reload();
            rightFrame.current.contentWindow.location.reload();
        }
    }, [reloadCount]);

    // Switch highlights based on current state
    useEffect(() => {
        if (showHighlights) {
            const n = leftFrame.current.contentDocument.querySelector('body').outerHTML;
            const original = rightFrame.current.contentDocument.querySelector('body').outerHTML;
            client.query({
                query: DiffHtml,
                variables: {
                    original: original,
                    new: n
                },
                fetchPolicy: 'network-only'
            }).then(resp => {
                if (resp?.data?.jcontent?.diffHtml) {
                    leftFrame.current.contentDocument.querySelector('body').outerHTML = resp.data.jcontent.diffHtml;
                }
            }).catch(e => console.log('Could not diff html', e));
        } else {
            leftFrame.current.contentWindow.location.reload();
        }
    }, [client, showHighlights, leftFrame, rightFrame]);

    // Load frames
    useEffect(() => {
        if (leftFrame.current && data?.jcr?.result?.renderUrlEdit) {
            leftFrame.current.contentWindow.location.href = resolveUrlForLiveOrPreview(data.jcr.result.renderUrlEdit, false);
        }

        if (rightFrame.current && data?.jcr?.result?.renderUrlLive) {
            rightFrame.current.contentWindow.location.href = resolveUrlForLiveOrPreview(data.jcr.result.renderUrlLive, true, data.jcr.result.site.serverName);
        }
    }, [leftFrame, rightFrame, data]);

    return (
        <>
            <div className={clsx('flexRow_nowrap', styles.stagingOrLiveHeading)}>
                <Typography className={styles.fiftyPercentWidth} variant="subheading">{t('jcontent:label.contentManager.contentPreview.staging')}</Typography>
                <Typography className={styles.fiftyPercentWidth} variant="subheading">{t('jcontent:label.contentManager.contentPreview.live')}</Typography>
            </div>
            <div className={styles.frameContainer}>
                <div className={styles.fiftyPercentWidth}>
                    <Frame ref={leftFrame} role="stagingFrame"/>
                </div>
                <div className={clsx(styles.fiftyPercentWidth, styles.leftMargin)}>
                    <Frame ref={rightFrame} role="liveFrame"/>
                </div>
            </div>
        </>
    );
};

export default FrameManager;
