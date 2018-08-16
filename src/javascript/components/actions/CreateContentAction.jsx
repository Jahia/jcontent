import React from 'react';
import Constants from '../constants';
import {ContentTypeQuery} from "../gqlQueries";
import {Query} from "react-apollo";
import {DxContext} from "../DxContext";
import {translate} from "react-i18next";
import * as _ from "lodash";

class CreateContentAction extends React.Component {

    render() {

        const {children, context, t, call, ...rest} = this.props;

        if (_.size(context.nodeTypes) > Constants.maxCreateContentOfTypeDirectItems) {
            return children({...rest, onClick: () => call(context)})
        } else {
            let ctx = _.clone(context);
            return _.map(context.nodeTypes, type => {
                ctx.nodeTypes = [type];
                return <DxContext.Consumer key={type}>{dxContext => (
                    <Query query={ContentTypeQuery} variables={{nodeType: type, displayLanguage: dxContext.uilang}}>
                        {({loading, error, data}) => {

                            if (error) {
                                let message = t('label.contentManager.contentTypes.error.loading', {details: (error.message ? error.message : '')});
                                notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                                return null;
                            }

                            if (loading || !data || !data.jcr) {
                                return null;
                            }

                            return children({
                                ...rest,
                                labelKey: "label.contentManager.create.contentOfType",
                                labelParams: {typeName: data.jcr.nodeTypeByName.displayName},
                                onClick: () => call(ctx)
                            });
                        }}
                    </Query>
                )}</DxContext.Consumer>
            });
        }
    }
}

export default translate()(CreateContentAction);
