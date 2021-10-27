import React from 'react';
import PropTypes from 'prop-types';
import {compose} from '~/utils';
import {ContextualMenu} from '@jahia/ui-extender';
import {Drawer, Paper} from '@material-ui/core';
import ContentTable from './ContentTable';
import PreviewDrawer from './PreviewDrawer';
import classNames from 'clsx';
import {withTranslation} from 'react-i18next';
import {CM_DRAWER_STATES} from '~/JContent/JContent.redux';
import FilesGrid from './FilesGrid';
import JContentConstants from '~/JContent/JContent.constants';
import contentManagerStyleConstants from '~/JContent/JContent.style-constants';
import {ErrorBoundary} from '@jahia/jahia-ui-root';
import {flattenTree} from './ContentLayout.utils';
import styles from './ContentLayout.scss';

export class ContentLayout extends React.Component {
    constructor(props) {
        super(props);
        this.contextualMenu = React.createRef();
    }

    render() {
        const {
            mode, path, previewState, filesMode, previewSelection, rows, isContentNotFound,
            totalCount, isLoading, dataCounts
        } = this.props;

        let previewOpen = previewState >= CM_DRAWER_STATES.SHOW;
        return (
            <>
                <div className={styles.root}>
                    <Drawer
                        data-cm-role="preview-drawer"
                        variant="persistent"
                        anchor="right"
                        open={previewOpen}
                        classes={{
                            root: classNames(styles.previewDrawer, {[styles.previewDrawerHidden]: !previewOpen}),
                            paper: classNames({
                                [styles.previewDrawerPaper]: previewState !== CM_DRAWER_STATES.FULL_SCREEN,
                                [styles.previewDrawerPaperFullScreen]: previewState === CM_DRAWER_STATES.FULL_SCREEN
                            })
                        }}
                    >
                        {previewOpen && (
                            <ErrorBoundary key={previewSelection}>
                                <PreviewDrawer previewSelection={flattenTree(rows).find(n => n.path === previewSelection)}/>
                            </ErrorBoundary>
                        )}
                    </Drawer>
                    <ContextualMenu setOpenRef={this.contextualMenu} actionKey="contentMenu" path={path}/>
                    <div
                        className={classNames(styles.content)}
                        style={{
                            marginRight: previewOpen ? 0 : -contentManagerStyleConstants.previewDrawerWidth
                        }}
                        onContextMenu={event => this.contextualMenu.current(event)}
                    >
                        <Paper className={styles.contentPaper}>
                            <ErrorBoundary key={filesMode}>
                                {mode === JContentConstants.mode.MEDIA && filesMode === JContentConstants.mode.GRID ?
                                    <FilesGrid totalCount={totalCount}
                                               rows={rows}
                                               isContentNotFound={isContentNotFound}
                                               isLoading={isLoading}/> :
                                    <ContentTable totalCount={totalCount}
                                                  rows={rows}
                                                  isContentNotFound={isContentNotFound}
                                                  isLoading={isLoading}
                                                  dataCounts={dataCounts}/>}
                            </ErrorBoundary>
                        </Paper>
                    </div>
                </div>
            </>
        );
    }
}

ContentLayout.propTypes = {
    mode: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    filesMode: PropTypes.string.isRequired,
    previewState: PropTypes.number.isRequired,
    previewSelection: PropTypes.string,
    rows: PropTypes.array.isRequired,
    isContentNotFound: PropTypes.bool,
    totalCount: PropTypes.number.isRequired,
    isLoading: PropTypes.bool.isRequired,
    dataCounts: PropTypes.object
};

export default compose(
    withTranslation()
)(ContentLayout);
