import React from 'react';
import Constants from '../constants';
import {ContentTypeQuery} from "../gqlQueries";
import {Query} from "react-apollo";
import {DxContext} from "../DxContext";
import {translate} from "react-i18next";

class CreateAction extends React.Component {

    render() {

        const {children, context, t, call, ...rest} = this.props;

        if (_.size(context.nodeTypes) > Constants.numberOfSplitActionTypes) {
            return children({...rest, onClick: () => call(context)})
        } else {
            return _.map(context.nodeTypes, type => {
                context.nodeTypes = [type];
                rest.labelKey= "label.contentManager.create.contentWithArgs";
                return <DxContext.Consumer key={type}>{dxContext => (
                    <Query query={ContentTypeQuery} variables={{nodeType: type, displayLanguage: dxContext.uilang}}>
                        {({loading, error, data}) => {
                            if (error) {
                                let message = t('label.contentManager.contentTypes.error.loading', {details: (error.message ? error.message : '')});
                                notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                                return null;
                            }
                            if (!loading && data && data.jcr && data.jcr.nodeTypeByName && data.jcr.nodeTypeByName.displayName) {
                                rest.labelParams = {
                                    typeName: data.jcr.nodeTypeByName.displayName
                                }
                                return children({...rest, onClick: () => call(context)})
                            }
                            return null;
                        }}
                    </Query>
                )}</DxContext.Consumer>
            });
        }
    }
}

export default translate()(CreateAction);
