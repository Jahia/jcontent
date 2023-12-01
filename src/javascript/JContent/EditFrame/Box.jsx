import React, {useEffect, useRef, useState} from 'react';
import {Checkbox, HandleDrag} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import styles from './Box.scss';
import {useNodeDrag} from '~/JContent/dnd/useNodeDrag';
import editStyles from './EditFrame.scss';
import {useNodeDrop} from '~/JContent/dnd/useNodeDrop';
import {DefaultBar} from '~/JContent/EditFrame/DefaultBar';
import {getBoundingBox} from '~/JContent/EditFrame/EditFrame.utils';
import {Breadcrumbs} from './Breadcrumbs';
import {findAvailableBoxConfig} from '../JContent.utils';

const reposition = function (element, currentOffset, setCurrentOffset, isHeaderDisplayed) {
    const box = getBoundingBox(element, isHeaderDisplayed);
    if (box.top !== currentOffset.top || box.left !== currentOffset.left || box.width !== currentOffset.width || box.height !== currentOffset.height) {
        setCurrentOffset(box);
    }
};

const processCustomBoxConfigIfExists = node => {
    const pageBuilderBoxConfig = findAvailableBoxConfig(node);

    const Bar = (pageBuilderBoxConfig && pageBuilderBoxConfig.Bar) || DefaultBar;

    let borderColorCurrent = 'var(--color-gray)';
    let borderColorSelected = 'var(--color-accent)';
    if (pageBuilderBoxConfig) {
        const borderColors = pageBuilderBoxConfig.borderColors;
        if (borderColors) {
            borderColorCurrent = borderColors.hover ? borderColors.hover : borderColorCurrent;
            borderColorSelected = borderColors.selected ? borderColors.selected : borderColorSelected;
        }
    }

    return {Bar, borderColorCurrent, borderColorSelected, isBarAlwaysDisplayed: pageBuilderBoxConfig?.isBarAlwaysDisplayed};
};

const adaptContentPositionAndSize = element => {
    if (element.id === element.parentElement.firstChild.id) {
        element.parentElement.classList.add(editStyles.parentPadding);
    } else {
        element.classList.add(editStyles.marginTop);
    }

    element.classList.add(editStyles.smallerBox);
};

export const Box = React.memo(({
    node,
    element,
    breadcrumbs,
    entries,
    language,
    displayLanguage,
    addIntervalCallback,
    onMouseOver,
    onMouseOut,
    onClick,
    onSelect,
    setCurrentElement,
    onSaved,
    rootElementRef,
    currentFrameRef,
    isHeaderDisplayed,
    isCurrent,
    isSelected,
    isActionsHidden,
    onDoubleClick,
    setDraggedOverlayPosition,
    calculateDropTarget
}) => {
    const ref = useRef(element);
    const [currentOffset, setCurrentOffset] = useState(getBoundingBox(element, isHeaderDisplayed));
    const [{dragging, isAnythingDragging}, drag] = useNodeDrag({dragSource: node});

    useEffect(() => {
        // Disable mouse events to prevent showing boxes when dragging
        if (!isAnythingDragging) {
            element.addEventListener('mouseenter', onMouseOver);
            element.addEventListener('mouseleave', onMouseOut);
            element.addEventListener('click', onClick);
            element.addEventListener('dblclick', onDoubleClick);
        }

        return () => {
            element.removeEventListener('mouseenter', onMouseOver);
            element.removeEventListener('mouseleave', onMouseOut);
            element.removeEventListener('click', onClick);
            element.removeEventListener('dblclick', onDoubleClick);
        };
    }, [element, node, onMouseOut, onMouseOver, onClick, onDoubleClick, isAnythingDragging]);

    element.dataset.current = isCurrent;

    let parent = element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent);
    if (!parent) {
        parent = element.parentElement.closest('[jahiatype=module]');

        if (parent) {
            element.dataset.jahiaParent = parent.id;
        }
    }

    const rootDiv = useRef();

    const [{isCanDrop, insertPosition, destParent, isOver}, drop] = useNodeDrop({
        dropTarget: node,
        orderable: Boolean(parent),
        entries,
        onSaved,
        pos: {before: element.dataset.prevPos, after: element.dataset.nextPos}
    });

    drop(ref);

    useEffect(() => {
        if (dragging) {
            setDraggedOverlayPosition(currentOffset);
            element.ownerDocument.body.classList.add(editStyles.disablePointerEvents);
        }

        return () => {
            setDraggedOverlayPosition(null);
            element.ownerDocument.body.classList.remove(editStyles.disablePointerEvents);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dragging, element, rootElementRef, setDraggedOverlayPosition]);

    useEffect(() => {
        element.classList.add(editStyles.enablePointerEvents);

        return () => {
            element.classList.remove(editStyles.enablePointerEvents);
        };
    }, [element]);

    useEffect(() => {
        if (isCanDrop) {
            const pos = (insertPosition === 'insertBefore') ? element.dataset.prevPos :
                ((insertPosition === 'insertAfter') ? element.dataset.nextPos : null);

            calculateDropTarget(destParent?.path, node.path, pos, true);
        } else if (isOver) {
            calculateDropTarget(destParent?.path, node.path, null, false);
        }

        return () => {
            calculateDropTarget();
        };
    }, [isCanDrop, insertPosition, destParent, node, element, calculateDropTarget, isOver]);

    useEffect(() => addIntervalCallback(() => reposition(element, currentOffset, setCurrentOffset, isHeaderDisplayed)), [addIntervalCallback, currentOffset, element, setCurrentOffset, isHeaderDisplayed]);

    const {Bar, borderColorCurrent, borderColorSelected, isBarAlwaysDisplayed} = processCustomBoxConfigIfExists(node);

    isHeaderDisplayed = isBarAlwaysDisplayed || isHeaderDisplayed;
    if (!isHeaderDisplayed && !isCurrent && !isSelected) {
        return false;
    }

    if (isBarAlwaysDisplayed) {
        adaptContentPositionAndSize(element);
    }

    reposition(element, currentOffset, setCurrentOffset, isHeaderDisplayed);

    const type = element.getAttribute('type');

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
                <Checkbox checked={isSelected} onChange={onSelect}/>
                {node && <Bar isActionsHidden={isActionsHidden} node={node} language={language} displayLanguage={displayLanguage} width={currentOffset.width} currentFrameRef={currentFrameRef} element={element}/>}
            </div>
        </div>
    );

    const boxStyle = !isAnythingDragging && breadcrumbs.length > 0 ? styles.relHeaderAndFooter : styles.relHeader;

    return (
        <div ref={rootDiv}
             className={clsx(styles.root, isBarAlwaysDisplayed ? styles.alwaysDisplayedZIndex : styles.defaultZIndex)}
             style={currentOffset}
        >
            <div className={clsx(styles.rel, isHeaderDisplayed ? boxStyle : styles.relNoHeader, isCurrent && !isSelected ? styles.current : '', isSelected ? styles.selected : '')}
                 style={{
                     '--colorCurrent': borderColorCurrent,
                     '--colorSelected': borderColorSelected
                 }}
            >
                {isHeaderDisplayed && Header}

                {!isAnythingDragging && breadcrumbs.length > 0 &&
                    <div className={clsx(styles.relFooter)}
                         data-current={isCurrent}
                         data-jahia-id={element.getAttribute('id')}
                         jahiatype="footer" // eslint-disable-line react/no-unknown-property
                         onClick={onClick}
                    >
                        <Breadcrumbs nodes={breadcrumbs} isResponsiveMode={element.getBoundingClientRect().width < 350} setCurrentElement={setCurrentElement}/>
                    </div>}
            </div>
        </div>
    );
});

Box.propTypes = {
    element: PropTypes.any,

    breadcrumbs: PropTypes.array,

    node: PropTypes.any,

    entries: PropTypes.array,

    language: PropTypes.string,

    displayLanguage: PropTypes.string,

    addIntervalCallback: PropTypes.func,

    onSaved: PropTypes.func,

    onMouseOver: PropTypes.func,

    onMouseOut: PropTypes.func,

    setCurrentElement: PropTypes.func,

    onSelect: PropTypes.func,

    onClick: PropTypes.func,

    rootElementRef: PropTypes.any,

    currentFrameRef: PropTypes.any,

    isHeaderDisplayed: PropTypes.bool,

    isCurrent: PropTypes.bool,

    isSelected: PropTypes.bool,

    isActionsHidden: PropTypes.bool,

    onDoubleClick: PropTypes.func,

    calculateDropTarget: PropTypes.func,

    setDraggedOverlayPosition: PropTypes.func
};
