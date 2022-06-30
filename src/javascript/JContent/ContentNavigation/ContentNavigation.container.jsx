import React, {useMemo} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import ContentNavigation from './ContentNavigation';
import PropTypes from 'prop-types';
import {registry} from '@jahia/ui-extender';
import {useNodeChecks} from '@jahia/data-helper';
import JContentConstants from '../JContent.constants';
import {createStructuredSelector} from 'reselect';
import {cmGoto} from '~/JContent/JContent.redux';
import NavigationHeader from '~/JContent/ContentNavigation/NavigationHeader';

const ContentNavigationContainer = ({handleNavigation, selectorObject, accordionItemTarget, accordionItemType, header, sitePermissions}) => {
    const selector = useMemo(() => createStructuredSelector(selectorObject), [selectorObject]);
    const dispatch = useDispatch();
    const {siteKey, language, mode} = useSelector(state => selector(state));
    const permissions = useNodeChecks({
        path: `/sites/${siteKey}`,
        language: language
    }, {
        requiredSitePermission: sitePermissions
    });

    if (permissions.loading) {
        return null;
    }

    let accordionItems = registry.find({type: accordionItemType, target: accordionItemTarget});
    accordionItems = sitePermissions.length === 0 ? accordionItems : accordionItems.filter(accordionItem =>
        permissions.node && Object.prototype.hasOwnProperty.call(permissions.node.site, accordionItem.requiredSitePermission) && permissions.node.site[accordionItem.requiredSitePermission]
    );

    return (
        <ContentNavigation header={header}
                           accordionItems={accordionItems}
                           mode={mode}
                           siteKey={siteKey}
                           handleNavigation={(mode, path) => dispatch(handleNavigation(mode, path))}
        />
    );
};

ContentNavigationContainer.propTypes = {
    selectorObject: PropTypes.shape({
        mode: PropTypes.func.isRequired,
        siteKey: PropTypes.func.isRequired,
        language: PropTypes.func.isRequired
    }),
    accordionItemTarget: PropTypes.string,
    accordionItemType: PropTypes.string,
    handleNavigation: PropTypes.func,
    header: PropTypes.element,
    sitePermissions: PropTypes.arrayOf(PropTypes.string)
};

ContentNavigationContainer.defaultProps = {
    header: <NavigationHeader/>,
    selectorObject: {
        mode: state => state.jcontent.mode,
        siteKey: state => state.site,
        language: state => state.language
    },
    handleNavigation: (mode, path) => cmGoto({mode, path}),
    accordionItemTarget: 'jcontent',
    accordionItemType: 'accordionItem',
    sitePermissions: [JContentConstants.accordionPermissions.pagesAccordionAccess, JContentConstants.accordionPermissions.contentFolderAccordionAccess, JContentConstants.accordionPermissions.mediaAccordionAccess, JContentConstants.accordionPermissions.additionalAccordionAccess, JContentConstants.accordionPermissions.formAccordionAccess]
};

export default ContentNavigationContainer;
