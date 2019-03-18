import gql from 'graphql-tag';
import {PredefinedFragments, replaceFragmentsInDocument} from '@jahia/apollo-dx';
import * as _ from 'lodash';

const ActionRequirementsQuery = gql`
    query ActionRequirementsQuery($path:String!, $language:String!) {
        jcr {
            nodeByPath(path:$path) {
                name
                supportsPublication
                aggregatedPublicationInfo(language: $language) {
                    publicationStatus
                }
                ...requirements
                ...NodeCacheRequiredFields
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

const ActionRequirementsFragments = {
    displayName: {
        applyFor: 'requirements',
        gql: gql`fragment DisplayName on JCRNode {
            displayName(language: $language)
        }`
    },
    primaryNodeType: {
        variables: {
            displayLanguage: 'String!'
        },
        applyFor: 'requirements',
        gql: gql`fragment PrimaryNodeType on JCRNode {
            primaryNodeType {
                name
                displayName(language: $displayLanguage)
                icon
            }
        }`
    },
    allowedChildNodeTypes: {
        variables: {
            baseChildNodeType: 'String!'
        },
        applyFor: 'requirements',
        gql: gql`fragment ProvideTypes on JCRNode {
            allowedChildNodeTypes(fieldFilter: {filters: [{fieldName: "supertypes", evaluation: NOT_EMPTY}]}) {
                name
                supertypes(fieldFilter: {filters: [{fieldName: "name", value: $baseChildNodeType}]}) {
                    name
                }
            }
        }`
    },
    requiredChildNodeType: {
        variables: {
            childNodeTypes: '[String!]'
        },
        applyFor: 'requirements',
        gql: gql`fragment AllowedChildNodeType on JCRNode {
            allowedChildNodeTypes(fieldFilter: {filters: [{fieldName: "name", evaluation:AMONG, values: $childNodeTypes}]}) {
                name
            }
        }`
    },
    retrieveProperties: {
        variables: {
            retrievePropertiesNames: '[String!]!'
        },
        applyFor: 'requirements',
        gql: gql`fragment NodeProperties on JCRNode {
            properties(names: $retrievePropertiesNames, language: $language) {
                name
                value
                values
            }
        }`
    },
    isNodeType: {
        variables: {
            isNodeType: 'InputNodeTypesInput!'
        },
        applyFor: 'requirements',
        gql: gql`fragment NodeIsNodeType on JCRNode {
            isNodeType(type: $isNodeType)
        }`
    },
    isNotNodeType: {
        variables: {
            isNotNodeType: 'InputNodeTypesInput!'
        },
        applyFor: 'requirements',
        gql: gql`fragment NodeIsNotNodeType on JCRNode {
            isNotNodeType: isNodeType(type: $isNotNodeType)
        }`
    },
    retrievePermission: permissionNames => ({
        variables: permissionNames.map((name, idx) => idx).reduce((acc, idx) => Object.assign(acc, {['permission' + idx]: 'String!'}), {}),
        applyFor: 'requirements',
        gql: gql`fragment NodePermission on JCRNode {
            ${permissionNames.map((name, idx) => idx).reduce((acc, idx) => acc + ' ' + permissionNames[idx].replace(':', '_') + ':hasPermission(permissionName: $permission' + idx + ') ', '')}
        }`
    }),
    permission: {
        variables: {
            permission: 'String!'
        },
        applyFor: 'requirements',
        gql: gql`fragment NodeHasPermission on JCRNode {
            hasPermission(permissionName: $permission)
        }`
    },
    siteInstalledModules: {
        applyFor: 'requirements',
        gql: gql`fragment SiteInstalledModules on JCRNode {
            site {
                installedModulesWithAllDependencies
                ...NodeCacheRequiredFields
            }
        }`
    },
    siteLanguages: {
        applyFor: 'requirements',
        gql: gql`fragment SiteLanguages on JCRNode {
            site {
                defaultLanguage
                ...NodeCacheRequiredFields
                languages {
                    displayName
                    language
                    activeInEdit
                }
            }
        }`
    },
    displayableNodePath: {
        applyFor: 'requirements',
        gql: gql`fragment DisplayableNodePath on JCRNode {
            displayableNode {
                path
            }
        }`
    },
    retrieveLockInfo: {
        applyFor: 'requirements',
        gql: gql`fragment LockInfo on JCRNode {
            lockOwner: property(name: "jcr:lockOwner") {
                value
            }
            lockTypes: property(name: "j:lockTypes") {
                values
            }
        }`
    },
    retrieveContentRestriction: {
        applyFor: 'requirements',
        gql: gql`fragment ContentRestriction on JCRNode {
            contributeTypes: property(name: "j:contributeTypes") {
                values
            }
            ancestors(fieldFilter: {filters: {evaluation: NOT_EMPTY, fieldName: "contributeTypes"}}) {
                contributeTypes : property(name: "j:contributeTypes", language: $language) {
                    values
                }
            }
        }`
    },
    retrieveSubNodes: {
        applyFor: 'requirements',
        gql: gql`fragment subNodes on JCRNode {
            subNodes: children(typesFilter: {types: ["jnt:file", "jnt:folder", "jnt:content", "jnt:contentFolder"], multi: ANY}) {
                pageInfo {
                    totalCount
                }
            }
        }`
    }
};

class ActionRequirementsQueryHandler {
    constructor(context) {
        this.requirementsFragments = [];
        this.variables = {
            path: context.path,
            language: context.language,
            displayLanguage: context.uiLang
        };

        if (context.retrieveDisplayName) {
            this.requirementsFragments.push(ActionRequirementsFragments.displayName);
        }
        if (context.retrievePrimaryNodeType) {
            this.requirementsFragments.push(ActionRequirementsFragments.primaryNodeType);
        }
        if (!_.isEmpty(context.requiredPermission)) {
            this.requirementsFragments.push(ActionRequirementsFragments.permission);
            this.variables.permission = context.requiredPermission;
        }
        if (!_.isEmpty(context.retrievePermission)) {
            this.requirementsFragments.push(ActionRequirementsFragments.retrievePermission(context.retrievePermission));
            Object.assign(this.variables, context.retrievePermission.map((name, idx) => idx).reduce((acc, idx) => Object.assign(acc, {['permission' + idx]: context.retrievePermission[idx]}), {}));
        }
        if (!_.isEmpty(context.hideOnNodeTypes)) {
            this.requirementsFragments.push(ActionRequirementsFragments.isNotNodeType);
            this.variables.isNotNodeType = {types: context.hideOnNodeTypes};
        }
        if (!_.isEmpty(context.showOnNodeTypes)) {
            this.requirementsFragments.push(ActionRequirementsFragments.isNodeType);
            this.variables.isNodeType = {types: context.showOnNodeTypes};
        }
        if (!_.isEmpty(context.retrieveProperties)) {
            this.requirementsFragments.push(ActionRequirementsFragments.retrieveProperties);
            this.variables = {...context.retrieveProperties, ...this.variables};
        }
        if (!_.isEmpty(context.requireModuleInstalledOnSite)) {
            this.requirementsFragments.push(ActionRequirementsFragments.siteInstalledModules);
        }
        if (!_.isEmpty(context.contentType)) {
            this.requirementsFragments.push(ActionRequirementsFragments.requiredChildNodeType);
            this.variables.childNodeTypes = [context.contentType];
        }
        if (!_.isEmpty(context.contentTypes)) {
            this.requirementsFragments.push(ActionRequirementsFragments.requiredChildNodeType);
            this.variables.childNodeTypes = context.contentTypes;
        }
        if (!_.isEmpty(context.baseContentType)) {
            this.requirementsFragments.push(ActionRequirementsFragments.allowedChildNodeTypes);
            this.variables.baseChildNodeType = context.baseContentType;
        }
        if (context.retrieveSiteLanguages) {
            this.requirementsFragments.push(ActionRequirementsFragments.siteLanguages);
        }
        if (context.getDisplayableNodePath) {
            this.requirementsFragments.push(ActionRequirementsFragments.displayableNodePath);
        }
        if (context.getLockInfo) {
            this.requirementsFragments.push(ActionRequirementsFragments.retrieveLockInfo);
        }
        if (context.getContributeTypesRestrictions) {
            this.requirementsFragments.push(ActionRequirementsFragments.retrieveContentRestriction);
        }
        if (context.retrieveSubNodes) {
            this.requirementsFragments.push(ActionRequirementsFragments.retrieveSubNodes);
        }
    }

    getQuery() {
        return replaceFragmentsInDocument(ActionRequirementsQuery, this.requirementsFragments);
    }

    getVariables() {
        return this.variables;
    }
}

export {
    ActionRequirementsQueryHandler
};
