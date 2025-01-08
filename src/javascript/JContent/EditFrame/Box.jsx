import React, {useEffect, useMemo, useRef, useState} from 'react';
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

const processCustomBoxConfigIfExists = (node, type) => {
    const pageBuilderBoxConfig = findAvailableBoxConfig(node);

    const Bar = (pageBuilderBoxConfig && pageBuilderBoxConfig.Bar) || DefaultBar;

    // TODO: As we use the same color for hover and selection we can simplify this, but jExperience still use it.
    // borderColor, backgroundColor, backgroundColorHovered, backgroundColorSelected
    let borderColorHovered = 'var(--color-accent_light)';
    let borderColorSelected = 'var(--color-accent_light)';
    if (pageBuilderBoxConfig) {
        const borderColors = pageBuilderBoxConfig.borderColors;
        if (borderColors) {
            borderColorHovered = borderColors.hover ? borderColors.hover : borderColorHovered;
            borderColorSelected = borderColors.selected ? borderColors.selected : borderColorSelected;
        }
    }

    const config = {
        Bar,
        borderColorHovered,
        borderColorSelected,
        isBarAlwaysDisplayed: pageBuilderBoxConfig?.isBarAlwaysDisplayed,
        isSticky: pageBuilderBoxConfig?.isSticky ?? true,
        isAbsolute: false
    };

    const isArea = type === 'area';
    const isList = type === 'list';
    const isAbsolute = type === 'absoluteArea';

    // Handle area, list and absoluteArea cases based on type
    if (isArea || isList || isAbsolute) {
        config.isBarAlwaysDisplayed = true;
        config.isSticky = false;
        config.isActionsHidden = true;
        config.isStatusHidden = true;
        config.area = {
            isAbsolute,
            isArea,
            isList
        };
    }

    return config;
};

const adaptContentPositionAndSize = element => {
    if (element.id === element.parentElement.firstChild.id) {
        element.parentElement.classList.add(editStyles.parentPadding);
    } else {
        element.classList.add(editStyles.marginTop);
    }

    element.classList.add(editStyles.smallerBox);
};

// eslint-disable-next-line complexity
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
    isHeaderHighlighted,
    isHovered,
    isClicked,
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

    element.dataset.hovered = isHovered;

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
            const nextPos = (insertPosition === 'insertAfter') ? element.dataset.nextPos : null;
            const pos = (insertPosition === 'insertBefore') ? element.dataset.prevPos : nextPos;

            calculateDropTarget(destParent?.path, node.path, pos, true);
        } else if (isOver) {
            calculateDropTarget(destParent?.path, node.path, null, false);
        }

        return () => {
            calculateDropTarget();
        };
    }, [isCanDrop, insertPosition, destParent, node, element, calculateDropTarget, isOver]);

    useEffect(() => addIntervalCallback(() =>
        reposition(
            element,
            currentOffset,
            setCurrentOffset,
            isHeaderDisplayed
        )
    ), [addIntervalCallback, currentOffset, element, setCurrentOffset, isHeaderDisplayed]);

    const type = element.getAttribute('type');

    const {Bar, borderColorHovered, borderColorSelected, isBarAlwaysDisplayed, isSticky, isActionsHidden: isActionsHiddenOverride, isStatusHidden, area} = useMemo(() => processCustomBoxConfigIfExists(node, type), [node, type]);

    isHeaderDisplayed = isBarAlwaysDisplayed || isHeaderDisplayed;
    if (!isHeaderDisplayed && !isHovered && !isSelected) {
        return false;
    }

    if (isBarAlwaysDisplayed) {
        adaptContentPositionAndSize(element);
    }

    reposition(element, currentOffset, setCurrentOffset, isHeaderDisplayed);

    const dragWithChecks = n => {
        if (type === 'existingNode' && !isActionsHidden) {
            drag(n);
        }
    };

    // Display current header through portal to be able to always position it on top of existing selection(s)
    const headerStyles = clsx(
        styles.boxHeader,
        isSticky && styles.sticky,
        'flexRow_nowrap',
        'alignCenter',
        editStyles.enablePointerEvents,
        isClicked && styles.isClicked,
        isHeaderHighlighted && styles.isHighlighted
    );

    const Header = (
        <header ref={dragWithChecks}
                className={headerStyles}
                jahiatype="header" // eslint-disable-line react/no-unknown-property
                data-hovered={isHovered}
                data-clicked={isClicked}
                data-highlighted={isHeaderHighlighted}
                data-jahia-id={element.getAttribute('id')}
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
                onClick={onClick}
                onDoubleClick={onDoubleClick}
        >
            {node &&
                <Bar
                    isActionsHidden={(isActionsHidden || isActionsHiddenOverride) && !isClicked}
                    isStatusHidden={isStatusHidden && !isClicked}
                    node={node}
                    language={language}
                    displayLanguage={displayLanguage}
                    width={currentOffset.width}
                    currentFrameRef={currentFrameRef}
                    element={element}
                    area={area}/>}
        </header>
    );

    const boxStyle = !isAnythingDragging && isClicked && breadcrumbs.length > 0 ? styles.withHeaderAndFooter : styles.withHeader;

    return (
        <div ref={rootDiv}
             className={clsx(styles.root, isBarAlwaysDisplayed ? styles.alwaysDisplayedZIndex : styles.defaultZIndex)}
             style={currentOffset}
        >
            <div className={clsx(
                styles.box,
                isHeaderDisplayed ? boxStyle : styles.withNoHeader,
                isHovered ? styles.boxHovered : '',
                (isSelected || isClicked) ? styles.boxSelected : '')}
                 style={{
                     '--borderColorHovered': borderColorHovered,
                     '--borderColorSelected': borderColorSelected
                 }}
            >
                {isHeaderDisplayed && Header}

                {!isAnythingDragging && (isHovered || isClicked) && breadcrumbs.length > 0 &&
                    <footer className={clsx(styles.boxFooter)}
                            data-hovered={isHovered}
                            data-jahia-id={element.getAttribute('id')}
                            jahiatype="footer" // eslint-disable-line react/no-unknown-property
                            onClick={onClick}
                    >
                        <Breadcrumbs nodes={breadcrumbs} setCurrentElement={setCurrentElement} onSelect={onSelect}/>
                    </footer>}
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

    isHeaderHighlighted: PropTypes.bool,

    isHovered: PropTypes.bool,

    isClicked: PropTypes.bool,

    isSelected: PropTypes.bool,

    isActionsHidden: PropTypes.bool,

    onDoubleClick: PropTypes.func,

    calculateDropTarget: PropTypes.func,

    setDraggedOverlayPosition: PropTypes.func
};
