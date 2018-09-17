import React from 'react';
import {Query, withApollo} from 'react-apollo';
import {
    BrowsingQueryHandler,
    SearchQueryHandler,
    Sql2SearchQueryHandler,
    FilesQueryHandler,
    GetNodeAndChildrenByPathQuery
} from "./gqlQueries";
import * as _ from "lodash";
import {withNotifications, ProgressOverlay} from '@jahia/react-material';
import {register as gwtEventHandlerRegister, unregister as gwtEventHandlerUnregister} from "./eventHandlerRegistry";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {setUrl} from "./redux/actions";


const contentQueryHandlerBySource = {
    "browsing": new BrowsingQueryHandler(),
    "files": new FilesQueryHandler(),
    "search": new SearchQueryHandler(),
    "sql2Search": new Sql2SearchQueryHandler()
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

    onGwtContentModification(nodePath, nodeName, operation) {
        // clean up the cache entry
        const path = nodePath.substring(0, nodePath.lastIndexOf("/") + 1) + nodeName;
        if (nodePath === this.gwtEventHandlerContext.path && nodePath !== path) {
            this.gwtEventHandlerContext.setPath(path, this.gwtEventHandlerContext.params);
        } else {
            // update the parent node to update the current node data (needed for add / remove / move etc ..
            // TODO: do not call forceCMUpdate() but let the application update by itself ( BACKLOG-8369 )
            this.props.client.query({
                fetchPolicy: "network-only",
                query: GetNodeAndChildrenByPathQuery,
                variables: {
                    "path": path.substring(0, path.lastIndexOf("/")),
                    "language": this.gwtEventHandlerContext.lang,
                    "displayLanguage": this.gwtEventHandlerContext.uiLang
                }
            }).then(operation === "create" && window.forceCMUpdate());
        }
    }

    render() {
        const {contentSource, notificationContext, t, children, page, rowsPerPage, siteKey, lang, path, searchTerms, searchContentType, sql2SearchFrom, sql2SearchWhere, setPath, uiLang} = this.props;
        const params = {searchContentType: searchContentType, searchTerms: searchTerms, sql2SearchFrom: sql2SearchFrom, sql2SearchWhere: sql2SearchWhere};
        let queryHandler = contentQueryHandlerBySource[contentSource];
        const rootPath = `/sites/${siteKey}`
        this.gwtEventHandlerContext = {
            path: path,
            params: params,
            setPath: setPath,
            lang: lang,
            uiLang: uiLang
        };

        const paginationState = {
            page: page,
            rowsPerPage: rowsPerPage
        };

        const layoutQuery = queryHandler.getQuery();
        const layoutQueryParams = queryHandler.getQueryParams(path, paginationState, uiLang, lang, params, rootPath);

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
                            name: contentNode.displayName,
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
    lang: state.language,
    path: state.path,
    searchTerms: state.params.searchTerms,
    searchContentType: state.params.searchContentType,
    sql2SearchFrom: state.params.sql2SearchFrom,
    sql2SearchWhere: state.params.sql2SearchWhere,
    uiLang: state.uiLang
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    setPath: (path, params) => dispatch(setUrl(null, null, null, path, params))
});

ContentData = _.flowRight(
    withNotifications(),
    translate(),
    withApollo,
    connect(mapStateToProps, mapDispatchToProps)
)(ContentData);

export {ContentData};