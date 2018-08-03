import React from "react";
import {Query} from 'react-apollo';
import gql from "graphql-tag";
import {Button, Menu, MenuItem} from '@material-ui/core';
import CmRouter from "../CmRouter";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class SiteSwitcher extends React.Component {
    constructor(props) {
        super(props);
        this.variables = {
            workspace: 'LIVE',
            query: "select * from [jnt:virtualsite] where isdescendantnode('/sites')"
        };
        this.query = gql `query SiteNodes($query: String!){
            jcr(workspace: LIVE) {
                result:nodesByQuery(query: $query, queryLanguage: SQL2) {
                    siteNodes:nodes {
                        path
                        uuid
                        name
                        hasPermission(permissionName: "contentManager")
                        displayName
                    }
                }
            }
        }`;
    }

    getSites(data) {
        let siteNodes = [];
        if (data && data.jcr.result != null) {
            for(let i in data.jcr.result.siteNodes) {
                if (data.jcr.result.siteNodes[i].hasPermission) {
                    siteNodes.push(data.jcr.result.siteNodes[i]);
                }
            }
        }
        return siteNodes;
    }
    render() {
        let {dxContext} = this.props;
        return <CmRouter render={({path, params, goto, switchto}) => {
            return <Query query={this.query} variables={this.variables} fetchPolicy={"cache-network-only"} >
                {
                    ({error, loading, data}) => {
                        if (!loading) {
                            let sites = this.getSites(data);
                            return <SiteSwitcherDisplay onSelectSite={(path) => switchto(path)} siteNodes={sites} dxContext={dxContext}/>
                        } else {
                            return <SiteSwitcherDisplay loading={true} dxContext={dxContext}/>
                        }
                    }
                }
            </Query>
        }}/>
    }
}

export default SiteSwitcher;

class SiteSwitcherDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.reconstructPath = this.reconstructPath.bind(this);
        this.getCurrentSiteName = this.getCurrentSiteName.bind(this);
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

    reconstructPath(siteNode) {
        let {dxContext} = this.props;
        let constructedPath = '/' + siteNode.name +  "/" + dxContext.lang + "/browse";
        return constructedPath;
    }
    getCurrentSiteName(siteNodes) {
        let {dxContext} = this.props;
        for (let i in siteNodes) {
           if (siteNodes[i].name === dxContext.siteKey) {
               return siteNodes[i].displayName;
           }
        }
    }

    render() {
        let {dxContext, siteNodes, loading, onSelectSite} = this.props;
        let {anchorEl} = this.state;
        if (loading) {
            return <span>Loading...</span>
        } else {
            return <div>
                    <Button aria-owns={anchorEl ? 'site-switcher' : null}
                        aria-haspopup="true"
                        onClick={this.handleClick}>
                        {this.getCurrentSiteName(siteNodes)}
                        &nbsp;
                        <FontAwesomeIcon icon="chevron-down"/>
                    </Button>
                <Menu id="site-switcher"
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={this.handleClose}>
                    {siteNodes.map((siteNode, i) => {
                        return <MenuItem key={siteNode.uuid} onClick={() => {onSelectSite(this.reconstructPath(siteNode)); this.handleClose();}}>{siteNode.displayName}</MenuItem>
                    })}
                </Menu>
            </div>
        }
    }
}

