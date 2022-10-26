import React, {useEffect, useRef} from 'react';
import {ArrowUp, Button, Typography} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import {useNodeInfo} from '@jahia/data-helper';
import classnames from 'clsx';
import styles from './Box.scss';
import publicationStatusStyles from './PublicationStatus.scss';
import {DisplayAction, registry} from '@jahia/ui-extender';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import {useDragSource} from './useDragSource';
import {useDropTarget} from './useDropTarget';
import PublicationStatus from '~/JContent/PublicationStatus';

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
    const rect = element.getBoundingClientRect();
    const scrollLeft = element.ownerDocument.documentElement.scrollLeft;
    const scrollTop = element.ownerDocument.documentElement.scrollTop;
    const path = element.getAttribute('path');
    const {node} = useNodeInfo({path, language}, {
        getDisplayName: true,
        getAggregatedPublicationInfo: true,
        getProperties: ['jcr:mixinTypes', 'jcr:lastModified', 'jcr:lastModifiedBy', 'j:lastPublished', 'j:lastPublishedBy'],
        getOperationSupport: true,
        getPrimaryNodeType: true
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

    const {onDragEnd, onDragStart, dragClassName} = useDragSource({element});

    const {onDragEnter, onDragLeave, onDragOver, onDrop, dropClassName} = useDropTarget({
        parent,
        element,
        onSaved,
        enabledClassName: styles.dropTarget
    });

    useEffect(() => {
        if (parent) {
            element.classList.add(dropClassName);
            element.addEventListener('dragenter', onDragEnter);
            element.addEventListener('dragleave', onDragLeave);
            element.addEventListener('dragover', onDragOver);
            element.addEventListener('drop', onDrop);
        }

        return () => {
            element.classList.remove(dropClassName);
            element.removeEventListener('dragenter', onDragEnter);
            element.removeEventListener('dragleave', onDragLeave);
            element.removeEventListener('dragover', onDragOver);
            element.removeEventListener('drop', onDrop);
        };
    }, [dropClassName, element, onDragEnter, onDragLeave, onDragOver, onDrop, parent]);

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

    return (
        <>
            <div ref={rootDiv}
                 className={classnames(styles.root, styles['color_' + color])}
                 style={currentOffset}
            >
                <div className={styles.rel} style={{height: 24 + rect.height}}>
                    <div ref={div}
                         draggable
                         className={classnames(styles.sticky, dragClassName)}
                         data-jahia-parent={element.getAttribute('id')}
                         onClick={onSelect}
                         onMouseOver={onMouseOver}
                         onMouseOut={onMouseOut}
                         onDragStart={e => {
                             rootElementRef.current.classList.add(styles.dragging);
                             onDragStart(e);
                         }}
                         onDragEnd={e => {
                             rootElementRef.current.classList.remove(styles.dragging);
                             onDragEnd(e);
                         }}
                    >
                        <div className={classnames(styles.header, styles['color_' + color])}>
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
