import React, {useCallback, useEffect} from 'react';
import {registry} from '@jahia/ui-extender';
import {ErrorBoundary, LoaderSuspense, RouteWithTitle} from '@jahia/jahia-ui-root';
import {LayoutModule} from '@jahia/moonstone';
import ContentNavigation from './ContentNavigation';
import {Switch} from 'react-router';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import './colors.scss';
import {cmClearSelection} from './redux/selection.redux';
import {useTranslation} from 'react-i18next';
import {getTitle} from './JContent.utils';

export const JContent = () => {
    const {t} = useTranslation('jcontent');
    const routes = registry.find({type: 'route', target: 'jcontent'});
    const {site, mode} = useSelector(state => ({site: state.jcontent.site, mode: state.jcontent.mode}), shallowEqual);
    const item = registry.get('accordionItem', mode);
    const itemEnabled = item && (!item.isEnabled || item.isEnabled(site));
    const dispatch = useDispatch();
    const clear = useCallback(() => dispatch(cmClearSelection()), [dispatch]);
    const handleKeyboardNavigation = useCallback(event => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            clear();
        }
    }, [clear]);

    useEffect(() => {
        document.querySelector('body').addEventListener('keydown', handleKeyboardNavigation);
        return () => {
            document.querySelector('body').removeEventListener('keydown', handleKeyboardNavigation);
        };
    }, [handleKeyboardNavigation]);

    return (
        <LayoutModule
            navigation={<ContentNavigation/>}
            content={
                <LoaderSuspense>
                    <ErrorBoundary>
                        <Switch>
                            {routes.map(r => r.component ? (
                                <RouteWithTitle key={r.key}
                                                routeTitle={getTitle(t, r)}
                                                path={r.path}
                                                render={p => <ErrorBoundary>{React.createElement(r.component, p)}</ErrorBoundary>}
                                />
                            ) : (
                                <RouteWithTitle key={r.key}
                                                routeTitle={getTitle(t, r)}
                                                path={r.path}
                                                render={p => <ErrorBoundary>{r.render(p)}</ErrorBoundary>}
                                />
                            ))}
                            {item && itemEnabled && (
                                item.routeComponent ? (
                                    <RouteWithTitle key={item.key}
                                                    routeTitle={getTitle(t, item)}
                                                    path={'/jcontent/:siteKey/:lang/' + item.key}
                                                    render={p => <ErrorBoundary>{React.createElement(item.routeComponent, p)}</ErrorBoundary>}
                                    />
                                ) : (
                                    <RouteWithTitle key={item.key}
                                                    routeTitle={getTitle(t, item)}
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
