import React, {useEffect, useRef, useState} from 'react';
import {HandleDrag} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import styles from './Box.scss';
import {registry} from '@jahia/ui-extender';
import {useNodeDrag} from '~/JContent/dnd/useNodeDrag';
import editStyles from './EditFrame.scss';
import {useNodeDrop} from '~/JContent/dnd/useNodeDrop';
import {DefaultBar} from '~/JContent/EditFrame/DefaultBar';
import {getCoords} from '~/JContent/EditFrame/EditFrame.utils';

function getBoundingBox(element) {
    const rect = getCoords(element);

    const left = Math.max(2, (rect.left - 4));
    const width = Math.min(element.ownerDocument.documentElement.clientWidth - left - 2, rect.width + 8);
    const top = rect.top;
    const height = rect.height + 4;
    return {top, left, width, height};
}

const reposition = function (element, currentOffset, setCurrentOffset) {
    const box = getBoundingBox(element);
    if (box.top !== currentOffset.top || box.left !== currentOffset.left || box.width !== currentOffset.width || box.height !== currentOffset.height) {
        setCurrentOffset(box);
    }
};

export const Box = React.memo(({
    node,
    element,
    entries,
    language,
    displayLanguage,
    addIntervalCallback,
    onMouseOver,
    onMouseOut,
    onClick,
    onSaved,
    rootElementRef,
    currentFrameRef,
    isHeaderDisplayed,
    isCurrent,
    isSelected,
    isActionsHidden,
    onDoubleClick
}) => {
    const ref = useRef(element);
    const [currentOffset, setCurrentOffset] = useState(getBoundingBox(element));

    useEffect(() => {
        element.addEventListener('mouseover', onMouseOver);
        element.addEventListener('mouseout', onMouseOut);
        element.addEventListener('click', onClick);
        element.addEventListener('dblclick', onDoubleClick);

        return () => {
            element.removeEventListener('mouseover', onMouseOver);
            element.removeEventListener('mouseout', onMouseOut);
            element.removeEventListener('click', onClick);
            element.removeEventListener('dblclick', onDoubleClick);
        };
    }, [element, node, onMouseOut, onMouseOver, onClick, onDoubleClick]);

    element.dataset.current = isCurrent;

    let parent = element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent);
    if (!parent) {
        parent = element.closest('[jahiatype=module]');

        if (parent) {
            element.dataset.jahiaParent = parent.id;
        }
    }

    const rootDiv = useRef();

    const [{dragging}, drag] = useNodeDrag({dragSource: node});
    const [{isCanDrop, insertPosition, destParent}, drop] = useNodeDrop({
        dropTarget: parent && node,
        orderable: true,
        entries,
        onSaved
    });

    drop(ref);

    useEffect(() => {
        const currentRootElement = rootElementRef.current;
        if (dragging) {
            element.ownerDocument.body.classList.add(editStyles.disablePointerEvents);
            element.classList.add(editStyles.dragging);
            currentRootElement?.classList?.add?.(styles.dragging);
        }

        return () => {
            element.ownerDocument.body.classList.remove(editStyles.disablePointerEvents);
            element.classList.remove(editStyles.dragging);
            currentRootElement?.classList?.remove?.(styles.dragging);
        };
    }, [dragging, element, rootElementRef]);

    useEffect(() => {
        if (parent) {
            element.classList.add(editStyles.enablePointerEvents);
        }

        return () => {
            element.classList.remove(editStyles.enablePointerEvents);
        };
    }, [parent, element]);

    useEffect(() => {
        const classname = insertPosition ? styles['dropTarget_' + insertPosition] : styles.dropTarget;
        if (isCanDrop) {
            element.style.setProperty('--droplabel', `"[${destParent?.name?.replace(/[\u00A0-\u9999<>&]/g, i => '&#' + i.charCodeAt(0) + ';')}]"`);
            element.classList.add(classname);
        }

        return () => {
            element.classList.remove(classname);
            element.style.removeProperty('--droplabel');
        };
    }, [isCanDrop, insertPosition, destParent, element]);

    useEffect(() => addIntervalCallback(() => reposition(element, currentOffset, setCurrentOffset)), [addIntervalCallback, currentOffset, element, setCurrentOffset]);

    if (!isCurrent && !isSelected) {
        return false;
    }

    reposition(element, currentOffset, setCurrentOffset);

    const type = element.getAttribute('type');

    const customBarItem = node && registry.get('customContentEditorBar', node.primaryNodeType.name);
    const Bar = (customBarItem && customBarItem.component) || DefaultBar;

    // Display current header through portal to be able to always position it on top of existing selection(s)
    const headerProps = {
        className: clsx(styles.sticky, 'flexRow_nowrap', 'alignCenter', editStyles.enablePointerEvents)
    };
    const Header = (
        <div {...headerProps}
             jahiatype="header" // eslint-disable-line react/no-unknown-property
             data-current={isCurrent}
             data-jahia-id={element.getAttribute('id')}
             onMouseOver={onMouseOver}
             onMouseOut={onMouseOut}
             onClick={onClick}
             onDoubleClick={onDoubleClick}
        >
            <div className={clsx(styles.header, 'flexRow_nowrap', 'alignCenter')}>
                {type === 'existingNode' && !isActionsHidden && (
                    <div ref={drag} className={clsx(editStyles.enablePointerEvents, styles.dragHandle, 'flexRow_center', 'alignCenter')}>
                        <HandleDrag size="default"/>
                    </div>
                )}
                {node && <Bar isActionsHidden={isActionsHidden} node={node} language={language} displayLanguage={displayLanguage} width={currentOffset.width} currentFrameRef={currentFrameRef}/>}
            </div>
        </div>
    );

    return (
        <div ref={rootDiv}
             className={styles.root}
             style={currentOffset}
        >
            <div className={clsx(styles.rel, isHeaderDisplayed ? styles.relHeader : styles.relNoHeader)}>
                {isHeaderDisplayed && Header}
            </div>
        </div>
    );
});

Box.propTypes = {
    element: PropTypes.any,

    node: PropTypes.any,

    entries: PropTypes.array,

    language: PropTypes.string,

    displayLanguage: PropTypes.string,

    addIntervalCallback: PropTypes.func,

    onSaved: PropTypes.func,

    onMouseOver: PropTypes.func,

    onMouseOut: PropTypes.func,

    onClick: PropTypes.func,

    rootElementRef: PropTypes.any,

    currentFrameRef: PropTypes.any,

    isHeaderDisplayed: PropTypes.bool,

    isCurrent: PropTypes.bool,

    isSelected: PropTypes.bool,

    isActionsHidden: PropTypes.bool,

    onDoubleClick: PropTypes.func
};
