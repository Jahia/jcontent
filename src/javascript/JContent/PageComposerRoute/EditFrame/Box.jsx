import React, {useEffect, useRef} from 'react';
import {ArrowUp, Button, Typography} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import {useNodeInfo} from '@jahia/data-helper';
import clsx from 'clsx';
import styles from './Box.scss';
import publicationStatusStyles from './PublicationStatus.scss';
import {DisplayAction, registry} from '@jahia/ui-extender';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import PublicationStatus from '~/JContent/PublicationStatus';
import {useNodeDrag} from '~/JContent/dnd/useNodeDrag';
import editStyles from './EditFrame.scss';
import {useNodeDrop} from '~/JContent/dnd/useNodeDrop';
const DefaultBar = ({node, path, onSaved, ButtonRenderer}) => (
    <>
        <DisplayAction actionKey="quickEdit" path={path} editCallback={onSaved} render={ButtonRenderer}/>
        <Typography isUpperCase
                    isNowrap
                    className="flexFluid"
                    variant="caption"
        >{node ? node.displayName : ''}
        </Typography>
    </>
);

DefaultBar.propTypes = {
    node: PropTypes.object,
    path: PropTypes.string,
    ButtonRenderer: PropTypes.func,
    onSaved: PropTypes.func
};

export const Box = ({
    element,
    language,
    color,
    onSelect,
    onGoesUp,
    onMouseOver,
    onMouseOut,
    onSaved,
    rootElementRef
}) => {
    const ref = useRef(element);
    const rect = element.getBoundingClientRect();
    const scrollLeft = element.ownerDocument.documentElement.scrollLeft;
    const scrollTop = element.ownerDocument.documentElement.scrollTop;
    const path = element.getAttribute('path');
    const {node} = useNodeInfo({path, language}, {
        getDisplayName: true,
        getAggregatedPublicationInfo: true,
        getProperties: ['jcr:mixinTypes', 'jcr:lastModified', 'jcr:lastModifiedBy', 'j:lastPublished', 'j:lastPublishedBy'],
        getOperationSupport: true,
        getPrimaryNodeType: true,
        getParent: true
    });

    let parent = element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent);
    if (!parent) {
        parent = element.parentElement;
        while (parent && parent.getAttribute('jahiatype') !== 'module') {
            parent = parent.parentElement;
        }

        if (parent) {
            element.dataset.jahiaParent = parent.id;
        }
    }

    const ButtonRenderer = getButtonRenderer({
        defaultButtonProps: {
            color,
            variant: 'outlined',
            className: styles.button
        }
    });

    const rootDiv = useRef();
    const div = useRef();

    const left = Math.max(0, (rect.left + scrollLeft - 4));
    const width = Math.min(document.documentElement.clientWidth - left, rect.width + 8);
    const top = rect.top + scrollTop;
    const height = rect.height + 4;
    const currentOffset = {top, left, width, height};

    const nodeWithProps = {};
    if (node) {
        Object.assign(nodeWithProps, node);
        node.properties.filter(p => p.name !== 'jcr:mixinTypes').forEach(p => {
            nodeWithProps[p.name.substr(p.name.indexOf(':') + 1)] = p;
        });
    }

    const customBarItem = node && registry.get('customContentEditorBar', node.primaryNodeType.name);
    const Bar = (customBarItem && customBarItem.component) || DefaultBar;

    const {dragging} = useNodeDrag({dragSource: node, ref: div});
    const {canDrop, insertPosition, destParent} = useNodeDrop({dropTarget: parent && node, ref, orderable: true, onSaved});

    useEffect(() => {
        if (dragging) {
            element.ownerDocument.body.classList.add(editStyles.disablePointerEvents);
            element.classList.add(editStyles.dragging);
            rootElementRef.current?.classList?.add?.(styles.dragging);
        }

        return () => {
            element.ownerDocument.body.classList.remove(editStyles.disablePointerEvents);
            element.classList.remove(editStyles.dragging);
            rootElementRef.current?.classList?.remove?.(styles.dragging);
        };
    }, [dragging]);

    useEffect(() => {
        if (parent) {
            element.classList.add(editStyles.enablePointerEvents);
        }

        return () => {
            element.classList.remove(editStyles.enablePointerEvents);
        };
    }, [parent]);

    useEffect(() => {
        if (canDrop) {
            element.classList.add(styles['dropTarget_' + insertPosition]);
        }

        return () => {
            element.classList.remove(styles['dropTarget_' + insertPosition]);
        };
    }, [canDrop, insertPosition, destParent]);

    return (
        <>
            <div ref={rootDiv}
                 className={clsx(styles.root, styles['color_' + color])}
                 style={currentOffset}
            >
                <div className={styles.rel} style={{height: 24 + rect.height}}>
                    <div ref={div}
                         className={clsx(styles.sticky, editStyles.enablePointerEvents)}
                         data-jahia-parent={element.getAttribute('id')}
                         onClick={onSelect}
                         onMouseOver={onMouseOver}
                         onMouseOut={onMouseOut}
                    >
                        <div className={clsx(styles.header, styles['color_' + color])}>
                            {node && <PublicationStatus node={nodeWithProps} className={publicationStatusStyles.root}/>}
                            {onGoesUp && (
                                <Button className={styles.button}
                                        variant="outlined"
                                        color={color}
                                        label="Up"
                                        icon={<ArrowUp/>}
                                        onClick={onGoesUp}
                                />
                            )}
                            <Bar node={node} path={path} element={element} ButtonRenderer={ButtonRenderer} onSaved={onSaved}/>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

Box.propTypes = {
    element: PropTypes.any,

    language: PropTypes.string,

    color: PropTypes.string,

    onSaved: PropTypes.func,

    onSelect: PropTypes.func,

    onGoesUp: PropTypes.func,

    onMouseOver: PropTypes.func,

    onMouseOut: PropTypes.func,

    rootElementRef: PropTypes.any
};
