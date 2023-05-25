import React, {useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {cmOpenTablePaths} from '~/JContent/redux/JContent.redux';
import {Loader} from '@jahia/moonstone';
import {useLayoutQuery} from '~/JContent/ContentRoute/ContentLayout/useLayoutQuery';
import clsx from 'clsx';
import styles from '../../ContentRoute/ContentLayout/ContentLayout.scss';
import JContentConstants from '~/JContent/JContent.constants';
import CategoriesLayout from '~/JContent/CategoriesRoute/CategoriesLayout/CategoriesLayout';
import {registry} from '@jahia/ui-extender';

export const CategoriesLayoutContainer = () => {
    const {t} = useTranslation('jcontent');
    const currentResult = useRef();

    const {
        mode,
        path,
        previewSelection,
        previewState,
        filesMode,
        viewType
    } = useSelector(state => ({
        mode: 'catMan',
        path: state.jcontent.catManPath
    }), shallowEqual);

    const dispatch = useDispatch();
    const accordionItem = registry.get('accordionItem', 'catMan');
    const options = useSelector(state => ({
        mode: 'catMan',
        siteKey: 'systemsite',
        path: state.jcontent.catManPath,
        lang: state.language,
        uilang: state.uilang,
        pagination: state.jcontent.pagination,
        sort: accordionItem.tableConfig.defaultSort,
        openPaths: state.jcontent.openPaths,
        tableView: {viewMode: JContentConstants.tableView.viewMode.FLAT}
    }));

    const {isStructured, result, error, loading} = useLayoutQuery(options);

    const autoExpand = useRef({path: '', level: 1, type: ''});
    useEffect(() => {
        if (isStructured && !loading && result?.nodes?.length && (autoExpand.current.path !== path || autoExpand.current.type !== viewType || autoExpand.current.level < 2)) {
            autoExpand.current.level = (autoExpand.current.path === path && autoExpand.current.type === viewType) ? autoExpand.current.level + 1 : 1;
            autoExpand.current.path = path;
            autoExpand.current.type = viewType;
            dispatch(cmOpenTablePaths(result.nodes.filter(n => n.hasSubRows).flatMap(r => [r.path, ...r.subRows?.filter(c => c.hasSubRows).map(c => c.path)])));
        }
    }, [dispatch, result, isStructured, path, viewType, loading, autoExpand]);

    if (!loading && !result) {
        if (error) {
            const message = t('jcontent:label.contentManager.error.queryingContent', {details: error.message || ''});
            console.error(message);
        }

        return (
            <CategoriesLayout isContentNotFound
                              mode={mode}
                              path={path}
                              filesMode={filesMode}
                              previewState={previewState}
                              previewSelection={previewSelection}
                              rows={[]}
                              isStructured={isStructured}
                              isLoading={loading}
                              totalCount={0}
            />
        );
    }

    if (loading) {
        // While loading new results, render current ones loaded during previous render invocation (if any).
    } else {
        currentResult.current = result;
    }

    let rows = [];
    let totalCount = 0;

    if (currentResult.current) {
        totalCount = currentResult.current.pageInfo.totalCount;
        rows = currentResult.current.nodes;
    }

    return (
        <div className="flexFluid flexCol_nowrap" style={{position: 'relative'}}>
            {loading && (
                <div className={clsx('flexCol_center', 'alignCenter', styles.loader)}>
                    <Loader size="big"/>
                </div>
            )}
            <CategoriesLayout mode={mode}
                              path={path}
                              filesMode={filesMode}
                              previewState={previewState}
                              previewSelection={previewSelection}
                              rows={rows}
                              isLoading={loading}
                              isStructured={isStructured}
                              totalCount={totalCount}
            />
        </div>
    );
};

export default CategoriesLayoutContainer;
