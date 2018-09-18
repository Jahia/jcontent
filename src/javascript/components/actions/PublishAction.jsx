import React from "react";
import * as _ from "lodash";
import {Query} from 'react-apollo';
import {PredefinedFragments} from "@jahia/apollo-dx";
import gql from "graphql-tag";
import connect from "react-redux/es/connect/connect";
import {ProgressOverlay, withNotifications} from "@jahia/react-material";

class PublishAction extends React.Component {

    constructor(props) {
        super(props);

        this.query = gql`query siteLanguages($path: String!) {
            jcr {
                result:nodeByPath(path: $path) {
                    site {
                        defaultLanguage
                        ...NodeCacheRequiredFields
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
        ${PredefinedFragments.nodeCacheRequiredFields.gql}
        `;
    }

    getLanguageLabel(languages, currentLang){
        let lang = _.find(languages, function(language) {
            if(language.language === currentLang){
                return language;
            }
        });
        return lang;
    }

    uppercaseFirst = (string) => {
        return string.charAt(0).toUpperCase() + string.substr(1);
    };

    render() {

        const {call, notificationContext, children, context, allLanguages, allSubTree, checkForUnpublication, checkIfLanguagesMoreThanOne, ...rest} = this.props;
        let ctx = _.cloneDeep(context);
        ctx.uuid = [context.node.uuid];
        ctx.allLanguages = allLanguages;
        ctx.allSubTree = allSubTree;
        ctx.checkForUnpublication = checkForUnpublication;
        const variables = {
            path: ctx.path,
        };
        return <Query query={this.query} variables={variables}>
            {
                ({error, loading, data}) => {
                    if(error){
                        console.log("Error when fetching data: " + error);
                        let message = t('label.contentManager.error.queryingContent', {details: (error.message ? error.message : '')});
                        notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                        return null;
                    }
                    if(loading){
                        return <ProgressOverlay/>;
                    }

                    const display = !checkIfLanguagesMoreThanOne || (checkIfLanguagesMoreThanOne && data.jcr.result.site.languages.length > 1);
                    const currentLangLabel = this.getLanguageLabel(data.jcr.result.site.languages, this.props.language);
                    return display ? children({
                        ...rest,
                        labelParams: {language: this.uppercaseFirst(currentLangLabel.displayName)},
                        onClick: () => call(ctx)
                    }) : null;
                }
            }
        </Query>
    }

}

const mapStateToProps = state => {
    return {
        language: state.language
    };
};

PublishAction = _.flowRight(
    withNotifications(),
    connect(mapStateToProps)
)(PublishAction);


export default PublishAction;