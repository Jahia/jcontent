import React from 'react';
import {connect} from 'react-redux';
import {cmGoto} from '../JContent.redux';
import ContentNavigation from './ContentNavigation';
import PropTypes from 'prop-types';
import {registry} from '@jahia/ui-extender';
import {useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';

const ContentNavigationContainer = ({mode, siteKey, handleNavigation}) => {
    let accordionItems = registry.find({type: 'accordionItem', target: 'jcontent'});

    const currentState = useSelector(state => ({site: state.site, language: state.language}));
    const permissions = useNodeChecks({
        path: `/sites/${currentState.site}`,
        language: currentState.language
    }, {
        requiredPermission: ['pagesAccordionAccess', 'contentFolderAccordionAccess', 'mediaAccordionAccess', 'additionalAccordionAccess', 'formAccordionAccess']
    });

    if (permissions.loading) {
        return 'Loading...';
    }

    accordionItems = accordionItems.filter(accordionItem =>
        Object.prototype.hasOwnProperty.call(permissions.node, accordionItem.requiredPermission) && permissions.node[accordionItem.requiredPermission]
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
