import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {cmGoto} from '../../../JContent.redux';
import styles from './EditFrame.scss';
import {refetchTypes, setRefetcher, unsetRefetcher} from '../../../JContent.refetches';
import {
    registerContentModificationEventHandler,
    unregisterContentModificationEventHandler
} from '../../../eventHandlerRegistry';
import {isDescendantOrSelf} from '../../../JContent.utils';
import {useApolloClient} from 'react-apollo';
import {prefixCssSelectors} from './EditFrame.utils';
import {Boxes} from './Boxes';
import {Portal} from './Portal';
import {Infos} from './Infos';
import {DeviceContainer} from './DeviceContainer';
import PropTypes from 'prop-types';

export const EditFrame = ({deviceView}) => {
    const {path, site, language} = useSelector(state => ({
        language: state.language,
        site: state.site,
        path: state.jcontent.path,
        selection: state.jcontent.selection
    }));

    const client = useApolloClient();
    const dispatch = useDispatch();

    const mainResourcePath = `/cms/editframe/default/${language}${path}.html?redirect=false`;

    const [currentDocument, setCurrentDocument] = useState(null);

    const iframe = useRef();
    const iframeSwap = useRef();
    const scrollPos = useRef({scrollTop: 0, scrollLeft: 0});

    const iFrameOnLoad = event => {
        const loadedIframe = event.currentTarget;
        if (loadedIframe.contentWindow.location.href !== 'about:blank') {
            if (iframe.current !== loadedIframe) {
                console.log('swapping ' + loadedIframe.getAttribute('id'));
                iframeSwap.current = iframe.current;
                iframe.current = loadedIframe;
                setTimeout(() => {
                    iframeSwap.current.style.display = 'none';
                    iframe.current.style.display = 'block';
                    iframe.current.contentWindow.scrollTo(scrollPos.current.scrollLeft, scrollPos.current.scrollTop);
                });
            }
        }

        if (iframe.current === loadedIframe) {
            const currentDocument = iframe.current.contentDocument;
            const framePath = currentDocument.querySelector('[jahiatype=mainmodule]')?.getAttribute('path');
            if (framePath && framePath !== path) {
                dispatch(cmGoto({path: framePath}));
            }

            setCurrentDocument(currentDocument);
        }
    };

    function refresh() {
        scrollPos.current = {
            scrollLeft: iframe.current.contentWindow.pageXOffset || iframe.current.contentDocument.documentElement.scrollLeft,
            scrollTop: iframe.current.contentWindow.pageYOffset || iframe.current.contentDocument.documentElement.scrollTop
        };

        if (iframeSwap.current.contentWindow.location.href !== iframe.current.contentWindow.location.href) {
            console.log('setting href for ' + iframeSwap.current.getAttribute('id') + ' to ' + iframe.current.contentWindow.location.href);
            iframeSwap.current.contentWindow.location.href = iframe.current.contentWindow.location.href;
        } else {
            console.log('reloading ' + iframeSwap.current.getAttribute('id'));
            iframeSwap.current.contentWindow.location.reload();
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
                iframe.current.contentWindow.location.reload();
            }
        });

        registerContentModificationEventHandler(onGwtContentModification);

        return () => {
            unsetRefetcher(refetchTypes.CONTENT_DATA);
            unregisterContentModificationEventHandler(onGwtContentModification);
        };
    });

    useEffect(() => {
        if (currentDocument) {
            const framePath = currentDocument.querySelector('[jahiatype=mainmodule]')?.getAttribute('path');
            if (path === framePath) {
                // Clone all styles with doubled classname prefix
                const head = currentDocument.querySelector('head');
                document.querySelectorAll('style[styleloader]').forEach(s => {
                    const clone = s.cloneNode(true);
                    clone.textContent = prefixCssSelectors(clone.textContent, '.' + styles.root);
                    currentDocument.adoptNode(clone);
                    head.appendChild(clone);
                });
            } else {
                iframe.current.contentWindow.location.href = window.contextJsParameters.contextPath + mainResourcePath;
            }
        }
    }, [currentDocument, mainResourcePath, path]);

    if (site === 'systemsite') {
        return <h2 style={{color: 'grey'}}>You need to create a site to see this page</h2>;
    }

    return (
        <>
            <DeviceContainer enabled={deviceView}>
                <iframe ref={iframe}
                        width="100%"
                        height="100%"
                        id="page-composer-frame-1"
                        onLoad={iFrameOnLoad}
                />
                <iframe ref={iframeSwap}
                        width="100%"
                        height="100%"
                        id="page-composer-frame-2"
                        style={{display: 'none'}}
                        onLoad={iFrameOnLoad}
                />
            </DeviceContainer>
            {currentDocument && (
                <Portal target={currentDocument.documentElement.querySelector('body')}>
                    <div id="portal--" className={styles.root}>
                        <Boxes currentDocument={currentDocument}
                               currentFrameRef={iframe}
                               onSaved={() => {
                                   setTimeout(
                                       () => {
                                           refresh();
                                       }
                                       , 100);
                               }}
                        />
                        <Infos currentDocument={currentDocument}/>
                    </div>
                </Portal>
            )}
        </>
    );
};

EditFrame.propTypes = {
    deviceView: PropTypes.bool
};
