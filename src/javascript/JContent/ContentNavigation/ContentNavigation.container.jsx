import React from 'react';
import {connect} from 'react-redux';
import {cmGoto} from '../JContent.redux';
import ContentNavigation from './ContentNavigation';
import PropTypes from 'prop-types';
import {registry} from '@jahia/ui-extender';
import {useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import JContentConstants from '../JContent.constants';

const ContentNavigationContainer = ({mode, siteKey, handleNavigation}) => {
    let accordionItems = registry.find({type: 'accordionItem', target: 'jcontent'});

    const currentState = useSelector(state => ({site: state.site, language: state.language}));
    const permissions = useNodeChecks({
        path: `/sites/${currentState.site}`,
        language: currentState.language
    }, {
        requiredSitePermission: [JContentConstants.accordionPermissions.pagesAccordionAccess, JContentConstants.accordionPermissions.contentFolderAccordionAccess, JContentConstants.accordionPermissions.mediaAccordionAccess, JContentConstants.accordionPermissions.additionalAccordionAccess, JContentConstants.accordionPermissions.formAccordionAccess]
    });

    if (permissions.loading) {
        return null;
    }

    accordionItems = accordionItems.filter(accordionItem =>
        permissions.node && Object.prototype.hasOwnProperty.call(permissions.node.site, accordionItem.requiredSitePermission) && permissions.node.site[accordionItem.requiredSitePermission]
    );

    return <ContentNavigation accordionItems={accordionItems} mode={mode} siteKey={siteKey} handleNavigation={handleNavigation}/>;
};

const mapDispatchToProps = dispatch => ({
    handleNavigation: (mode, path) => dispatch(cmGoto({mode, path}))
});

let mapStateToProps = state => ({
    mode: state.jcontent.mode,
    siteKey: state.site
});

ContentNavigationContainer.propTypes = {
    handleNavigation: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired,
    siteKey: PropTypes.string.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(ContentNavigationContainer);
