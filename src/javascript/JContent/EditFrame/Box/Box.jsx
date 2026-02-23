import React, {useEffect, useMemo, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import styles from './Box.scss';
import {useBoxStatus} from './useBoxStatus';
import {useNodeDragPB} from '~/JContent/dnd/useNodeDragPB';
import editStyles from '../EditFrame.scss';
import {useNodeDropPB} from '~/JContent/dnd/useNodeDropPB';
import {DefaultBar} from '~/JContent/EditFrame/DefaultBar';
import {getBoundingBox} from '~/JContent/EditFrame/EditFrame.utils';
import {Breadcrumbs} from '../Breadcrumbs';
import {findAvailableBoxConfig, hasMixin, isDescendant} from '../../JContent.utils';
import {useTranslation} from 'react-i18next';
import {shallowEqual, useSelector} from 'react-redux';

const reposition = function (element, currentOffset, setCurrentOffset, isHeaderDisplayed) {
    const box = getBoundingBox(element, isHeaderDisplayed);
    if (box.top !== currentOffset.top || box.left !== currentOffset.left || box.width !== currentOffset.width || box.height !== currentOffset.height) {
        setCurrentOffset(box);
    }
};

const processCustomBoxConfigIfExists = (node, type, isSomethingSelected) => {
    const pageBuilderBoxConfig = findAvailableBoxConfig(node);

    const Bar = (pageBuilderBoxConfig && pageBuilderBoxConfig.Bar) || DefaultBar;

    const defaultBorderColor = isSomethingSelected ? 'var(--color-accent_dark)' : 'var(--color-accent_light)';
    const config = {
        Bar,
        borderColor: pageBuilderBoxConfig?.borderColor || defaultBorderColor,
        backgroundColorBase: pageBuilderBoxConfig?.backgroundColors?.base || 'var(--color-gray_light_plain40)',
        backgroundColorHovered: pageBuilderBoxConfig?.backgroundColors?.hover || 'var(--color-gray_light)',
        backgroundColorSelected: pageBuilderBoxConfig?.backgroundColors?.selected || 'var(--color-accent_plain20)',
        isActionsHidden: pageBuilderBoxConfig?.isActionsHidden,
        isStatusHidden: pageBuilderBoxConfig?.isStatusHidden,
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
        config.isActionsHidden = isAbsolute || isArea;
        config.isStatusHidden = isAbsolute || isArea;
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

const getBreadcrumbsForPath = ({node, nodes, path}) => {
    const breadcrumbs = [];
    if (!node) {
        return breadcrumbs;
    }

    const pathFragments = node.path.split('/');
    pathFragments.pop();

    let lookUpPath = pathFragments.join('/');
    while (lookUpPath !== path && nodes[lookUpPath]) {
        breadcrumbs.unshift(nodes[lookUpPath]);
        pathFragments.pop();
        lookUpPath = pathFragments.join('/');
    }

    return breadcrumbs;
};

// eslint-disable-next-line complexity
export const Box = React.memo(({
    nodes,
    node,
    element,
    entries,
    language,
    displayLanguage,
    addIntervalCallback,
    onMouseOver,
    onMouseOut,
    onClick,
    onSelect,
    clickedElement,
    setClickedElement,
    onSaved,
    currentFrameRef,
    isHeaderHighlighted,
    onDoubleClick,
    setDraggedOverlayPosition,
    calculateDropTarget,
    registerHoverManager,
    nodeDragData,
    nodeDropData
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const ref = useRef(element);
    const {selection, path} = useSelector(state => ({selection: state.jcontent.selection, path: state.jcontent.path}), shallowEqual);
    let isHeaderDisplayed = useMemo(() => (clickedElement && node.path === clickedElement.path) || selection.includes(node.path) ||
        (isHovered && selection.length > 0 && !selection.some(selectionElement => isDescendant(node.path, selectionElement))), [clickedElement, isHovered, node.path, selection]);
    const breadcrumbs = useMemo(() => {
        return ((clickedElement && node.path === clickedElement.path) || selection.includes(node.path) ||
            (isHovered && selection.length > 0 &&
                !selection.some(selectionElement => isDescendant(node.path, selectionElement)))) ?
            getBreadcrumbsForPath({node, nodes, path}) : [];
    }, [clickedElement, isHovered, node, nodes, path, selection]);
    const [currentOffset, setCurrentOffset] = useState(getBoundingBox(element, isHeaderDisplayed));
    const [{dragging, isAnythingDragging, isDraggable, isCanDrag}, drag] = useNodeDragPB({dragSource: node, nodeDragData});
    const {t} = useTranslation('jcontent');
    const isMarkedForDeletionRoot = hasMixin(node, 'jmix:markedForDeletionRoot');

    const isClicked = clickedElement && node.path === clickedElement.path;
    const {isSelected, isSomethingSelected, isActionsHidden} = useMemo(() => {
        const isSelected = selection.includes(node.path);
        const isSomethingSelected = selection.length > 0;
        const isActionsHidden = isSomethingSelected;
        return {isSelected, isSomethingSelected, isActionsHidden};
    }, [node.path, selection]);

    useEffect(() => {
        return registerHoverManager(node.path, setIsHovered);
    }, [registerHoverManager, node.path]);

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

    element.dataset.hovered = isHovered && !isAnythingDragging;

    let parent = element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent);
    if (!parent) {
        parent = element.parentElement.closest('[jahiatype=module]');

        if (parent) {
            element.dataset.jahiaParent = parent.id;
        }
    }

    const rootDiv = useRef();

    const [{isCanDrop, insertPosition, destParent, isOver}, drop] = useNodeDropPB({
        dropTarget: node,
        orderable: Boolean(parent),
        entries,
        onSaved: () => {
            onSaved();
        },
        pos: {before: element.dataset.prevPos, after: element.dataset.nextPos},
        nodeDropData
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
    }, [dragging, element, currentOffset, setDraggedOverlayPosition]);

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

    const {
        Bar,
        borderColor,
        backgroundColorBase,
        backgroundColorHovered,
        backgroundColorSelected,
        isBarAlwaysDisplayed,
        isSticky,
        isActionsHidden: isActionsHiddenOverride,
        isStatusHidden,
        area
    } = useMemo(() => processCustomBoxConfigIfExists(node, type, isSomethingSelected), [node, type, isSomethingSelected]);

    const {isStatusHighlighted, displayStatuses, BoxStatus} = useBoxStatus({
        nodes,
        node,
        element,
        language,
        isMarkedForDeletionRoot,
        isEnabled: !isClicked && !isAnythingDragging && !isMarkedForDeletionRoot
    });

    isHeaderDisplayed = !isSomethingSelected && (isBarAlwaysDisplayed || isHeaderDisplayed);
    if (!isHeaderDisplayed && !isHovered && !isSelected && !isStatusHighlighted) {
        return false;
    }

    if (isBarAlwaysDisplayed) {
        adaptContentPositionAndSize(element);
    }

    reposition(element, currentOffset, setCurrentOffset, isHeaderDisplayed);

    const dragWithChecks = n => {
        const draggableTypes = ['existingNode', 'list'];
        if (draggableTypes.includes(type) && !isActionsHidden) {
            drag(n);
        }
    };

    // Display current header through portal to be able to always position it on top of existing selection(s)
    const headerStyles = clsx(
        styles.boxHeader,
        isSticky && styles.sticky,
        'flexRow_nowrap',
        'alignCenter',
        dragging && styles.dragging,
        editStyles.enablePointerEvents,
        isClicked && styles.isClicked,
        isHeaderHighlighted && styles.isHighlighted
    );

    const Header = (
        <header ref={dragWithChecks}
                className={headerStyles}
                jahiatype="header" // eslint-disable-line react/no-unknown-property
                data-hovered={isHovered && !isAnythingDragging}
                data-clicked={isClicked}
                data-highlighted={isHeaderHighlighted}
                data-jahia-id={element.getAttribute('id')}
                style={{
                    '--backgroundColorBase': backgroundColorBase,
                    '--backgroundColorHovered': backgroundColorHovered,
                    '--backgroundColorSelected': backgroundColorSelected
                }}
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
                onClick={onClick}
                onDoubleClick={onDoubleClick}
        >
            {node && !dragging &&
                <Bar
                    isActionsHidden={(isActionsHidden || isActionsHiddenOverride) && !isClicked}
                    isStatusHidden={(isStatusHidden && !isClicked)}
                    node={node}
                    language={language}
                    displayLanguage={displayLanguage}
                    width={currentOffset.width}
                    currentFrameRef={currentFrameRef}
                    element={element}
                    dragProps={{isDraggable, isCanDrag}}
                    area={area}/>}
        </header>
    );

    const boxStyle = !isAnythingDragging && isClicked && breadcrumbs.length > 0 ? styles.withHeaderAndFooter : styles.withHeader;
    const hasNoTranslationOverlay = displayStatuses.has('noTranslation') &&
        !isMarkedForDeletionRoot &&
        !element.hasChildNodes();

    return (
        <div ref={rootDiv}
             className={clsx(styles.root, isBarAlwaysDisplayed ? styles.alwaysDisplayedZIndex : styles.defaultZIndex)}
             data-sel-role="page-builder-box"
             data-jahia-path={node.path}
             data-box-hovered={isHovered}
             data-box-selected={isSelected}
             data-box-clicked={isClicked}
             data-jahia-id={element.getAttribute('id')}
             style={currentOffset}
        >
            <div className={clsx(
                styles.box,
                isHeaderDisplayed ? boxStyle : styles.withNoHeader,
                (isHovered && !isAnythingDragging) ? styles.boxHovered : '',
                (isSelected || isClicked) && !isAnythingDragging ? styles.boxSelected : '',
                (isStatusHighlighted) && styles.boxHighlighted,
                displayStatuses.has('notVisible') && styles.boxNotVisible,
                (hasNoTranslationOverlay) && styles.noDisplayOverlay)}
                 style={{
                     '--borderColor': borderColor
                 }}
            >
                {isHeaderDisplayed && Header}
                {BoxStatus}

                {hasNoTranslationOverlay &&
                    <div className={styles.overlayLabel} style={{height: currentOffset.height}}>
                        {t('label.contentManager.pageBuilder.emptyContent')}
                    </div>}

                {!isAnythingDragging && !isSomethingSelected && (isHovered || isClicked) && breadcrumbs.length > 0 &&
                    <footer className={clsx(styles.boxFooter)}
                            data-hovered={isHovered && !isAnythingDragging}
                            data-jahia-id={element.getAttribute('id')}
                            jahiatype="footer" // eslint-disable-line react/no-unknown-property
                            style={{
                                '--backgroundColorSelected': backgroundColorSelected
                            }}
                            onClick={onClick}
                    >
                        <Breadcrumbs currentNode={node} nodes={breadcrumbs} setClickedElement={setClickedElement} onSelect={onSelect}/>
                    </footer>}
            </div>
        </div>
    );
});

Box.propTypes = {
    element: PropTypes.any,

    nodes: PropTypes.array,

    node: PropTypes.any,

    entries: PropTypes.array,

    language: PropTypes.string,

    displayLanguage: PropTypes.string,

    addIntervalCallback: PropTypes.func,

    onSaved: PropTypes.func,

    onMouseOver: PropTypes.func,

    onMouseOut: PropTypes.func,

    setClickedElement: PropTypes.func,

    onSelect: PropTypes.func,

    onClick: PropTypes.func,

    currentFrameRef: PropTypes.any,

    isHeaderHighlighted: PropTypes.bool,

    onDoubleClick: PropTypes.func,

    calculateDropTarget: PropTypes.func,

    setDraggedOverlayPosition: PropTypes.func,

    registerHoverManager: PropTypes.func,

    nodeDragData: PropTypes.object,

    nodeDropData: PropTypes.object,

    clickedElement: PropTypes.any
};
