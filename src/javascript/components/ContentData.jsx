import React from 'react';
import {Query, withApollo} from 'react-apollo';
import {BrowsingQueryHandler, SearchQueryHandler, Sql2SearchQueryHandler, FilesQueryHandler, GetNodeAndChildrenByPathQuery} from "./gqlQueries";
import * as _ from "lodash";
import {withNotifications} from '@jahia/react-material';
import CmRouter from './CmRouter';
import {DxContext} from "./DxContext";
import {register as gwtEventHandlerRegister, unregister as gwtEventHandlerUnregister} from "./eventHandlerRegistry";
import {translate} from "react-i18next";

const contentQueryHandlerBySource = {
    "browsing": new BrowsingQueryHandler(),
    "files": new FilesQueryHandler(),
    "search": new SearchQueryHandler(),
    "sql2Search": new Sql2SearchQueryHandler()
};

class ContentData extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            page: 0,
            rowsPerPage: 25,
            showTree: true,
            showPreview: false,
            selectedRow: null,
            filesGridSizeValue: 4,
            showList: false
        };

        this.onGwtContentCreate = this.onGwtContentCreate.bind(this);
        this.onGwtContentUpdate = this.onGwtContentUpdate.bind(this);
    }

    componentDidMount() {
        gwtEventHandlerRegister("updateButtonItemEventHandlers", this.onGwtContentUpdate);
        gwtEventHandlerRegister("createButtonItemEventHandlers", this.onGwtContentCreate);
    }

    componentWillUnmount() {
        gwtEventHandlerUnregister("updateButtonItemEventHandlers", this.onGwtContentUpdate);
        gwtEventHandlerUnregister("createButtonItemEventHandlers", this.onGwtContentCreate);
    }

    onGwtContentCreate(enginePath, engineNodeName, uuid) {
        this.onGwtContentSave(enginePath, engineNodeName, uuid, true);
    }

    onGwtContentUpdate(enginePath, engineNodeName, uuid) {
        this.onGwtContentSave(enginePath, engineNodeName, uuid, false);
    }

    onGwtContentSave(enginePath, engineNodeName, uuid, forceRefresh) {
        // clean up the cache entry
        const path = enginePath.substring(0, enginePath.lastIndexOf("/") + 1) + engineNodeName;
        if (enginePath === this.gwtEventHandlerContext.path && enginePath !== path) {
            this.gwtEventHandlerContext.goto(path, this.gwtEventHandlerContext.params);
        } else {
            // update the parent node to update the current node data (needed for add / remove / move etc ..
            // TODO: do not call forceCMUpdate() but let the application update by itself ( BACKLOG-8369 )
            this.props.client.query({
                query: GetNodeAndChildrenByPathQuery,
                fetchPolicy: "network-only",
                variables: {
                    "path": path.substring(0, path.lastIndexOf("/")),
                    "language": this.gwtEventHandlerContext.dxContext.lang,
                    "displayLanguage": this.gwtEventHandlerContext.dxContext.uilang
                }
            }).then(forceRefresh && window.forceCMUpdate());
        }
    }

    render() {

        const {contentSource, selectedRow, notificationContext, t, children} = this.props;
        let queryHandler = contentQueryHandlerBySource[contentSource];

        return <DxContext.Consumer>{dxContext => {
            return <CmRouter render={({path, params, goto}) => {

                this.gwtEventHandlerContext = {
                    path: path,
                    params: params,
                    goto: goto,
                    dxContext: dxContext
                };

                const layoutQuery = queryHandler.getQuery();
                const layoutQueryParams = queryHandler.getQueryParams(path, this.state, dxContext, params);

                return <Query query={layoutQuery} variables={layoutQueryParams}>
                    {({loading, error, data}) => {
                        if (error) {
                            console.log("Error when fetching data: " + error);
                            let message = t('label.contentManager.error.queryingContent', {details: (error.message ? error.message : '')});
                            notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                            return null;
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
                                    name: (contentNode.title !== null ? contentNode.title.value : contentNode.displayName),
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
                                    isSelected: selectedRow ? selectedRow.path === contentNode.path : false,
                                    width: (contentNode.width != null ? contentNode.width.value : ''),
                                    height: (contentNode.width != null ? contentNode.height.value : '')
                                }
                            });
                        }
                        return children({rows: rows, totalCount: totalCount, layoutQuery: layoutQuery, layoutQueryParams: layoutQueryParams});
                    }}
                </Query>
            }}/>
        }}</DxContext.Consumer>;
    }
}

ContentData = _.flowRight(
    withNotifications(),
    translate(),
    withApollo
)(ContentData);

export {ContentData};