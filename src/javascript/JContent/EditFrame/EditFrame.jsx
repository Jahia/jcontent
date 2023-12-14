import React, {useCallback, useEffect, useRef, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {cmGoto, cmOpenPaths} from '~/JContent/redux/JContent.redux';
import styles from './EditFrame.scss';
import {refetchTypes, setRefetcher, unsetRefetcher} from '~/JContent/JContent.refetches';
import {
    registerContentModificationEventHandler,
    unregisterContentModificationEventHandler
} from '~/JContent/eventHandlerRegistry';
import {extractPaths, isDescendantOrSelf} from '~/JContent/JContent.utils';
import {useApolloClient} from '@apollo/client';
import {prefixCssSelectors} from './EditFrame.utils';
import {Boxes} from './Boxes';
import {Portal} from './Portal';
import {Infos} from './Infos';
import {DeviceContainer} from './DeviceContainer';
import PropTypes from 'prop-types';
import {useDragDropManager} from 'react-dnd';
import {LinkInterceptor} from './LinkInterceptor';
import {Tooltip} from '@material-ui/core';
import {batchActions} from 'redux-batched-actions';
import {TransparentLoaderOverlay} from '~/JContent/TransparentLoaderOverlay';
import {DndOverlays} from '~/JContent/EditFrame/DndOverlays';

function addEventListeners(target, manager, iframeRef) {
    // SSR Fix (https://github.com/react-dnd/react-dnd/pull/813
    if (!target.addEventListener) {
        return;
    }

    const {backend, monitor} = manager;

    target.addEventListener('dragover', () => {
        const clientRect = iframeRef.current.getBoundingClientRect();
        if (manager.additionalOffset.x !== clientRect.x || manager.additionalOffset.y !== clientRect.y) {
            manager.setAdditionalOffset(clientRect);
        }
    });

    target.addEventListener('dragstart', backend.handleTopDragStart);
    target.addEventListener('dragstart', backend.handleTopDragStartCapture, true);
    target.addEventListener('dragend', backend.handleTopDragEndCapture, true);
    target.addEventListener('dragenter', backend.handleTopDragEnter);
    target.addEventListener('dragenter', backend.handleTopDragEnterCapture, true);
    target.addEventListener('dragleave', backend.handleTopDragLeaveCapture, true);
    target.addEventListener('dragover', backend.handleTopDragOver);
    target.addEventListener('dragover', backend.handleTopDragOverCapture, true);
    target.addEventListener('drop', backend.handleTopDrop);
    target.addEventListener('drop', backend.handleTopDropCapture, true);
    target.addEventListener('mouseup', event => {
        if (monitor.isDragging()) {
            console.debug('Mouse up event happened while monitor is still dragging, cancelling previous DND operation', event, monitor.isDragging());
            backend.handleTopDragEndCapture(event);
        }
    });
    target.addEventListener('mousemove', event => {
        if (monitor.isDragging() && event.buttons === 0) {
            console.debug('Mouse move event happened while monitor is still dragging, cancelling previous DND operation', event, monitor.isDragging());
            backend.handleTopDragEndCapture(event);
        }
    });
}

export const EditFrame = ({isPreview, isDeviceView}) => {
    const manager = useDragDropManager();

    const {path, site, language} = useSelector(state => ({
        language: state.language,
        site: state.site,
        path: state.jcontent.path,
        selection: state.jcontent.selection
    }), shallowEqual);

    const client = useApolloClient();
    const dispatch = useDispatch();

    const [currentDocument, setCurrentDocument] = useState(null);
    const [device, setDevice] = useState(null);
    const previousDevice = useRef();

    const iframe = useRef();
    const iframeSwap = useRef();

    const currentDndInfo = useRef({});

    const iFrameOnLoad = event => {
        const loadedIframe = event.currentTarget;

        if (loadedIframe.contentWindow.location.href !== 'about:blank') {
            // Enable react-dnd
            addEventListeners(loadedIframe.contentWindow, manager, iframe);
            if (iframe.current !== loadedIframe) {
                iframeSwap.current = iframe.current;
                iframe.current = loadedIframe;
                const pos = {
                    scrollLeft: Math.floor(iframeSwap.current.contentWindow.scrollX || iframeSwap.current.contentWindow.pageXOffset),
                    scrollTop: Math.floor(iframeSwap.current.contentWindow.scrollY || iframeSwap.current.contentWindow.pageYOffset)
                };
                setTimeout(() => {
                    iframeSwap.current.style.top = '-10000';
                    iframe.current.style.top = '0';
                    iframe.current.setAttribute('data-sel-role', 'page-builder-frame-active');
                    iframeSwap.current.setAttribute('data-sel-role', 'page-builder-frame-inactive');
                    iframe.current.contentWindow.scrollTo(pos.scrollLeft, pos.scrollTop);

                    setTimeout(() => {
                        // Firefox hack, if scroll has moved when redrawing
                        if (Math.floor(iframe.current.contentWindow.scrollY) !== pos.scrollTop) {
                            iframe.current.contentWindow.scrollTo(pos.scrollLeft, pos.scrollTop);
                        }
                    }, 100);
                });
            }
        }

        if (iframe.current === loadedIframe) {
            const currentDocument = iframe.current.contentDocument;
            const framePath = currentDocument.querySelector('[jahiatype=mainmodule]')?.getAttribute('path');
            const frameLanguage = currentDocument.querySelector('[jahiatype=mainmodule]')?.getAttribute('locale');
            if (framePath && (framePath !== path || frameLanguage !== language)) {
                dispatch(batchActions([
                    cmGoto({path: framePath, language: frameLanguage}),
                    cmOpenPaths(extractPaths(site, framePath.substring(0, framePath.lastIndexOf('/'))))
                ]));
            }

            setCurrentDocument(currentDocument);
        }
    };

    function refresh() {
        if (iframeSwap.current.contentWindow.location.href === iframe.current.contentWindow.location.href) {
            iframeSwap.current.contentWindow.location.reload();
        } else {
            iframeSwap.current.contentWindow.location.href = iframe.current.contentWindow.location.href;
        }
    }

    const onGwtContentModification = async (nodeUuid, nodePath, nodeName, operation) => {
        if (operation === 'update' && !nodePath.endsWith('/' + nodeName)) {
            operation = 'rename';
        }

        if (operation === 'create') {
            // Do nothing ?
        } else if (operation === 'delete') {
            // Clear cache entries for subnodes
            Object.keys(client.cache.idByPath)
                .filter(p => isDescendantOrSelf(p, nodePath))
                .forEach(p => client.cache.flushNodeEntryByPath(p));
        } else if (operation === 'rename') {
            //
        } else if (operation === 'update') {
            client.cache.flushNodeEntryById(nodeUuid);
        }

        refresh();
    };

    useEffect(() => {
        setRefetcher(refetchTypes.CONTENT_DATA, {
            refetch: () => {
                currentDocument.querySelectorAll('[jahiatype=module]').forEach(element => {
                    let path = element.getAttribute('path');
                    if (path !== '*') {
                        client.cache.flushNodeEntryByPath(path);
                    }
                });

                refresh();
            }
        });

        registerContentModificationEventHandler(onGwtContentModification);

        return () => {
            unsetRefetcher(refetchTypes.CONTENT_DATA);
            unregisterContentModificationEventHandler(onGwtContentModification);
        };
    });

    const intervalCallbacks = useRef([]);
    const addIntervalCallback = useCallback(cb => {
        intervalCallbacks.current.push(cb);
        return () => {
            intervalCallbacks.current.splice(intervalCallbacks.current.indexOf(cb), 1);
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            intervalCallbacks.current.forEach(cb => cb());
        }, 50);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const deviceParam = (isDeviceView && device) ? ('&channel=' + device) : '';

    useEffect(() => {
        const renderMode = isPreview ? 'render' : 'editframe';
        const encodedPath = path.replace(/[^/]/g, encodeURIComponent);
        const url = `${window.contextJsParameters.contextPath}/cms/${renderMode}/default/${language}${encodedPath}.html?redirect=false${deviceParam}`;
        if (currentDocument) {
            let mainModule = currentDocument.querySelector('[jahiatype=mainmodule]');
            const framePath = mainModule?.getAttribute('path');
            const locale = mainModule?.getAttribute('locale');
            if (!isPreview && path === framePath && locale === language && previousDevice.current === deviceParam) {
                // Clone all styles with doubled classname prefix
                const head = currentDocument.querySelector('head');
                iframe.current.ownerDocument.querySelectorAll('style[styleloader],style[data-jss]').forEach(s => {
                    const clone = s.cloneNode(true);
                    clone.textContent = prefixCssSelectors(clone.textContent, '.' + styles.root);
                    currentDocument.adoptNode(clone);
                    head.appendChild(clone);
                });
            } else if (!iframe.current.contentWindow.location.href.endsWith(url)) {
                iframe.current.contentWindow.location.href = url;
                previousDevice.current = deviceParam;
            }
        } else if (path && !path.endsWith('/')) {
            iframe.current.contentWindow.location.href = url;
            previousDevice.current = deviceParam;
        }
    }, [currentDocument, path, previousDevice, deviceParam, language, isPreview]);

    if (site === 'systemsite') {
        return <h2 style={{color: 'grey'}}>You need to create a site to see this page</h2>;
    }

    return (
        <>
            <Tooltip title=""><span/></Tooltip>
            <DeviceContainer isEnabled={isDeviceView} device={device} setDevice={setDevice}>
                {!currentDocument && <TransparentLoaderOverlay/>}
                <iframe ref={iframe}
                        width="100%"
                        height="100%"
                        style={{position: 'absolute'}}
                        id="page-builder-frame-1"
                        data-sel-role="page-builder-frame-active"
                        onLoad={iFrameOnLoad}
                />
                <iframe ref={iframeSwap}
                        width="100%"
                        height="100%"
                        style={{position: 'absolute', top: -10000}}
                        id="page-builder-frame-2"
                        data-sel-role="page-builder-frame-inactive"
                        onLoad={iFrameOnLoad}
                />
            </DeviceContainer>
            {currentDocument && <LinkInterceptor document={currentDocument}/>}
            {currentDocument && !isPreview && (
                <Portal target={currentDocument.documentElement.querySelector('body')}>
                    <div id="jahia-portal-root" className={styles.root}>
                        <Boxes currentDocument={currentDocument}
                               currentFrameRef={iframe}
                               currentDndInfo={currentDndInfo}
                               addIntervalCallback={addIntervalCallback}
                               onSaved={() => {
                                   refresh();
                               }}
                        />
                        <Infos currentDocument={currentDocument} addIntervalCallback={addIntervalCallback}/>
                        <DndOverlays currentDndInfo={currentDndInfo}/>
                    </div>
                </Portal>
            )}
        </>
    );
};

EditFrame.propTypes = {
    isPreview: PropTypes.bool,
    isDeviceView: PropTypes.bool
};
