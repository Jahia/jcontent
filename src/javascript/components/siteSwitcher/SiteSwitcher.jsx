import React from "react";
import {Query} from 'react-apollo';
import {PredefinedFragments} from "@jahia/apollo-dx";
import gql from "graphql-tag";
import {Button, Menu, MenuItem} from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {lodash as _} from "lodash";
import connect from "react-redux/es/connect/connect";
import {translate} from "react-i18next";
import {ProgressOverlay, withNotifications} from "@jahia/react-material";
import {setSite} from "../redux/actions";

class SiteSwitcher extends React.Component {

    constructor(props) {
        super(props);
        this.variables = {
            query: "select * from [jnt:virtualsite] where ischildnode('/sites')",
        };
        this.query = gql `query SiteNodes($query: String!){
            jcr {
                result:nodesByQuery(query: $query) {
                    siteNodes:nodes {
                        name
                        hasPermission(permissionName: "contentManager")
                        displayName
                        site {
                            defaultLanguage
                            languages {
                                displayName
                                language
                                activeInEdit
                            }
                        }
                        ...NodeCacheRequiredFields
                    }
                }
            }
        }
        ${PredefinedFragments.nodeCacheRequiredFields.gql}
        `;
    }

    getSites(data) {
        let siteNodes = [];
        if (data && data.jcr.result != null) {
            for (let i in data.jcr.result.siteNodes) {
                if (data.jcr.result.siteNodes[i].hasPermission) {
                    siteNodes.push(data.jcr.result.siteNodes[i]);
                }
            }
        }
        return siteNodes;
    }

    render() {
        const {notificationContext, t} = this.props;
        return <Query query={this.query} variables={this.variables}>
            {
                ({error, loading, data}) => {
                    if (error) {
                        console.log("Error when fetching data: " + error);
                        let message = t('label.contentManager.error.queryingContent', {details: (error.message ? error.message : '')});
                        notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                        return null;
                    }

                    if (loading) {
                        return <ProgressOverlay/>;
                    }

                    let sites = this.getSites(data);
                    return <SiteSwitcherDisplay siteNodes={sites}/>
                }
            }
        </Query>
    }
}
SiteSwitcher = _.flowRight(
    translate(),
    withNotifications(),
)(SiteSwitcher);

export default SiteSwitcher;

class SiteSwitcherDisplay extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null
        }
    }

    handleClick = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    render() {
        const {siteKey, siteNodes, loading, onSelectSite} = this.props;
        let {anchorEl} = this.state;
        if (loading) {
            return <span>Loading...</span>
        } else {
            const siteNode = _.find(siteNodes, (siteNode) => siteNode.name === siteKey);
            return <div>
                <Button aria-owns={anchorEl ? 'site-switcher' : null} aria-haspopup="true" onClick={this.handleClick} data-cm-role={'site-switcher'}>
                    {siteNode.displayName}
                    &nbsp;
                    <FontAwesomeIcon icon="chevron-down"/>
                </Button>
                <Menu id="site-switcher" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleClose}>
                    {siteNodes.map((siteNode, i) => {
                        return <MenuItem key={siteNode.uuid} onClick={() => {onSelectSite(siteNode); this.handleClose();}}>{siteNode.displayName}</MenuItem>
                    })}
                </Menu>
            </div>
        }
    }
}


const mapStateToProps = (state, ownProps) => ({
    siteKey: state.site,
    lang: state.language
})

const mapDispatchToProps = (dispatch, ownProps) => ({
    onSelectSite: (siteNode) => dispatch(setSite(siteNode.name))
})

SiteSwitcherDisplay = _.flowRight(
    translate(),
    connect(mapStateToProps, mapDispatchToProps)
)(SiteSwitcherDisplay);