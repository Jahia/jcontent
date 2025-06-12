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
import {useDragDropManager} from 'react-dnd';
import {LinkInterceptor} from './LinkInterceptor';
import {batchActions} from 'redux-batched-actions';
import {TransparentLoaderOverlay} from '~/JContent/TransparentLoaderOverlay';
import {DndOverlays} from '~/JContent/EditFrame/DndOverlays';
import {PageHeaderContainer} from '~/JContent/EditFrame/PageHeader/PageHeaderContainer';

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
            console.debug('Mouse up event happened while monitor is still dragging, cancelling previous DND operation', event);
            backend.handleTopDragEndCapture(event);
            if (monitor.isDragging()) {
                manager.getActions()?.endDrag();
            }
        }
    });

    target.addEventListener('mousemove', event => {
        const isMouseUp = event.buttons === 0;
        if (monitor.isDragging() && isMouseUp) {
            console.debug('Mouse move event happened while monitor is still dragging, cancelling previous DND operation', event);
            backend.handleTopDragEndCapture(event);
            if (monitor.isDragging()) {
                manager.getActions()?.endDrag();
            }
        }
    });
}

export const EditFrame = () => {
    const manager = useDragDropManager();

    const {path, site, language, template} = useSelector(state => ({
        language: state.language,
        site: state.site,
        path: state.jcontent.path,
        template: state.jcontent.template
    }), shallowEqual);

    const client = useApolloClient();
    const dispatch = useDispatch();

    const [currentDocument, setCurrentDocument] = useState(null);
    const [currentUrlParams, setCurrentUrlParams] = useState('');
    const [previousUrlParams, setPreviousUrlParams] = useState('');
    const [clickedElement, setClickedElement] = useState();
    const [loading, setLoading] = useState(false);

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
            const _currentDocument = iframe.current.contentDocument;
            const framePath = _currentDocument.querySelector('[jahiatype=mainmodule]')?.getAttribute('path');
            const frameLanguage = _currentDocument.querySelector('[jahiatype=mainmodule]')?.getAttribute('locale');
            const frameTemplate = _currentDocument.querySelector('[jahiatype=mainmodule]')?.getAttribute('template');
            if (framePath && (framePath !== path || frameLanguage !== language)) {
                console.debug('Updating path to', framePath, 'and language to', frameLanguage, 'in redux', 'template', frameTemplate, 'older path', path, 'older language', language, 'older template', template);
                dispatch(batchActions([
                    cmGoto({path: framePath, language: frameLanguage, template: frameTemplate}),
                    cmOpenPaths(extractPaths(site, framePath.substring(0, framePath.lastIndexOf('/'))))
                ]));
            }

            setCurrentDocument(_currentDocument);
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
            // Do nothing; refetcher should have been called already at this point
            return;
        }

        if (operation === 'delete') {
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
                    const _path = element.getAttribute('path');
                    if (_path !== '*') {
                        client.cache.flushNodeEntryByPath(_path);
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

    useEffect(() => {
        const encodedPath = path.replace(/[^/]/g, encodeURIComponent) + (template === '' ? '' : `.${template}`);
        const url = `${window.contextJsParameters.contextPath}/cms/editframe/default/${language}${encodedPath}.html?redirect=false${currentUrlParams}`;

        if (currentDocument) {
            const mainModule = currentDocument.querySelector('[jahiatype=mainmodule]');
            console.debug('Loading', url, 'in iframe', mainModule?.getAttribute('path'), path, language, template);
            const framePath = mainModule?.getAttribute('path');
            const locale = mainModule?.getAttribute('locale');
            if (path === framePath && locale === language && currentUrlParams === previousUrlParams) {
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
                setPreviousUrlParams(currentUrlParams);
            }
        } else if (path && !path.endsWith('/')) {
            console.debug('Loading', url, 'in iframe');
            iframe.current.contentWindow.location.href = url;
            setPreviousUrlParams(currentUrlParams);
        }
    }, [currentDocument, path, language, template, currentUrlParams, previousUrlParams]);

    if (site === 'systemsite') {
        return <h2 style={{color: 'grey'}}>You need to create a site to see this page</h2>;
    }

    return (
        <>
            <PageHeaderContainer setCurrentUrlParams={setCurrentUrlParams} setLoading={setLoading}/>
            <div className={styles.frame}>
                {(!currentDocument || loading) && <TransparentLoaderOverlay/>}
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
            </div>
            {currentDocument && <LinkInterceptor document={currentDocument}/>}
            {currentDocument && (
                <Portal target={currentDocument.documentElement.querySelector('body')}>
                    <div id="jahia-portal-root" className={styles.root}>
                        <Boxes currentDocument={currentDocument}
                               currentFrameRef={iframe}
                               currentDndInfo={currentDndInfo}
                               addIntervalCallback={addIntervalCallback}
                               clickedElement={clickedElement}
                               setClickedElement={setClickedElement}
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
};
