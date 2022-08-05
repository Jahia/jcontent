import React, {useEffect, useRef, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
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

export const EditFrame = ({isDeviceView}) => {
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

    const iFrameOnLoad = event => {
        const loadedIframe = event.currentTarget;
        if (loadedIframe.contentWindow.location.href !== 'about:blank') {
            if (iframe.current !== loadedIframe) {
                iframeSwap.current = iframe.current;
                iframe.current = loadedIframe;
                setTimeout(() => {
                    const pos = {
                        scrollLeft: iframeSwap.current.contentWindow.pageXOffset || iframeSwap.current.contentDocument.documentElement.scrollLeft,
                        scrollTop: iframeSwap.current.contentWindow.pageYOffset || iframeSwap.current.contentDocument.documentElement.scrollTop
                    };
                    iframeSwap.current.style.display = 'none';
                    iframe.current.style.display = 'block';
                    iframe.current.contentWindow.scrollTo(pos.scrollLeft, pos.scrollTop);
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
                refresh();
            }
        });

        registerContentModificationEventHandler(onGwtContentModification);

        return () => {
            unsetRefetcher(refetchTypes.CONTENT_DATA);
            unregisterContentModificationEventHandler(onGwtContentModification);
        };
    });

    const deviceParam = (isDeviceView && device) ? ('&channel=' + device) : '';

    useEffect(() => {
        if (currentDocument) {
            const framePath = currentDocument.querySelector('[jahiatype=mainmodule]')?.getAttribute('path');
            if (path === framePath && previousDevice.current === deviceParam) {
                // Clone all styles with doubled classname prefix
                const head = currentDocument.querySelector('head');
                document.querySelectorAll('style[styleloader]').forEach(s => {
                    const clone = s.cloneNode(true);
                    clone.textContent = prefixCssSelectors(clone.textContent, '.' + styles.root);
                    currentDocument.adoptNode(clone);
                    head.appendChild(clone);
                });
            } else {
                iframe.current.contentWindow.location.href = `${window.contextJsParameters.contextPath}/cms/editframe/default/${language}${path}.html?redirect=false${deviceParam}`;
                previousDevice.current = deviceParam;
            }
        } else if (path && !path.endsWith('/')) {
            iframe.current.contentWindow.location.href = `${window.contextJsParameters.contextPath}/cms/editframe/default/${language}${path}.html?redirect=false${deviceParam}`;
            previousDevice.current = deviceParam;
        }
    }, [currentDocument, path, previousDevice, deviceParam, language]);

    if (site === 'systemsite') {
        return <h2 style={{color: 'grey'}}>You need to create a site to see this page</h2>;
    }

    return (
        <>
            <DeviceContainer enabled={isDeviceView} device={device} setDevice={setDevice}>
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
                    <div className={styles.root}>
                        <Boxes currentDocument={currentDocument}
                               currentFrameRef={iframe}
                               onSaved={() => {
                                   refresh();
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
    isDeviceView: PropTypes.bool
};
