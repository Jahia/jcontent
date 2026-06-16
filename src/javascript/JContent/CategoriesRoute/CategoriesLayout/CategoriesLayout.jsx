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
    visibleActions
} from '~/JContent/ContentRoute/ContentLayout/ContentTable/reactTable';

export const CategoriesLayout = ({
    rows,
    isContentNotFound,
    totalCount,
    isLoading,
    isStructured
}) => {
    const contextualMenu = useRef();
    const selector = state => ({
        mode: state.jcontent.mode,
        previewSelection: [],
        siteKey: 'systemsite',
        path: state.jcontent.path,
        pagination: state.jcontent.pagination,
        selection: state.jcontent.selection,
        tableView: {viewMode: JContentConstants.tableView.viewMode.FLAT},
        searchTerms: state.jcontent.params.searchTerms,
        tableOpenPaths: state.jcontent.tableOpenPaths,
        sort: state.jcontent.sort
    });
    return (
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
                                      columns={[selection, {...name, sortable: false}, visibleActions]}
                            />
                    </ErrorBoundary>
                </Paper>
            </div>
        </div>
    );
};

CategoriesLayout.propTypes = {
    rows: PropTypes.array.isRequired,
    isContentNotFound: PropTypes.bool,
    totalCount: PropTypes.number.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isStructured: PropTypes.bool
};

export default CategoriesLayout;
