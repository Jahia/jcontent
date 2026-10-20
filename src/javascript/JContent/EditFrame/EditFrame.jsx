import React, {useEffect, useMemo, useRef, useState} from 'react';
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
import {createPageBuilderStore, PageBuilderStoreContext, setActiveStore} from './core/pageBuilderStore';
import {createLayoutScheduler, LayoutSchedulerContext} from './core/layoutScheduler';
import {bindFrameDnd} from './core/frameDndBridge';
import {fetchFrameDocument, markServerContent, morphFrameDocument} from './core/morphFrame';

export {getClickedElementHook} from './core/pageBuilderStore';

const noop = () => {};

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

    const store = useMemo(createPageBuilderStore, []);
    const [currentDocument, setCurrentDocument] = useState(null);
    // Counts the completed refreshes, in place or by reload. The overlays are mounted again on each, as
    // they are for a new document, and the frame exposes it to the tests as data-sel-revision.
    const [revision, setRevision] = useState(0);
    const [currentUrlParams, setCurrentUrlParams] = useState('');
    const [previousUrlParams, setPreviousUrlParams] = useState('');
    const [loading, setLoading] = useState(false);
    const [reloading, setReloading] = useState(false);

    const iframe = useRef();
    const cancelRestore = useRef(noop);
    const pendingAnchor = useRef(null);
    const refreshRun = useRef(null);
    const currentDndInfo = useRef({});

    useEffect(() => {
        setActiveStore(store);
        return () => {
            setActiveStore(null);
            cancelRestore.current();
            refreshRun.current?.abort();
        };
    }, [store]);

    const [scheduler, setScheduler] = useState(null);
    useEffect(() => {
        if (!currentDocument) {
            return undefined;
        }

        const _scheduler = createLayoutScheduler(currentDocument);
        setScheduler(_scheduler);
        return () => _scheduler.destroy();
    }, [currentDocument]);

    useEffect(() => (currentDocument ? bindFrameDnd(currentDocument.defaultView, manager, iframe.current) : undefined), [currentDocument, manager]);

    const restoreView = (win, anchor, scroll) => {
        cancelRestore.current();
        if (anchor) {
            cancelRestore.current = restoreAnchor(win, anchor, {fallback: scroll});
        } else {
            // Nothing was in view to anchor to: an empty page. The offset is all we have.
            win.scrollTo(scroll.scrollX, scroll.scrollY);
            cancelRestore.current = noop;
        }
    };

    const iFrameOnLoad = () => {
        const win = iframe.current.contentWindow;
        if (win.location.href === 'about:blank') {
            return;
        }

        setReloading(false);
        const _currentDocument = iframe.current.contentDocument;
        markServerContent(_currentDocument);

        const pending = pendingAnchor.current;
        pendingAnchor.current = null;
        if (pending) {
            restoreView(win, pending.anchor, pending.scroll);
            setRevision(r => r + 1);
        }

        const mainModule = _currentDocument.querySelector('[jahiatype=mainmodule]');
        const framePath = mainModule?.getAttribute('path');
        const frameLanguage = mainModule?.getAttribute('locale');
        const frameTemplate = mainModule?.getAttribute('template');
        if (framePath && (framePath !== path || frameLanguage !== language)) {
            console.debug('Updating path to', framePath, 'and language to', frameLanguage, 'in redux', 'template', frameTemplate, 'older path', path, 'older language', language, 'older template', template);
            dispatch(batchActions([
                cmGoto({path: framePath, language: frameLanguage, template: frameTemplate}),
                cmOpenPaths(extractPaths(site, framePath.substring(0, framePath.lastIndexOf('/'))))
            ]));
        }

        setCurrentDocument(_currentDocument);
    };

    /**
     * Brings the frame up to date after a change. The new rendering is morphed into the document on
     * screen, so the view stays still and nothing flashes. When that is not possible (the new
     * rendering needs a script or a stylesheet the page has not loaded) the frame reloads.
     */
    const refresh = async () => {
        refreshRun.current?.abort();
        const run = new AbortController();
        refreshRun.current = run;

        const win = iframe.current.contentWindow;
        const doc = win.document;
        // Note what the editor is looking at now, before anything reacts to the refresh: the
        // refetchers fire synchronously from here, and the content they replace sizes the page.
        const anchor = captureAnchor(win, store.getState().clickedElement?.path);
        const scroll = {scrollX: win.scrollX, scrollY: win.scrollY};

        let morphed = false;
        try {
            const newDoc = await fetchFrameDocument(win.location.href, run.signal);
            if (run.signal.aborted || iframe.current?.contentDocument !== doc) {
                return;
            }

            morphed = Boolean(newDoc) && morphFrameDocument(doc, newDoc);
        } catch (e) {
            if (e.name === 'AbortError') {
                return;
            }

            console.warn('Could not refresh the page builder in place, reloading it', e);
        }

        if (morphed) {
            restoreView(win, anchor, scroll);
            setRevision(r => r + 1);
        } else {
            pendingAnchor.current = {anchor, scroll};
            setReloading(true);
            win.location.reload();
        }
    };

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
        <PageBuilderStoreContext.Provider value={store}>
            <PageHeaderContainer setCurrentUrlParams={setCurrentUrlParams} setLoading={setLoading}/>
            <div style={{position: 'relative', flex: 1, margin: 0}}>
                {(!currentDocument || loading || reloading) && <TransparentLoaderOverlay/>}
                <iframe ref={iframe}
                        width="100%"
                        height="100%"
                        style={{position: 'absolute', border: '0'}}
                        id="page-builder-frame-1"
                        data-sel-role="page-builder-frame-active"
                        data-sel-revision={revision}
                        onLoad={iFrameOnLoad}
                />
            </div>
            {currentDocument && <LinkInterceptor document={currentDocument}/>}
            {currentDocument && (
                <Portal target={currentDocument.documentElement.querySelector('body')}>
                    <LayoutSchedulerContext.Provider value={scheduler}>
                        <div id="jahia-portal-root" className={styles.root}>
                            <React.Fragment key={revision}>
                                <Boxes currentDocument={currentDocument}
                                       currentFrameRef={iframe}
                                       currentDndInfo={currentDndInfo}
                                       onSaved={refresh}
                                />
                                <Infos currentDocument={currentDocument}/>
                            </React.Fragment>
                            <DndOverlays currentDndInfo={currentDndInfo}/>
                        </div>
                    </LayoutSchedulerContext.Provider>
                </Portal>
            )}
        </PageBuilderStoreContext.Provider>
    );
};

EditFrame.propTypes = {
};
