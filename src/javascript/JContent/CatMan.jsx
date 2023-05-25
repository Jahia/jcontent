import React, {useCallback, useEffect} from 'react';
import {registry} from '@jahia/ui-extender';
import {ErrorBoundary, LoaderSuspense} from '@jahia/jahia-ui-root';
import {LayoutModule, Typography} from '@jahia/moonstone';
import {Route, Switch} from 'react-router';
import {useDispatch} from 'react-redux';
import './colors.scss';
import {cmClearSelection} from './redux/selection.redux';
import NavigationHeader from '~/JContent/ContentNavigation/NavigationHeader';
import ContentNavigationContainer from './ContentNavigation';

export const CatMan = () => {
    const item = registry.get('accordionItem', 'catMan');
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

    const selector = state => ({
        mode: 'catMan',
        siteKey: 'systemsite',
        language: state.language
    });
    const handleNavigationAction = (mode, path) => {
        console.log('catMan navigation', mode, path);
    };

    return (
        <LayoutModule
            navigation={<ContentNavigationContainer accordionItemTarget="catMan"
                                                    selector={selector}
                                                    handleNavigationAction={handleNavigationAction}
                                                    header={<NavigationHeader isDisplayLanguageSwitcher={false}
                                                                              logo={<Typography variant="heading" weight="default">Category Manager</Typography>}/>}/>}
            content={
                <LoaderSuspense>
                    <ErrorBoundary>
                        <Switch>
                            {item && (
                                item.routeComponent ? (
                                    <Route key={item.key}
                                           path={'/catMan/:lang/*'}
                                           render={p =>
                                               <ErrorBoundary>{React.createElement(item.routeComponent, p)}</ErrorBoundary>}
                                    />
                                ) : (<Route key={item.key}
                                            path={'/catMan/:lang/*'}
                                            render={props =>
                                                <ErrorBoundary>{item.routeRender(props, item)}</ErrorBoundary>}
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

export default CatMan;
