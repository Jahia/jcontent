import ContentRoute from './ContentRoute';

export const jContentRoutes = registry => {
    registry.add('route', 'jcontent-search-route', {
        targets: ['jcontent:99'],
        path: '/jcontent/:siteKey/:lang/search',
        component: ContentRoute
    });

    registry.add('route', 'jcontent-sql2Search-route', {
        targets: ['jcontent:99'],
        path: '/jcontent/:siteKey/:lang/sql2Search',
        component: ContentRoute
    });
};

