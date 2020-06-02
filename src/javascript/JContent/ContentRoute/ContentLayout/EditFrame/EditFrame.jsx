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

export const EditFrame = () => {
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

    const iFrameOnLoad = () => {
        const currentDocument = iframe.current.contentDocument;
        const framePath = currentDocument.querySelector('[jahiatype=mainmodule]')?.getAttribute('path');
        if (framePath && framePath !== path) {
            dispatch(cmGoto({path: framePath}));
        }

        setCurrentDocument(currentDocument);
    };

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

            iframe.current.contentWindow.location.reload();
        } else if (operation === 'rename') {
            iframe.current.contentWindow.location.reload();
        } else if (operation === 'update') {
            client.cache.flushNodeEntryById(nodeUuid);
        }

        iframe.current.contentWindow.location.reload();
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
            <iframe ref={iframe}
                    width="100%"
                    height="100%"
                    id="page-composer-frame"
                    onLoad={iFrameOnLoad}
            />
            {currentDocument && (
                <Portal target={currentDocument.documentElement.querySelector('body')}>
                    <div id="portal--" className={styles.root}>
                        <Boxes currentDocument={currentDocument}/>
                        <Infos currentDocument={currentDocument}/>
                    </div>
                </Portal>
            )}
        </>
    );
};
