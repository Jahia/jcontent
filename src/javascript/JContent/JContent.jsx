import React from 'react';
import {registry} from '@jahia/ui-extender';
import {ErrorBoundary, LoaderSuspense} from '@jahia/jahia-ui-root';
import {LayoutModule} from '@jahia/moonstone';
import ContentNavigation from './ContentNavigation';
import {Route, Switch} from 'react-router';
import {shallowEqual, useSelector} from 'react-redux';
import './colors.scss';

export const JContent = () => {
    const routes = registry.find({type: 'route', target: 'jcontent'});
    const {site, mode} = useSelector(state => ({site: state.jcontent.site, mode: state.jcontent.mode}), shallowEqual);
    const item = registry.get('accordionItem', mode);
    const itemEnabled = item && (!item.isEnabled || item.isEnabled(site));

    return (
        <LayoutModule
            navigation={<ContentNavigation/>}
            content={
                <LoaderSuspense>
                    <ErrorBoundary>
                        <Switch>
                            {routes.map(r => r.component ? (
                                <Route key={r.key}
                                       path={r.path}
                                       render={p => <ErrorBoundary>{React.createElement(r.component, p)}</ErrorBoundary>}
                                />
                            ) : (
                                <Route key={r.key}
                                       path={r.path}
                                       render={p => <ErrorBoundary>{r.render(p)}</ErrorBoundary>}
                                />
                            ))}
                            {item && itemEnabled && (
                                item.routeComponent ? (
                                    <Route key={item.key}
                                           path={'/jcontent/:siteKey/:lang/' + item.key}
                                           render={p => <ErrorBoundary>{React.createElement(item.routeComponent, p)}</ErrorBoundary>}
                                    />
                                ) : (
                                    <Route key={item.key}
                                           path={'/jcontent/:siteKey/:lang/' + item.key}
                                           render={props => <ErrorBoundary>{item.routeRender(props, item)}</ErrorBoundary>}
                                    />
                                )
                            )}
                        </Switch>
                    </ErrorBoundary>
                </LoaderSuspense>
            }
        />
    );
};

export default JContent;
