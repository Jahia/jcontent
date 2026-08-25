import React, {useCallback, useEffect, useRef, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {cmGoto, cmOpenPaths} from '~/JContent/redux/JContent.redux';
import {editFrameStyles as styles} from 'editframe-styles';
import {refetchTypes, setRefetcher, unsetRefetcher} from '~/JContent/JContent.refetches';
import {
    registerContentModificationEventHandler,
    unregisterContentModificationEventHandler
} from '~/JContent/eventHandlerRegistry';
import {extractPaths, isDescendantOrSelf} from '~/JContent/JContent.utils';
import {useApolloClient} from '@apollo/client';
import {Boxes} from './Boxes';
import {Portal} from './Portal';
import {Infos} from './Infos';
import {useDragDropManager} from 'react-dnd';
import {LinkInterceptor} from './LinkInterceptor';
import {batchActions} from 'redux-batched-actions';
import {TransparentLoaderOverlay} from '~/JContent/TransparentLoaderOverlay';
import {DndOverlays} from '~/JContent/EditFrame/DndOverlays';
import {PageHeaderContainer} from '~/JContent/EditFrame/PageHeader/PageHeaderContainer';
import {captureAnchor, restoreAnchor} from './EditFrame.anchor';
import scopedStyles from 'editframe-styles/scoped.css?url';

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

// This hook is used to clear clicked element outside on EditFrame context, specifically in copy/paste actions
let clickedElementHook = () => undefined;

const setClickedElementHook = fcn => {
    clickedElementHook = fcn;
};

export const getClickedElementHook = () => {
    return clickedElementHook;
};

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
    setClickedElementHook(setClickedElement);
    const [loading, setLoading] = useState(false);

    const iframe = useRef();
    const iframeSwap = useRef();
    const cancelRestore = useRef(() => {});
    const pendingAnchor = useRef(null);

    const currentDndInfo = useRef({});

    const iFrameOnLoad = event => {
        const loadedIframe = event.currentTarget;

        if (loadedIframe.contentWindow.location.href !== 'about:blank') {
            // Enable react-dnd
            addEventListeners(loadedIframe.contentWindow, manager, iframe);
            if (iframe.current !== loadedIframe) {
                iframeSwap.current = iframe.current;
                iframe.current = loadedIframe;
                // What the editor was looking at, noted when the reload was asked for if it was a
                // refresh — by the time the document is here, the outgoing one has already been
                // pulled about by the refetch.
                // Boxed, because refresh() legitimately captures nothing when no module is in view, and
                // a bare null could not be told apart from "this was not a refresh" — which would send
                // us scanning the whole outgoing document again for the same answer.
                const pending = pendingAnchor.current;
                const anchor = pending ? pending.anchor : captureAnchor(iframeSwap.current.contentWindow);
                const {scrollX, scrollY} = iframeSwap.current.contentWindow;
                pendingAnchor.current = null;

                setTimeout(() => {
                    // A unitless length is invalid CSS, so this has to carry its unit or the outgoing
                    // frame stays right where it is, covering the one we just swapped in.
                    iframeSwap.current.style.top = '-10000px';
                    iframe.current.style.top = '0';
                    iframe.current.setAttribute('data-sel-role', 'page-builder-frame-active');
                    iframeSwap.current.setAttribute('data-sel-role', 'page-builder-frame-inactive');

                    cancelRestore.current();
                    if (anchor) {
                        cancelRestore.current = restoreAnchor(iframe.current.contentWindow, anchor, {fallback: {scrollX, scrollY}});
                    } else {
                        // Nothing was in view to anchor to — an empty page. The offset is all we have.
                        iframe.current.contentWindow.scrollTo(scrollX, scrollY);
                    }
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
        // Note what the editor is looking at now, before anything reacts to the refresh: the
        // refetchers fire synchronously from here and the document on screen is sized in part by
        // the data they replace, so a moment later this is no longer a faithful reading.
        // Anchor on the content being worked on. An ordinary Content Editor save reaches us through
        // triggerRefetchAll, which says nothing about what changed, so the clicked element is what
        // identifies it — and holding that is both what the report asks for and far steadier than
        // picking whatever module happens to be nearest the top edge at this instant.
        pendingAnchor.current = {anchor: captureAnchor(iframe.current.contentWindow, clickedElement?.path)};

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
            setClickedElementHook(() => undefined);
            clearInterval(interval);
            cancelRestore.current();
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
                // Insert scoped stylesheets in the editframe if not already present
                if (currentDocument.querySelector(`link[rel="stylesheet"][href="${scopedStyles}"]`)) {
                    return;
                }

                const link = currentDocument.createElement('link');
                link.rel = 'stylesheet';
                link.href = scopedStyles;
                currentDocument.querySelector('head').appendChild(link);
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
            <div style={{position: 'relative', flex: 1, margin: 0}}>
                {(!currentDocument || loading) && <TransparentLoaderOverlay/>}
                <iframe ref={iframe}
                        width="100%"
                        height="100%"
                        style={{position: 'absolute', border: '0'}}
                        id="page-builder-frame-1"
                        data-sel-role="page-builder-frame-active"
                        onLoad={iFrameOnLoad}
                />
                <iframe ref={iframeSwap}
                        width="100%"
                        height="100%"
                        style={{position: 'absolute', top: -10000, border: '0'}}
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
