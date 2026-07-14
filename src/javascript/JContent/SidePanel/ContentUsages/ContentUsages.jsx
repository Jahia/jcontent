import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Chip, DataTable, Typography, Warning} from '@jahia/moonstone';
import {DisplayAction} from '@jahia/ui-extender';
import {useSidePanelContext} from '~/JContent/SidePanel';
import {useUsages} from '~/UsagesTable/useUsages';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {NodeIcon} from '~/utils';
import {ButtonRendererNoLabel} from '~/utils/getButtonRenderer';
import PublicationStatus from '~/JContent/PublicationStatus';
import styles from './ContentUsages.scss';

const MAX_BADGES = 2;

const localeChips = (locales, t) => {
    const sortedLanguages = locales.includes(null) ?
        [t('jcontent:label.contentEditor.edit.sharedLanguages')] :
        locales.map(l => l.toUpperCase()).sort();
    const totalCount = sortedLanguages.length;
    sortedLanguages.splice(MAX_BADGES);

    return (
        <div className={styles.badges}>
            {sortedLanguages.map(l => <Chip key={l} color="accent" label={l} title={l} className={styles.chip}/>)}
            {totalCount > sortedLanguages.length && <Chip color="accent" label={'+' + (totalCount - sortedLanguages.length)} className={styles.chip}/>}
        </div>
    );
};

export const ContentUsages = () => {
    const {t} = useTranslation('jcontent');
    const {path, lang} = useSidePanelContext();
    const [sort, setSort] = useState({order: 'ASC', orderBy: 'displayName'});
    const {usages, usagesCount, visibleUsages, loading} = useUsages(path, lang, sort);

    if (loading && usages.length === 0) {
        return <LoaderOverlay/>;
    }

    const externalUsagesWarning = Number.isInteger(usagesCount) && Number.isInteger(visibleUsages) && usagesCount !== visibleUsages && (
        <div className={styles.warning}>
            <Warning size="big" color="red"/>
            <Typography variant="body">
                {t('jcontent:label.contentEditor.edit.advancedOption.usages.restricted', {total: usagesCount, visible: visibleUsages})}
            </Typography>
        </div>
    );

    if (usages.length === 0) {
        return (
            <section className={styles.container} data-sel-role="usages-empty">
                {externalUsagesWarning || (
                    <>
                        <Typography variant="heading">
                            {t('jcontent:label.contentEditor.edit.advancedOption.usages.none')}
                        </Typography>
                        <Typography variant="body">
                            {t('jcontent:label.contentEditor.edit.advancedOption.usages.noneDescription')}
                        </Typography>
                    </>
                )}
            </section>
        );
    }

    const columns = [
        {
            key: 'status',
            label: '',
            width: '16px',
            cellProps: {className: styles.statusCellTd},
            render: ({data}) => <PublicationStatus isCompact node={data} className={styles.statusBar}/>
        },
        {
            key: 'displayName',
            label: t('jcontent:label.contentManager.listColumns.name'),
            isSortable: true,
            render: ({value, data}) => (
                <div className={styles.nameCell}>
                    <NodeIcon node={data} className={styles.icon}/>
                    <div className={styles.nameText}>
                        <Typography isNowrap variant="body" title={data.primaryNodeType?.displayName}>{value}</Typography>
                        <Typography isNowrap variant="caption" className={styles.path} title={data.path}>{data.path}</Typography>
                    </div>
                </div>
            )
        },
        {
            key: 'locales',
            label: t('jcontent:label.contentEditor.sidePanel.language'),
            width: '120px',
            render: ({data}) => localeChips(data.locales, t)
        },
        {
            key: 'actions',
            label: '',
            width: '48px',
            render: ({data}) => (
                <div onClick={e => e.stopPropagation()}>
                    <DisplayAction actionKey="contentItemActionsMenu"
                                   path={data.path}
                                   render={ButtonRendererNoLabel}
                                   buttonProps={{variant: 'ghost', size: 'default'}}/>
                </div>
            )
        }
    ];

    return (
        <div className={styles.container} data-sel-role="usages-container">
            {externalUsagesWarning}
            <DataTable
                enableSorting
                data={usages}
                columns={columns}
                primaryKey="uuid"
                sortBy={sort.orderBy}
                sortDirection={sort.order === 'DESC' ? 'descending' : 'ascending'}
                enablePagination={false}
                data-sel-role="usages-table"
                onSortChange={(sortBy, sortDirection) => setSort({
                    orderBy: sortBy,
                    order: sortDirection === 'descending' ? 'DESC' : 'ASC'
                })}
            />
        </div>
    );
};
