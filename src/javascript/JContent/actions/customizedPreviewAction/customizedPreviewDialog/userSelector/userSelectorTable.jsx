import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {Loader, Table, TableBody, TablePagination, TableRow} from '@jahia/moonstone';
import {registry} from '@jahia/ui-extender';
import {Constants} from '~/ContentEditor/SelectorTypes/Picker/Picker.constants';
import {useLayoutQuery} from '~/JContent/ContentRoute/ContentLayout/useLayoutQuery';
import {useTable} from 'react-table';
import {ContentListHeader, ContentNotFound, EmptyTable} from '~/JContent/ContentRoute/ContentLayout/ContentTable';
import * as reactTable from '~/JContent/ContentRoute/ContentLayout/ContentTable/reactTable';
import {allColumnData} from '~/ContentEditor/SelectorTypes/Picker/reactTable/columns';
import {UserSearch} from './userSearch';
import PropTypes from 'prop-types';
import styles from '../selectors.scss';
import clsx from 'clsx';

export const useUserQueryOptions = ({tableConfig, currentPage, pageSize}) => {
    const siteKey = useSelector(state => state.site);
    const lang = useSelector(state => state.language);
    const uilang = useSelector(state => state.uilang);

    const [pickerMode, setPickerMode] = useState('picker-user');
    const [searchPath, setSearchPath] = useState('/');
    const [searchTerms, setSearchTerms] = useState('');
    const [sort, setSort] = useState(tableConfig?.defaultSort || {orderBy: 'displayName', order: 'ASC'});

    const {selectableTypesTable, searchContentType} = registry.get(Constants.pickerConfig, 'user');
    return {
        mode: pickerMode,
        setPickerMode,
        siteKey,
        path: '/',
        lang,
        uilang,
        searchPath,
        setSearchPath,
        searchTerms,
        setSearchTerms,
        searchContentType,
        selectableTypesTable,
        filesMode: 'list',
        sort,
        setSort,
        tableView: {
            viewMode: 'flatList',
            viewType: 'content'
        },
        pagination: {currentPage, pageSize},
        openPaths: []
    };
};

export const UserSelectorTable = ({newValue, onSelection, onDblClick}) => {
    const [pageSize, setPageSize] = useState(25);
    const [currentPage, setCurrentPage] = useState(0);
    const {t} = useTranslation('jcontent');
    const {tableConfig} = registry.get(Constants.ACCORDION_ITEM_NAME, 'picker-user') || {};

    const userQueryOptions = useUserQueryOptions({tableConfig, currentPage, pageSize});
    const {mode, searchTerms, sort, setSort} = userQueryOptions;
    const fragments = tableConfig?.queryHandler?.getFragments();
    const {result, error, loading} = useLayoutQuery(userQueryOptions, fragments.filter(Boolean));

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows: tableRows,
        prepareRow
    } = useTable({
        data: result?.nodes || [],
        columns: tableConfig.columns,
        sort,
        onSort: (column, order) => setSort({orderBy: column.property, order})
    }, reactTable.useSort);

    if (!loading && !result?.nodes?.length) {
        if (error) {
            const message = t('jcontent:label.contentManager.error.queryingContent', {details: error?.message || ''});
            console.error(message);
        }

        return (
            <>
                <UserSearch tableConfig={tableConfig} {...userQueryOptions}/>
                <div className={clsx(styles.userTable, 'flexFluid flexCol_center alignCenter')}>
                    {(mode === Constants.mode.SEARCH) ?
                        <EmptyTable text={searchTerms}/> :
                        <ContentNotFound columnSpan={allColumnData.length} t={t}/>}
                </div>
            </>
        );
    }

    return (
        <>
            <UserSearch tableConfig={tableConfig} {...userQueryOptions}/>
            <Table
                data-cm-role="table-content-list"
                className={styles.userTable}
                {...getTableProps()}
            >
                <ContentListHeader headerGroups={headerGroups}/>

                <TableBody {...getTableBodyProps()} className={styles.userContent}>
                    {loading && (
                        <div className="flexFluid flexCol_center alignCenter">
                            <Loader size="big"/>
                        </div>
                    )}
                    {tableRows.map(row => {
                        prepareRow(row);
                        return (
                            // A key is included in row.getRowProps
                            // eslint-disable-next-line react/jsx-key
                            <TableRow
                                {...row.getRowProps()}
                                style={{cursor: 'pointer'}}
                                data-cm-role="table-content-list-row"
                                data-sel-name={row.original.name}
                                isHighlighted={row.original.name === newValue}
                                onClick={() => onSelection(row.original.name)}
                                onDoubleClick={() => onDblClick(row.original.name)}
                            >
                                {row.cells.map(cell => <React.Fragment key={cell.column.id}>{cell.render('Cell')}</React.Fragment>)}
                            </TableRow>
                        );
                    })}
                </TableBody>
                {!loading && <TablePagination
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
                    }}/>}
            </Table>
        </>
    );
};

UserSelectorTable.propTypes = {
    newValue: PropTypes.string,
    onSelection: PropTypes.func.isRequired,
    onDblClick: PropTypes.func.isRequired
};
