import React, {useEffect, useMemo, useRef} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {FileCard} from '~/JContent/ContentRoute/ContentLayout/FilesGrid/FileCard';
import FilesGridEmptyDropZone from '~/JContent/ContentRoute/ContentLayout/FilesGrid/FilesGridEmptyDropZone';
import * as jcontentUtils from '~/JContent/JContent.utils';
import {useFileDrop} from '~/JContent/dnd';
import {TablePagination} from '@jahia/moonstone';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import classNames from 'clsx';
import clsx from 'clsx';
import styles from './PickerFilesGrid.scss';
import {
    cePickerAddSelection,
    cePickerClearSelection,
    cePickerMode,
    cePickerOpenPaths,
    cePickerPath,
    cePickerRemoveSelection,
    cePickerSetPage,
    cePickerSetPageSize
} from '~/ContentEditor/SelectorTypes/Picker/Picker.redux';
import {getDetailedPathArray} from '~/ContentEditor/SelectorTypes/Picker/Picker.utils';
import {batchActions} from 'redux-batched-actions';
import {registry} from '@jahia/ui-extender';
import {configPropType} from '~/ContentEditor/SelectorTypes/Picker/configs/configPropType';

const reduxActions = {
    setOpenPathAction: path => cePickerOpenPaths(getDetailedPathArray(path)),
    setPathAction: path => cePickerPath(path),
    setModeAction: mode => cePickerMode(mode),
    setCurrentPageAction: page => cePickerSetPage(page - 1),
    setPageSizeAction: pageSize => cePickerSetPageSize(pageSize),
    addToSelection: uuid => cePickerAddSelection(uuid),
    removeFromSelection: uuid => cePickerRemoveSelection(uuid),
    clearSelection: () => cePickerClearSelection()
};

const Grid = React.forwardRef(({children, ...rest}, ref) => (
    <div ref={ref} className={classNames(styles.defaultGrid, styles.detailedGrid)} {...rest}>
        {children}
    </div>
));

Grid.propTypes = {
    children: PropTypes.node
};

export const PickerFilesGrid = ({totalCount, rows, isLoading, pickerConfig, isMultiple, accordionItemProps, dblClickSelect}) => {
    const {t} = useTranslation('jcontent');
    const {mode, path, pagination, siteKey, uilang, lang, selection} = useSelector(state => ({
        mode: state.contenteditor.picker.mode,
        path: state.contenteditor.picker.path,
        pagination: state.contenteditor.picker.pagination,
        siteKey: state.site,
        uilang: state.uilang,
        lang: state.language,
        selection: state.contenteditor.picker.selection
    }), shallowEqual);
    const dispatch = useDispatch();
    const tableConfig = useMemo(() => {
        return jcontentUtils.getAccordionItem(registry.get('accordionItem', mode), accordionItemProps)?.tableConfig;
    }, [mode, accordionItemProps]);
    const onClick = node => {
        if (node.isSelectable) {
            const actions = [];
            if (!isMultiple) {
                actions.push(reduxActions.clearSelection());
            }

            if (selection.indexOf(node.uuid) === -1) {
                actions.push(reduxActions.addToSelection(node.uuid));
            } else {
                actions.push(reduxActions.removeFromSelection(node.uuid));
            }

            dispatch(batchActions(actions));
        }
    };

    const setPath = (siteKey, path) => {
        const actions = [];
        actions.push(reduxActions.setOpenPathAction(path));
        actions.push(reduxActions.setPathAction(path));
        dispatch(batchActions(actions));
    };

    const mainPanelRef = useRef(null);
    useEffect(() => {
        if (mainPanelRef.current) {
            mainPanelRef.current.scroll(0, 0);
        }
    }, [pagination.currentPage]);

    const [{isCanDrop, allowDrop}, dropFile] = useFileDrop({
        uploadType: 'upload',
        uploadPath: path,
        uploadFilter: file => !tableConfig?.uploadFilter || tableConfig.uploadFilter(file, mode, pickerConfig)
    });

    dropFile(mainPanelRef);

    if ((!rows || rows.length === 0) && !isLoading) {
        return (
            <FilesGridEmptyDropZone uploadType="upload" reference={mainPanelRef} isCanDrop={isCanDrop} allowDrop={allowDrop}/>
        );
    }

    return (
        <>
            <div
                className={clsx(styles.grid, isCanDrop && styles.drop)}
                data-cm-role="grid-content-list"
                tabIndex="1"
            >
                <Grid ref={mainPanelRef}>
                    {rows.map((node, index) => (
                        <FileCard key={node.uuid}
                                  mode=""
                                  uilang={uilang}
                                  lang={lang}
                                  siteKey={siteKey}
                                  selection={selection}
                                  index={index}
                                  node={node}
                                  setPath={setPath}
                                  contextualMenuAction="contentPickerMenu"
                                  tableConfig={tableConfig}
                                  onClick={(...args) => {
                                      onClick(node, ...args);
                                  }}
                                  onDoubleClick={() => {
                                      if (['jnt:page', 'jnt:folder', 'jnt:contentFolder'].indexOf(node.primaryNodeType.name) === -1) {
                                          dblClickSelect(node.uuid);
                                      } else {
                                          setPath(siteKey, node.path, mode);
                                      }
                                  }}
                        />
                    ))}
                </Grid>
            </div>
            <TablePagination totalNumberOfRows={totalCount}
                             currentPage={pagination.currentPage + 1}
                             rowsPerPage={pagination.pageSize}
                             label={{
                                 rowsPerPage: t('jcontent:label.pagination.rowsPerPage'),
                                 of: t('jcontent:label.pagination.of')
                             }}
                             rowsPerPageOptions={[10, 25, 50, 100]}
                             onPageChange={page => dispatch(reduxActions.setCurrentPageAction(page))}
                             onRowsPerPageChange={size => dispatch(reduxActions.setPageSizeAction(size))}
            />
        </>
    );
};

PickerFilesGrid.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    rows: PropTypes.array.isRequired,
    totalCount: PropTypes.number.isRequired,
    pickerConfig: configPropType.isRequired,
    isMultiple: PropTypes.bool,
    accordionItemProps: PropTypes.object,
    dblClickSelect: PropTypes.func.isRequired
};

export default PickerFilesGrid;
