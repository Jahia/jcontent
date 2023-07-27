import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import styles from './DeprecatedOption.scss';
import {getButtonRenderer} from '~/ContentEditor/utils';
import {DisplayAction} from '@jahia/ui-extender';
import {Typography} from '@jahia/moonstone';
import clsx from 'clsx';

const ButtonRenderer = getButtonRenderer({defaultButtonProps: {variant: 'default', size: 'big', color: 'accent'}});

export const DeprecatedOption = ({tab, actionKey}) => {
    const {t} = useTranslation('jcontent');

    return (
        <section className={styles.container}>
            <Typography variant="heading" className={clsx(styles.item, styles.capitalize)}>
                {tab} - {t('jcontent:label.contentEditor.gwtTabsDeprecation.title')}
            </Typography>
            <Typography className={styles.item}>
                {t(`jcontent:label.contentEditor.gwtTabsDeprecation.warnings.${tab}`)}
            </Typography>
            <div className={styles.item}>
                <DisplayAction actionKey={actionKey}
                               render={props => <ButtonRenderer {...props} buttonLabel={t('jcontent:label.contentEditor.gwtTabsDeprecation.openLegacy')}/>}
                />
            </div>
        </section>
    );
};

DeprecatedOption.propTypes = {
    tab: PropTypes.string.isRequired,
    actionKey: PropTypes.string.isRequired
};
