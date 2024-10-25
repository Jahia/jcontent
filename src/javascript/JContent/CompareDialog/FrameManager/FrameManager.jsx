import Frame from './Frame';
import React, {useEffect, useRef} from 'react';
import {useApolloClient, useQuery} from '@apollo/client';
import {DiffHtml, RenderUrl} from './FrameManager.gql-queries';
import {shallowEqual, useSelector} from 'react-redux';
import styles from './FrameManager.scss';
import clsx from 'clsx';

const FrameManager = () => {
    const client = useApolloClient();
    const leftFrame = useRef();
    const rightFrame = useRef();
    const {path, showHighlights, reloadCount, language} = useSelector(state => ({
        path: state.jcontent.compareStagingAndLive.path,
        showHighlights: state.jcontent.compareStagingAndLive.showHighlights,
        reloadCount: state.jcontent.compareStagingAndLive.reloadCount,
        language: state.language
    }), shallowEqual);
    const {loading: editUrlLoading, data: editData} = useQuery(RenderUrl, {variables: {
        path: path,
        language: language,
        workspace: 'EDIT'
    }, skip: !path});
    const {loading: liveUrlLoading, data: liveData} = useQuery(RenderUrl, {variables: {
        path: path,
        language: language,
        workspace: 'LIVE'
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
            console.log(n, original);
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

    // Load staging frame when url available
    useEffect(() => {
        if (leftFrame.current && editData?.jcr?.result?.renderUrl) {
            leftFrame.current.contentWindow.location.href = `${window.contextJsParameters.contextPath}${editData.jcr.result.renderUrl}`;
        }
    }, [leftFrame, editData]);

    // Load live frame when url is available
    useEffect(() => {
        if (rightFrame.current && liveData?.jcr?.result?.renderUrl) {
            // todo resolve server name as in open in action
            rightFrame.current.contentWindow.location.href = `${window.contextJsParameters.contextPath}${liveData.jcr.result.renderUrl}`;
        }
    }, [rightFrame, liveData]);

    return (
        <>
            <div className={styles.frameHolder}>
                <Frame ref={leftFrame}/>
            </div>
            <div className={clsx(styles.frameHolder, styles.leftMargin)}>
                <Frame ref={rightFrame}/>
            </div>
        </>
    );
};

export default FrameManager;
