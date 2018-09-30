import React from 'react';
import {Query, withApollo} from 'react-apollo';
import {
    BrowsingQueryHandler,
    SearchQueryHandler,
    Sql2SearchQueryHandler,
    FilesQueryHandler
} from "./gqlQueries";
import * as _ from "lodash";
import {withNotifications, ProgressOverlay} from '@jahia/react-material';
import {register as gwtEventHandlerRegister, unregister as gwtEventHandlerUnregister} from "./eventHandlerRegistry";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {cmGoto, cmSetSelection, cmClosePaths} from "./redux/actions";
import constants from "./constants";

const contentQueryHandlerByMode = mode => {
    switch (mode) {
        case constants.mode.BROWSE:
            return new BrowsingQueryHandler();
        case constants.mode.FILES:
            return new FilesQueryHandler();
        case constants.mode.SEARCH:
            return new SearchQueryHandler();
        case constants.mode.SQL2SEARCH:
            return new Sql2SearchQueryHandler();
    }
};

class ContentData extends React.Component {

    constructor(props) {
        super(props);
        this.onGwtContentModification = this.onGwtContentModification.bind(this);
    }

    componentDidMount() {
        gwtEventHandlerRegister(this.onGwtContentModification);
    }

    componentWillUnmount() {
        gwtEventHandlerUnregister(this.onGwtContentModification);
    }

    onGwtContentModification(nodeUuid, nodePath, nodeName, operation) {

        let {client, path, selection, openPaths, setPath, setSelection, closePaths} = this.props;

        let stateModificationDone = false;
        if (operation == "delete") {

            // Switch to parent node in case of currently selected node deletion.
            if (path == nodePath) {
                setPath(path.substring(0, path.lastIndexOf("/")));
                stateModificationDone = true;
            }

            // De-select any removed nodes.
            if (_.find(selection, node => node.path == nodePath)) {
                let newSelection = _.clone(selection);
                _.remove(newSelection, node => node.path == nodePath);
                setSelection(newSelection);
                stateModificationDone = true;
            }

            // Close any expanded nodes that have been just removed.
            let pathsToClose = _.filter(openPaths, openPath => openPath.startsWith(nodePath));
            if (!_.isEmpty(pathsToClose)) {
                closePaths(pathsToClose);
                stateModificationDone = true;
            }
        }

        if (stateModificationDone) {
            // In case of any state modifications, wait a second to let components re-render and perform GrpaphQL requests asynchronously,
            // and avoid store reset done at the same time: Apollo is usually unhappy with this and throws errors.
            setTimeout(function() {
                client.resetStore();
            }, 1000);
        } else {
            client.resetStore();
        }
    }

    render() {
        const {notificationContext, t, mode, children, layoutQuery, layoutQueryParams} = this.props;
        return <Query query={layoutQuery} variables={layoutQueryParams}>
            {({loading, error, data}) => {
                let queryHandler = contentQueryHandlerByMode(mode);

                if (error) {
                    console.log("Error when fetching data: " + error);
                    let message = t('label.contentManager.error.queryingContent', {details: (error.message ? error.message : '')});
                    notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                    return null;
                }

                if (loading) {
                    return <ProgressOverlay/>;
                }

                let rows = [];
                let totalCount = 0;
                notificationContext.closeNotification();

                if (data && data.jcr) {
                    let result = queryHandler.getResultsPath(data.jcr.results);
                    totalCount = result.pageInfo.totalCount;
                    rows = _.map(result.nodes, contentNode => {
                        return {
                            uuid: contentNode.uuid,
                            name: contentNode.displayName,
                            nodeName: contentNode.name,
                            type: contentNode.primaryNodeType.displayName,
                            created: contentNode.created.value,
                            createdBy: contentNode.createdBy.value,
                            path: contentNode.path,
                            publicationStatus: contentNode.aggregatedPublicationInfo.publicationStatus,
                            isLocked: contentNode.lockOwner !== null,
                            lockOwner: contentNode.lockOwner !== null ? contentNode.lockOwner.value : '',
                            lastPublishedBy: (contentNode.lastPublishedBy !== null ? contentNode.lastPublishedBy.value : ''),
                            lastPublished: (contentNode.lastPublished !== null ? contentNode.lastPublished.value : ''),
                            lastModifiedBy: (contentNode.lastModifiedBy !== null ? contentNode.lastModifiedBy.value : ''),
                            lastModified: (contentNode.lastModified !== null ? contentNode.lastModified.value : ''),
                            deletedBy: (contentNode.deletedBy !== null ? contentNode.deletedBy.value : ''),
                            deleted: (contentNode.deleted !== null ? contentNode.deleted.value : ''),
                            wipStatus: (contentNode.wipStatus != null ? contentNode.wipStatus.value : ''),
                            wipLangs: (contentNode.wipLangs != null ? contentNode.wipLangs.values : []),
                            icon: contentNode.primaryNodeType.icon,
                            width: (contentNode.width != null ? contentNode.width.value : ''),
                            height: (contentNode.width != null ? contentNode.height.value : '')
                        }
                    });
                }

                return <React.Fragment>
                    {loading && <ProgressOverlay/>}
                    {children({
                        rows: rows,
                        totalCount: totalCount,
                        layoutQuery: layoutQuery,
                        layoutQueryParams: layoutQueryParams
                    })}
                </React.Fragment>
            }}
        </Query>
    }
}

const mapStateToProps = (state, ownProps) => ({
    siteKey: state.site,
    mode: state.mode,
    selection: state.selection,
    openPaths: state.openPaths
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    setPath: (path, params) => dispatch(cmGoto({path, params})),
    setSelection: (selection) => dispatch(cmSetSelection(selection)),
    closePaths: (paths) => dispatch(cmClosePaths(paths))
});

ContentData = _.flowRight(
    withNotifications(),
    translate(),
    withApollo,
    connect(mapStateToProps, mapDispatchToProps)
)(ContentData);

export {ContentData, contentQueryHandlerByMode};