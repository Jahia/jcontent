import React, {useCallback, useEffect} from 'react';
import {registry} from '@jahia/ui-extender';
import {ErrorBoundary, LoaderSuspense, RouteWithTitle} from '@jahia/jahia-ui-root';
import {LayoutModule, Typography} from '@jahia/moonstone';
import {Switch} from 'react-router';
import {useDispatch} from 'react-redux';
import './colors.scss';
import {cmClearSelection} from './redux/selection.redux';
import {NavigationHeader} from '~/JContent/ContentNavigation/NavigationHeader';
import ContentNavigation from './ContentNavigation';
import {cmGoto} from '~/JContent/redux/JContent.redux';
import {useTranslation} from 'react-i18next';
import {getTitle} from './JContent.utils';

export const CategoryManager = () => {
    const {t} = useTranslation('jcontent');
    const item = registry.get('accordionItem', 'category');
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
        mode: state.jcontent.mode,
        siteKey: 'systemsite',
        language: state.language
    });
    const handleNavigationAction = (mode, path) => {
        dispatch(cmGoto({mode, path}));
    };

    return (
        <LayoutModule
            navigation={<ContentNavigation accordionItemTarget="category-manager"
                                           selector={selector}
                                           handleNavigationAction={handleNavigationAction}
                                           header={<NavigationHeader isDisplaySiteSwitcher={false}
                                                                     languageSelector={state => ({
                                                                         lang: state.language,
                                                                         siteKey: 'systemsite',
                                                                         uilang: state.uilang
                                                                     })}
                                                                     logo={<Typography variant="heading" weight="default">Category Manager</Typography>}/>}/>}
            content={
                <LoaderSuspense>
                    <ErrorBoundary>
                        <Switch>
                            {item && (
                                item.routeComponent ? (
                                    <RouteWithTitle key={item.key}
                                                    routeTitle={getTitle(t, item, 'Categories')}
                                                    path="/category-manager/:lang/:mode"
                                                    render={p =>
                                                        <ErrorBoundary>{React.createElement(item.routeComponent, p)}</ErrorBoundary>}
                                    />
                                ) : (<RouteWithTitle key={item.key}
                                                     routeTitle={getTitle(t, item, 'Categories')}
                                                     path="/category-manager/:lang/:mode"
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

export default CategoryManager;
