import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {Paper} from '@material-ui/core';
import {ContentTable} from '~/JContent/ContentRoute/ContentLayout/ContentTable';
import classNames from 'clsx';
import {ErrorBoundary} from '@jahia/jahia-ui-root';
import styles from '~/JContent/ContentRoute/ContentLayout/ContentLayout.scss';
import JContentConstants from '~/JContent/JContent.constants';
import {
    name,
    selection,
    usages,
    visibleActions
} from '~/JContent/ContentRoute/ContentLayout/ContentTable/reactTable';
import {CellUsagesLazy, UsagesCountProvider} from '~/JContent/CategoriesRoute/UsagesCount';

// Usages are counted per visible row after render, never as part of the tree query
const usagesLazy = {...usages, Cell: CellUsagesLazy, accessor: undefined, sortable: false};

export const CategoriesLayout = ({
    rows,
    isContentNotFound,
    totalCount,
    isLoading,
    isStructured,
    revealPath
}) => {
    const contextualMenu = useRef();
    const selector = state => ({
        mode: state.jcontent.mode,
        previewSelection: [],
        siteKey: 'systemsite',
        path: state.jcontent.path,
        pagination: state.jcontent.pagination,
        selection: state.jcontent.selection,
        tableView: {viewMode: JContentConstants.tableView.viewMode.STRUCTURED},
        searchTerms: state.jcontent.params.searchTerms,
        tableOpenPaths: state.jcontent.tableOpenPaths,
        sort: state.jcontent.sort
    });
    return (
        <UsagesCountProvider>
            <div className={styles.root}>
                <div
                    className={classNames(styles.content)}
                    onContextMenu={event => contextualMenu.current(event)}
                >
                    <Paper className={styles.contentPaper}>
                        <ErrorBoundary>
                            <ContentTable totalCount={totalCount}
                                          rows={rows}
                                          isContentNotFound={isContentNotFound}
                                          isStructured={isStructured}
                                          isLoading={isLoading}
                                          selector={selector}
                                          columns={[selection, {...name, sortable: false}, usagesLazy, visibleActions]}
                                          revealPath={revealPath}
                            />
                        </ErrorBoundary>
                    </Paper>
                </div>
            </div>
        </UsagesCountProvider>
    );
};

CategoriesLayout.propTypes = {
    rows: PropTypes.array.isRequired,
    isContentNotFound: PropTypes.bool,
    totalCount: PropTypes.number.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isStructured: PropTypes.bool,
    revealPath: PropTypes.string
};

export default CategoriesLayout;
