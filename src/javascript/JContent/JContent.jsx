import React, {Suspense} from 'react';
import {registry} from '@jahia/ui-extender';
import {LayoutModule} from '@jahia/moonstone';
import ContentNavigation from './ContentNavigation';
import {Route, Switch} from 'react-router';
import {ProgressPaper} from '@jahia/design-system-kit';

export const JContent = () => {
    const routes = registry.find({type: 'route', target: 'jcontent'});
    const accordionItems = registry.find({type: 'accordionItem', target: 'jcontent'});

    return (
        <LayoutModule
            navigation={<ContentNavigation/>}
            content={
                <Suspense fallback={<ProgressPaper/>}>
                    <Switch>
                        {routes.map(r => (
                            <Route key={r.key}
                                   path={r.path}
                                   render={r.render}
                                   component={r.component}
                            />
                        ))}
                        {accordionItems.map(item => (
                            <Route key={item.key}
                                   path={'/jcontent/:siteKey/:lang/' + item.key}
                                   render={item.routeRender}
                                   component={item.routeComponent}
                            />
                        ))}
                    </Switch>
                </Suspense>
            }
        />
    );
};

export default JContent;
