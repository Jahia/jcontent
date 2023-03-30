import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useLayoutQuery} from '~/JContent/ContentRoute/ContentLayout/useLayoutQuery';
import {useSelector} from 'react-redux';
import {useTable} from 'react-table';
import {
    deletionInfoColumnData,
    useExpandedControlled,
    useSort
} from '~/JContent/ContentRoute/ContentLayout/ContentTable/reactTable';
import {Button, Loader, Table, TableBody, TableRow, Typography, Reload} from '@jahia/moonstone';
import ContentListHeader from '~/JContent/ContentRoute/ContentLayout/ContentTable/ContentListHeader';
import clsx from 'clsx';
import css from '~/JContent/ContentRoute/ContentLayout/ContentTable/ContentTable.scss';
import styles from '~/JContent/ContentRoute/ContentLayout/ContentLayout.scss';
import tableStyles from './InfoTable.scss';
import EmptyTable from '~/JContent/ContentRoute/ContentLayout/ContentTable/EmptyTable';
import {useTranslation} from 'react-i18next';

export const InfoTable = ({paths}) => {
    const {t} = useTranslation('jcontent');
    const [openPaths, setOpenPaths] = useState([]);
    const options = useSelector(state => ({
        siteKey: state.site,
        path: state.jcontent.path,
        lang: state.language,
        uilang: state.uilang
    }));
    const {result, error: layoutError, loading: layoutLoading, refetch} = useLayoutQuery({
        mode: 'deletionInfo',
        paths: paths,
        openPaths: openPaths,
        sort: {},
        ...options
    });

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows: tableRows,
        prepareRow
    } = useTable(
        {
            columns: deletionInfoColumnData,
            data: result.nodes,
            isExpanded: row => openPaths.indexOf(row.path) > -1,
            onExpand: (id, value) => {
                const node = id.split('.').reduce((p, i) => p.subRows[i], {subRows: result.nodes});
                if (value === false) {
                    setOpenPaths(openPaths.filter(p => p !== node.path));
                } else {
                    setOpenPaths(openPaths.concat(node.path));
                }
            }
        },
        useSort,
        useExpandedControlled
    );

    if (layoutError) {
        return <EmptyTable text={t('jcontent:label.contentManager.actions.error.loading', layoutError)}/>;
    }

    return (
        <div className={clsx('flexFluid', 'flexCol_nowrap', tableStyles.tableWrapper)}>
            { layoutLoading && (
                <div className={clsx('flexCol_center', 'alignCenter', styles.loader)}>
                    <Loader size="big"/>
                </div>
            )}
            <div className="flexFluid flexRow_between">
                <Typography variant="heading" weight="semiBold">{t('jcontent:label.contentManager.deleteAction.details')}</Typography>
                <Button icon={<Reload/>} label={t('jcontent:label.contentManager.refresh')} onClick={() => refetch()}/>
            </div>
            <Table aria-labelledby="tableTitle"
                   data-cm-role="table-content-list"
                   style={{width: '100%', minWidth: '1100px'}}
                   {...getTableProps()}
            >
                <ContentListHeader headerGroups={headerGroups}/>
                <TableBody {...getTableBodyProps()}>
                    {tableRows.map(row => {
                        prepareRow(row);
                        return (
                            <TableRow key={'row' + row.original.uuid}
                                      data-cm-role="table-content-list-row"
                                      className={clsx(css.tableRow)}
                                      {...row.getRowProps()}
                            >
                                {row.cells.map(cell => <React.Fragment key={cell.column.id}>{cell.render('Cell')}</React.Fragment>)}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

InfoTable.propTypes = {
    paths: PropTypes.array.isRequired
};
