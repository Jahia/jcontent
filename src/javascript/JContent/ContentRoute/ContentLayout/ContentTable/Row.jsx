import React, {useRef} from 'react';
import {useNodeDrop} from '~/JContent/dnd/useNodeDrop';
import {useNodeDrag} from '~/JContent/dnd/useNodeDrag';
import {TableRow} from '@jahia/moonstone';
import clsx from 'clsx';
import css from '~/JContent/ContentRoute/ContentLayout/ContentTable/ContentTable.scss';
import {allowDoubleClickNavigation, booleanValue} from '~/JContent/JContent.utils';
import {ContextualMenu} from '@jahia/ui-extender';
import PropTypes from 'prop-types';
import {useFileDrop} from '~/JContent/dnd/useFileDrop';
import JContentConstants from '~/JContent/JContent.constants';

export const Row = ({
    row,
    selection,
    sidePanelSelection,
    isPreviewOpened,
    setSelectedItemIndex,
    onPreviewSelect,
    doubleClickNavigation,
    tableConfig,
    index,
    virtualizer,
    virtualRow,
    revealPath
}) => {
    const rowProps = row.getRowProps();
    const node = row.original;
    const isPreviewSelected = node.path === sidePanelSelection && isPreviewOpened;

    const contextualMenu = useRef();

    const ref = useRef(null);
    const [{isCanDrop}, drop] = useNodeDrop({
        dropTarget: node,
        expandTargetOnDrop: booleanValue(tableConfig.dnd?.expandTargetOnDrop),
        recordUndo: booleanValue(tableConfig.dnd?.recordUndo)
    });
    const [{isCanDrop: isCanDropFile}, dropFile] = useFileDrop({uploadType: node.primaryNodeType.name === 'jnt:folder' && JContentConstants.mode.UPLOAD, uploadPath: node.path});
    const [{dragging}, drag] = useNodeDrag({dragSource: node});

    if (booleanValue(tableConfig.dnd?.canDrop)) {
        drop(ref);
    }

    if (booleanValue(tableConfig.dnd?.canDropFile)) {
        dropFile(ref);
    }

    if (booleanValue(tableConfig.dnd?.canDrag)) {
        drag(ref);
    }

    row.ref = ref;

    const openContextualMenu = event => {
        contextualMenu.current(event);
    };

    // Navigating makes the row the current node (header, breadcrumb, "create under" actions).
    // Accordions that are managed entirely from the main panel opt into doing it on a single
    // click, the expander and the selection checkbox stop propagation so they are unaffected.
    const navigateToRow = allowDoubleClickNavigation(
        node.primaryNodeType.name,
        node.subNodes ? node.subNodes.pageInfo.totalCount : null,
        () => doubleClickNavigation(node)
    );

    let contextualMenuActionKey = tableConfig.contextualMenu ?? 'contentItemContextActionsMenu';
    if (selection.length > 0) {
        contextualMenuActionKey = selection.includes(node.path) ? 'selectedContentMenu' : 'notSelectedContentMenu';
    }

    return (
        <TableRow {...rowProps}
                  ref={node => virtualizer.measureElement(node)} // Measure dynamic row height
                  data-index={virtualRow.index} // Needed for dynamic row height measurement
                  style={{
                      display: 'flex',
                      position: 'absolute',
                      transform: `translateY(${virtualRow.start}px)`, // This should always be a `style` as it changes on scroll
                      width: '100%'
                  }}
                  data-cm-role="table-content-list-row"
                  data-node-name={node.name}
                  className={clsx(css.tableRow, revealPath === node.path && css.revealedRow, (isCanDrop || isCanDropFile) && 'moonstone-drop_row', dragging && 'moonstone-drag')}
                  isHighlighted={isPreviewSelected}
                  onClick={() => {
                      if (booleanValue(tableConfig.selectOnSingleClick)) {
                          navigateToRow();
                      }

                      if (isPreviewOpened && !node.notSelectableForPreview) {
                          setSelectedItemIndex(index);
                          onPreviewSelect(node.path);
                      }
                  }}
                  onContextMenu={event => {
                      event.stopPropagation();
                      openContextualMenu(event);
                  }}
                  onDoubleClick={navigateToRow}
        >
            <ContextualMenu
                setOpenRef={contextualMenu}
                actionKey={contextualMenuActionKey}
                currentPath={node.path}
                path={selection.length === 0 || !selection.includes(node.path) ? node.path : null}
                paths={selection.length === 0 || !selection.includes(node.path) ? null : selection}
                node={node}
            />
            {row.cells.map(cell => <React.Fragment key={cell.column.id}>{cell.render('Cell')}</React.Fragment>)}
        </TableRow>
    );
};

Row.propTypes = {
    row: PropTypes.object.isRequired,
    selection: PropTypes.array,
    sidePanelSelection: PropTypes.object,
    isPreviewOpened: PropTypes.bool,
    setSelectedItemIndex: PropTypes.func,
    onPreviewSelect: PropTypes.func,
    doubleClickNavigation: PropTypes.func,
    tableConfig: PropTypes.shape({
        contextualMenu: PropTypes.string,
        selectOnSingleClick: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
        dnd: PropTypes.shape({
            canDrag: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
            canDrop: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
            canDropFile: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
            expandTargetOnDrop: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
            recordUndo: PropTypes.oneOfType([PropTypes.bool, PropTypes.func])
        })
    }).isRequired,
    revealPath: PropTypes.string,

    index: PropTypes.number,
    virtualizer: PropTypes.object.isRequired,
    virtualRow: PropTypes.object.isRequired
};
