import React from 'react';
import {ReferenceCard} from '~/ContentEditor/DesignSystem/ReferenceCard';
import {Dialog, DialogActions, DialogContent, DialogTitle, Paper} from '@material-ui/core';
import {useState} from 'react';
import {ContextualMenu, registry} from '@jahia/ui-extender';
import {Constants} from '~/ContentEditor/SelectorTypes/Picker/Picker.constants';
import {useTranslation} from 'react-i18next';
import {useLayoutQuery} from '~/JContent/ContentRoute/ContentLayout/useLayoutQuery';
import {DefaultPickerConfig} from '~/ContentEditor/SelectorTypes/Picker/configs/DefaultPickerConfig';
import {useTable} from 'react-table';
import {Button, Table, TableBody, TablePagination, TableRow} from '@jahia/moonstone';
import {ContentListHeader} from '~/JContent/ContentRoute/ContentLayout/ContentTable';
import {useCustomizedPreviewContext} from '~/JContent/actions/customizedPreviewAction/customizedPreview.context';
import {Search} from '~/ContentEditor/SelectorTypes/Picker/JahiaPicker/RightPanel/Search';
import {SelectorLabel} from '~/JContent/actions/customizedPreviewAction/customizedPreviewDialog/selectorLabel';
import styles from './selectors.scss';
import clsx from 'clsx';


const options = {
    mode: "picker-user",
    siteKey: "digitall",
    path: "/",
    lang: "en",
    uilang: "en",
    searchPath: "/",
    searchContentType: "jnt:user",
    searchTerms: "",
    selectableTypesTable: [
        "jnt:user"
    ],
    filesMode: "list",
    sort: {
        orderBy: "displayName",
        order: "ASC"
    },
    tableView: {
        viewMode: "flatList",
        viewType: "content"
    },
    openPaths: []
};

const searchOptions = {
    mode: "picker-search",
    siteKey: "digitall",
    path: "/",
    lang: "en",
    uilang: "en",
    searchPath: "/",
    searchContentType: "jnt:user",
    searchTerms: "bi",
    selectableTypesTable: [
        "jnt:user"
    ],
    filesMode: "list",
    pagination: {
        currentPage: 0,
        pageSize: 25
    },
    sort: {
        orderBy: "displayName",
        order: "ASC"
    },
    tableView: {
        viewMode: "flatList",
        viewType: "content"
    },
    openPaths: []
}

const UserSelectorTable = ({initialValue, newValue, onSelection, onDblClick}) => {
    const [pageSize, setPageSize] = useState(25);
    const [currentPage, setCurrentPage] = useState(0);
    const {t} = useTranslation('jcontent');
    const {tableConfig} = registry.get(Constants.ACCORDION_ITEM_NAME, 'picker-user') || {};

    const opt = options;
    opt.pagination = {currentPage, pageSize}
    const {result, error, loading} = useLayoutQuery(opt);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows: tableRows,
        prepareRow
    } = useTable({
        data: result?.nodes || [],
        columns: tableConfig.columns
    });

    if (loading || error) {
        return null;
    }

    return (
        <>
            <Table
                data-cm-role="table-content-list"
                style={{width: '100%', minWidth: '1100px'}}
                {...getTableProps()}
            >
                <ContentListHeader headerGroups={headerGroups}/>
                <TableBody {...getTableBodyProps()}>
                    {tableRows.map(row => {
                        prepareRow(row);
                        return (
                            <TableRow
                                {...row.getRowProps()}
                                style={{cursor: 'pointer'}}
                                data-cm-role="table-content-list-row"
                                data-sel-name={row.original.name}
                                isHighlighted={row.original.name === newValue}
                                onClick={e => onSelection(row.original.name)}
                                onDoubleClick={e => onDblClick(row.original.name)}
                            >
                                {row.cells.map(cell => <React.Fragment key={cell.column.id}>{cell.render('Cell')}</React.Fragment>)}
                            </TableRow>
                        );
                    })}
                </TableBody>
                <TablePagination
                    totalNumberOfRows={result?.pageInfo.totalCount || 0}
                    currentPage={currentPage + 1}
                    rowsPerPage={pageSize}
                    label={{
                        rowsPerPage: t('jcontent:label.pagination.rowsPerPage'),
                        of: t('jcontent:label.pagination.of')
                    }}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    onPageChange={page => setCurrentPage(page - 1)}
                    onRowsPerPageChange={size => {
                        setCurrentPage(0);
                        setPageSize(size);
                    }}/>
            </Table>
        </>
    );
}


export const UserSelector = () => {
    const {user, setUser} = useCustomizedPreviewContext();

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [newValue, setNewValue] = useState(user);
    const pickerConfig = registry.get(Constants.pickerConfig, 'user');
    const {t} = useTranslation('jcontent');

    // TODO query selection
    const notFound = false;
    const error = false;

    const onDblClick = (newValue) => {
        setUser(newValue);
        setDialogOpen(false);
    }

    const defaultPickerInput = DefaultPickerConfig.pickerInput;
    return (
        <>
        <SelectorLabel name="user"/>
        <div className={clsx(styles.selector, "flexFluid flexRow_nowrap alignCenter")}>
            <ReferenceCard
                emptyLabel={t((error || notFound) ? defaultPickerInput.notFoundLabel : pickerConfig.pickerInput.emptyLabel)}
                emptyIcon={(error || notFound) ? defaultPickerInput.notFoundIcon : defaultPickerInput.emptyIcon}
                labelledBy="user-selector-label"
                fieldData={user && {url: '/modules/assets/icons/jnt_user.png', name: user, info: 'user'}}
                onClick={() => setDialogOpen(true)}
            />

            <Dialog
                fullWidth
                maxWidth="xl"
                data-sel-role="picker-dialog"
                data-sel-type={pickerConfig.key}
                PaperComponent={Paper}
                open={isDialogOpen}
                onClose={() => setDialogOpen(false)}>

                <DialogTitle>
                    {t(pickerConfig.pickerDialog.dialogTitle)}
                </DialogTitle>

                <DialogContent>
                    <UserSelectorTable initialValue={user} newValue={newValue} onSelection={setNewValue} onDblClick={onDblClick}/>
                </DialogContent>

                <DialogActions>
                    <Button
                        data-sel-picker-dialog-action="cancel"
                        size="big"
                        label={t('jcontent:label.contentEditor.edit.fields.modalCancel').toUpperCase()}
                        onClick={() => setDialogOpen(false)}
                    />
                    <Button
                        data-sel-picker-dialog-action="select-user"
                        disabled={!newValue}
                        color="accent"
                        size="big"
                        label={t('jcontent:label.contentEditor.edit.fields.modalDone').toUpperCase()}
                        onClick={() => {
                            setUser(newValue);
                            setDialogOpen(false);
                        }}
                    />
                </DialogActions>
            </Dialog>
        </div>
        </>
    );
}
