import React from "react";
import PropTypes from 'prop-types';
import {withStyles} from "@material-ui/core";
import {withNotifications} from '@jahia/react-material';
import {translate} from 'react-i18next';
import {compose} from "react-apollo/index";
import * as _ from 'lodash';
import {Query} from 'react-apollo';
import {ContentTypesQuery} from "./gqlQueries";
import FilterSelect from './FilterSelect';

class ContentTypeSelect extends React.Component {

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            contentType: props.contentType !== undefined ? props.contentType : '',
        };
    }

    handleChange(data) {
        console.log("Selected data", data);
        let newValue = '';
        if (data != null) {
            newValue = data.value;
        }
        this.setState({contentType: newValue});
        if (this.props.onSelectionChange !== undefined) {
            this.props.onSelectionChange(newValue);
        }
    };

    render() {

        let { contentType, classes, siteKey, displayLanguage, notificationContext, t } = this.props;

        return (
            <Query fetchPolicy={"network-only"} query={ContentTypesQuery} variables={{siteKey: siteKey, displayLanguage: displayLanguage}}>
                {({ loading, error, data }) => {
                let contentTypes = [];
                if (error) {
                    let message = t('label.contentManager.contentTypes.error.loading', {details: (error.message ? error.message : '')});
                    notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
                } else if (data && data.jcr && data.jcr.nodeTypes && data.jcr.nodeTypes.nodes) {
                    contentTypes = _.sortBy(data.jcr.nodeTypes.nodes, [nt => nt.displayName.toLowerCase()], 'displayName');
                    contentTypes = contentTypes.map((nt) => {
                        return {
                            value: nt.name,
                            title: nt.displayName + ' (' + nt.name + ')',
                            label: nt.displayName,
                            icon: nt.icon
                        }
                    });
                    contentTypes.unshift({
                        value: '',
                        title: t('label.contentManager.contentTypes.any'),
                        label: t('label.contentManager.contentTypes.any'),
                        icon: null
                    });
                }
                return (<FilterSelect
                    options={contentTypes}
                    onSelectionChange={this.handleChange}
                />);
            }}
            </Query>
        );
    }
}

ContentTypeSelect = compose(
    withNotifications(),
    translate(),
)(ContentTypeSelect);

export default ContentTypeSelect;