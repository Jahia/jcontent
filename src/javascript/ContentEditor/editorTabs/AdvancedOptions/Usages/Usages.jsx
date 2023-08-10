import React from 'react';
import {useContentEditorConfigContext, useContentEditorContext} from '~/ContentEditor/contexts';
import {UsagesTable} from '~/UsagesTable';
import styles from './Usages.scss';

export const Usages = () => {
    const {nodeData} = useContentEditorContext();
    const {lang} = useContentEditorConfigContext();

    return (
        <section className={styles.tableContainer}>
            <UsagesTable path={nodeData.path} language={lang}/>
        </section>
    );
};
