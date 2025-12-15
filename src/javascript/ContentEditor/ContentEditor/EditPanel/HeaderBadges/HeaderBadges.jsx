import React from 'react';
import {PublicationInfoBadge} from './PublicationInfoBadge';
import {LockInfoChip} from './LockInfoChip';
import {WipInfoChip} from './WipInfoChip';
import {UnsavedChip} from './UnsavedChip';
import {ReadOnlyBadge} from './ReadOnlyBadge';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import styles from './HeaderBadges.scss';
import {useContentEditorContext} from '~/ContentEditor/contexts';
import UsagesCountBadge from './UsagesCountBadge';

export const HeaderBadges = () => {
    const {mode} = useContentEditorContext();
    return (
        <div className={styles.badges}>
            {mode === Constants.routes.baseEditRoute && <ReadOnlyBadge isGlobal/>}
            {mode === Constants.routes.baseEditRoute && <PublicationInfoBadge/>}
            {mode === Constants.routes.baseEditRoute && <LockInfoChip/>}
            <WipInfoChip/>
            {mode === Constants.routes.baseEditRoute && <UnsavedChip/>}
            {mode === Constants.routes.baseEditRoute && <UsagesCountBadge/>}
        </div>
    );
};
