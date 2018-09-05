import React from "react";
import {Query} from 'react-apollo';
import {PredefinedFragments} from "@jahia/apollo-dx";
import gql from "graphql-tag";
import {Button, Menu, MenuItem} from '@material-ui/core';
import CmRouter from "../CmRouter";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class SiteSwitcher extends React.Component {
    constructor(props) {
        super(props);
        this.variables = {
            query: "select * from [jnt:virtualsite] where ischildnode('/sites')"
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
            for(let i in data.jcr.result.siteNodes) {
                if (data.jcr.result.siteNodes[i].hasPermission) {
                    siteNodes.push(data.jcr.result.siteNodes[i]);
                }
            }
        }
        return siteNodes;
    }
    getTargetSiteLangguageForSwitch(siteNode, currentLang) {
        let newLang = null;
        let siteLanguages = siteNode.site.languages;
        for (let i in siteLanguages) {
            let lang = siteLanguages[i];
            if (lang.activeInEdit && lang === currentLang) {
                newLang = currentLang;
                break;
            }
        }
        if (newLang === null) {
            // target site does not have current language -> we take the site's default one
            newLang = siteNode.site.defaultLanguage;
        }
        return newLang;
    }

    onSelectSite = (siteNode, switchto) => {
        let {dxContext} = this.props;
        // calculate target language
        let newLang = this.getTargetSiteLangguageForSwitch(siteNode, dxContext.lang);
        // switch edit mode linker site
        window.parent.authoringApi.switchSite(siteNode.name);
        // switch to path
        switchto('/' + siteNode.name +  "/" + newLang + "/browse");
    };

    render() {
        let {dxContext} = this.props;
        return <CmRouter render={({path, params, goto, switchto}) => {
            return <Query query={this.query} variables={this.variables}>
                {
                    ({error, loading, data}) => {
                        if (!loading) {
                            let sites = this.getSites(data);
                            return <SiteSwitcherDisplay onSelectSite={(siteNode) => this.onSelectSite(siteNode, switchto)} siteNodes={sites} dxContext={dxContext}/>
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
                        return <MenuItem key={siteNode.uuid} onClick={() => {onSelectSite(siteNode); this.handleClose();}}>{siteNode.displayName}</MenuItem>
                    })}
                </Menu>
            </div>
        }
    }
}

