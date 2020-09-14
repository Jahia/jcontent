import React, {Suspense} from 'react';
import {registry} from '@jahia/ui-extender';
import {LayoutModule} from '@jahia/moonstone';
import ContentNavigation from './ContentNavigation';
import {Route, Switch} from 'react-router';
import {ProgressPaper} from '@jahia/design-system-kit';
import {useSelector} from 'react-redux';

export const JContent = () => {
    const routes = registry.find({type: 'route', target: 'jcontent'});
    const {site, mode} = useSelector(state => ({site: state.jcontent.site, mode: state.jcontent.mode}));
    const item = registry.get('accordionItem', mode);
    const itemEnabled = item && (!item.isEnabled || item.isEnabled(site));

    return (
        <LayoutModule
            navigation={<ContentNavigation/>}
            content={
                <Suspense fallback={<ProgressPaper/>}>
                    <Switch>
                        {routes.map(r => r.component ? (
                            <Route key={r.key}
                                   path={r.path}
                                   component={r.component}
                            />
                        ) : (
                            <Route key={r.key}
                                   path={r.path}
                                   render={r.render}
                            />
                        ))}
                        {item && itemEnabled && item.routeComponent ? (
                            <Route key={item.key}
                                   path={'/jcontent/:siteKey/:lang/' + item.key}
                                   component={item.routeComponent}
                            />
                        ) : (
                            <Route key={item.key}
                                   path={'/jcontent/:siteKey/:lang/' + item.key}
                                   render={props => item.routeRender(props, item)}
                            />
                        )}
                    </Switch>
                </Suspense>
            }
        />
    );
};

export default JContent;
