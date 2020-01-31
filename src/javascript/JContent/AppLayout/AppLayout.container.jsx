import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {LayoutModule, SecondaryNav} from '@jahia/moonstone';
import ContentNavigation from '../ContentNavigation';
import {Route, Switch, useParams} from 'react-router';
import {registry} from '@jahia/ui-extender';
import NavigationHeader from './NavigationHeader';

const AppLayoutContainer = ({dxContext}) => {
    const routes = registry.find({type: 'route', target: 'jcontent'});
    const {t} = useTranslation('jcontent');
    const {mode} = useParams();
    return (
        <LayoutModule
            navigation={
                <SecondaryNav header={<NavigationHeader/>}>
                    <ContentNavigation mode={mode}/>
                </SecondaryNav>
            }
            content={
                <Switch>
                    {routes.map(r =>
                        <Route key={r.key} path={r.path} render={props => r.render(props, {dxContext, t})}/>
                        )}
                </Switch>
            }
        />
    );
};

AppLayoutContainer.propTypes = {
    dxContext: PropTypes.object.isRequired
};

export default AppLayoutContainer;
