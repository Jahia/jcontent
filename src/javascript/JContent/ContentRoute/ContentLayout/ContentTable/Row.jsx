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
    previewSelection,
    isPreviewOpened,
    setSelectedItemIndex,
    onPreviewSelect,
    doubleClickNavigation,
    tableConfig,
    index
}) => {
    const rowProps = row.getRowProps();
    const node = row.original;
    const isPreviewSelected = node.path === previewSelection && isPreviewOpened;

    const contextualMenu = useRef();

    const ref = useRef(null);
    const [{isCanDrop}, drop] = useNodeDrop({dropTarget: node});
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

    return (
        <TableRow {...rowProps}
                  data-cm-role="table-content-list-row"
                  className={clsx(css.tableRow, (isCanDrop || isCanDropFile) && 'moonstone-drop_row', dragging && 'moonstone-drag')}
                  isHighlighted={isPreviewSelected}
                  onClick={() => {
                      if (isPreviewOpened && !node.notSelectableForPreview) {
                          setSelectedItemIndex(index);
                          onPreviewSelect(node.path);
                      }
                  }}
                  onContextMenu={event => {
                      event.stopPropagation();
                      openContextualMenu(event);
                  }}
                  onDoubleClick={allowDoubleClickNavigation(
                      node.primaryNodeType.name,
                      node.subNodes ? node.subNodes.pageInfo.totalCount : null,
                      () => doubleClickNavigation(node)
                  )}
        >
            <ContextualMenu
                setOpenRef={contextualMenu}
                actionKey={selection.length === 0 ? 'contentMenu' : (selection.indexOf(node.path) === -1 ? 'notSelectedContentMenu' : 'selectedContentMenu')}
                currentPath={node.path}
                path={selection.length === 0 || selection.indexOf(node.path) === -1 ? node.path : null}
                paths={selection.length === 0 || selection.indexOf(node.path) === -1 ? null : selection}
            />
            {row.cells.map(cell => <React.Fragment key={cell.column.id}>{cell.render('Cell')}</React.Fragment>)}
        </TableRow>
    );
};

Row.propTypes = {
    row: PropTypes.object.isRequired,
    selection: PropTypes.array,
    previewSelection: PropTypes.object,
    isPreviewOpened: PropTypes.bool,
    setSelectedItemIndex: PropTypes.func,
    onPreviewSelect: PropTypes.func,
    doubleClickNavigation: PropTypes.func,
    tableConfig: PropTypes.shape({
        dnd: PropTypes.shape({
            canDrag: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
            canDrop: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
            canDropFile: PropTypes.oneOfType([PropTypes.bool, PropTypes.func])
        })
    }).isRequired,
    index: PropTypes.number
};
