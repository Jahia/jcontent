import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import ContentNavigation from './ContentNavigation';
import PropTypes from 'prop-types';
import {registry} from '@jahia/ui-extender';
import {useNodeChecks} from '@jahia/data-helper';
import {cmGoto} from '~/JContent/JContent.redux';
import NavigationHeader from '~/JContent/ContentNavigation/NavigationHeader';
import {mergeDeep} from '~/JContent/JContent.utils';

const ContentNavigationContainer = ({handleNavigationAction, selector, accordionItemTarget, accordionItemType, header, accordionItemProps}) => {
    const dispatch = useDispatch();
    const {siteKey, language, mode} = useSelector(selector);

    let accordionItems = registry.find({type: accordionItemType, target: accordionItemTarget});

    if (accordionItemProps) {
        accordionItems = accordionItems.map(item => {
            const overrideProps = accordionItemProps[item.key];

            if (overrideProps) {
                return mergeDeep({}, item, overrideProps);
            }

            return item;
        });
    }

    const sitePermissions = accordionItems.map(item => item.requiredSitePermission).filter(item => item !== undefined);

    const permissions = useNodeChecks({
        path: `/sites/${siteKey}`,
        language: language
    }, {
        requiredSitePermission: sitePermissions
    });

    if (permissions.loading) {
        return null;
    }

    accordionItems = sitePermissions.length === 0 ? accordionItems : accordionItems.filter(accordionItem =>
        permissions.node && Object.prototype.hasOwnProperty.call(permissions.node.site, accordionItem.requiredSitePermission) && permissions.node.site[accordionItem.requiredSitePermission]
    );

    return (
        <ContentNavigation header={header}
                           accordionItems={accordionItems}
                           mode={mode}
                           siteKey={siteKey}
                           handleNavigation={(mode, path) => dispatch(handleNavigationAction(mode, path))}
        />
    );
};

ContentNavigationContainer.propTypes = {
    selector: PropTypes.func,
    accordionItemProps: PropTypes.object,
    accordionItemTarget: PropTypes.string,
    accordionItemType: PropTypes.string,
    handleNavigationAction: PropTypes.func,
    header: PropTypes.element
};

ContentNavigationContainer.defaultProps = {
    header: <NavigationHeader/>,
    selector: state => ({
        mode: state.jcontent.mode,
        siteKey: state.site,
        language: state.language
    }),
    handleNavigationAction: (mode, path) => cmGoto({mode, path}),
    accordionItemTarget: 'jcontent',
    accordionItemType: 'accordionItem'
};

export default ContentNavigationContainer;
