import React from 'react';
import PropTypes from 'prop-types';
import {compose} from '~/utils';
import {ContextualMenu} from '@jahia/ui-extender';
import {Drawer, Paper, withStyles} from '@material-ui/core';
import ContentListTable from './ContentListTable';
import PreviewDrawer from './PreviewDrawer';
import classNames from 'classnames';
import {withTranslation} from 'react-i18next';
import {CM_DRAWER_STATES} from '../../JContent.redux';
import FilesGrid from './FilesGrid';
import JContentConstants from '../../JContent.constants';
import contentManagerStyleConstants from '../../JContent.style-constants';

const styles = theme => ({
    root: {
        flex: '1 1 0%',
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
        minHeight: 0,
        width: '100%'
    },
    content: {
        flex: '1 2 0%',
        order: 2,
        display: 'flex',
        transition: 'margin-left .25s,margin-right .25s',
        backgroundColor: theme.palette.background.default,
        minWidth: 0
    },
    contentPaper: {
        flex: '1 1 auto',
        flexDirection: 'column',
        minWidth: 0,
        display: 'flex',
        width: '100%'
    },
    treeDrawer: {
        flex: '0 1 auto',
        display: 'flex',
        order: 1,
        transition: 'transform .15s'
    },
    treeDrawerPaper: {
        position: 'relative',
        display: 'flex',
        zIndex: 'auto',
        height: 'unset',
        overflow: 'hidden'
    },
    previewDrawer: {
        flex: '0 1 ' + contentManagerStyleConstants.previewDrawerWidth + 'px',
        order: 3,
        display: 'flex',
        overflow: 'hidden',
        transition: 'transform .15s'
    },
    previewDrawerHidden: {
        transform: 'translate(600px)'
    },
    previewDrawerPaper: {
        position: 'relative',
        display: 'flex',
        width: '100%',
        zIndex: 'auto',
        height: 'unset',
        transition: '.15s !important',
        overflow: 'hidden',
        maxWidth: contentManagerStyleConstants.previewDrawerWidth
    },
    previewDrawerPaperFullScreen: {
        transition: '.15s !important',
        width: '100vw',
        height: '100vh',
        top: 0,
        right: 0
    }
});

export class ContentLayout extends React.Component {
    render() {
        const {
            mode, path, previewState, classes, filesMode, previewSelection, rows, contentNotFound,
            totalCount, loading
        } = this.props;

        let contextualMenu = React.createRef();
        let previewOpen = previewState >= CM_DRAWER_STATES.SHOW;
        return (
            <>
                <div className={classes.root}>
                    <Drawer
                        data-cm-role="preview-drawer"
                        variant="persistent"
                        anchor="right"
                        open={previewOpen}
                        classes={{
                            root: classNames(classes.previewDrawer, {[classes.previewDrawerHidden]: !previewOpen}),
                            paper: classNames({
                                [classes.previewDrawerPaper]: previewState !== CM_DRAWER_STATES.FULL_SCREEN,
                                [classes.previewDrawerPaperFullScreen]: previewState === CM_DRAWER_STATES.FULL_SCREEN
                            })
                        }}
                    >
                        {previewOpen &&
                        <PreviewDrawer previewSelection={rows.find(node => node.path === previewSelection)}/>}
                    </Drawer>
                    <ContextualMenu setOpenRef={contextualMenu} actionKey="contentMenu" path={path}/>
                    <div
                        className={classNames(classes.content)}
                        style={{
                            marginRight: previewOpen ? 0 : -contentManagerStyleConstants.previewDrawerWidth
                        }}
                        onContextMenu={event => contextualMenu.current(event)}
                    >
                        <Paper className={classes.contentPaper}>
                            {mode === JContentConstants.mode.MEDIA && filesMode === JContentConstants.mode.GRID ?
                                <FilesGrid totalCount={totalCount}
                                           rows={rows}
                                           contentNotFound={contentNotFound}
                                           loading={loading}/> :
                                <ContentListTable totalCount={totalCount}
                                                  rows={rows}
                                                  contentNotFound={contentNotFound}
                                                  loading={loading}/>}
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
    classes: PropTypes.object.isRequired,
    filesMode: PropTypes.string.isRequired,
    previewState: PropTypes.number.isRequired,
    previewSelection: PropTypes.string,
    rows: PropTypes.array.isRequired,
    contentNotFound: PropTypes.bool,
    totalCount: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired
};

export default compose(
    withTranslation(),
    withStyles(styles)
)(ContentLayout);
