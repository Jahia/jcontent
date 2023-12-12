import React, {useState} from 'react';
import {useContentEditorSectionContext} from '~/ContentEditor/contexts';
import styles from './DateTime.scss';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '~/ContentEditor/utils';
import {useTranslation} from 'react-i18next';
import stylesFieldset from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/FieldSet/FieldSet.scss';
import {Toggle} from '@jahia/design-system-kit';
import {Edit, Reload, Typography} from '@jahia/moonstone';
import PropTypes from 'prop-types';

const EditButton = getButtonRenderer({
    defaultButtonProps: {
        variant: 'outlined',
        size: 'default',
        color: 'accent'
    }
});

const RefreshButton = getButtonRenderer({
    labelStyle: 'none',
    defaultButtonProps: {
        size: 'small',
        color: 'accent'
    }
});

const filterRegularFieldSets = fieldSets => {
    const showFieldSet = fieldSet => {
        if (!fieldSet || fieldSet.name !== 'jmix:conditionalVisibility') {
            return false;
        }

        if (fieldSet.dynamic && !fieldSet.hasEnableSwitch && !fieldSet.activated) {
            return false;
        }

        // We must hide fieldSet in the section when the fieldSet is not dynamic and
        // the fieldSet doesn't contain any fields (empty).
        return fieldSet.dynamic || fieldSet.fields.length > 0;
    };

    return fieldSets.filter(fs => showFieldSet(fs));
};

function render(props, t) {
    return (
        <div className={styles.row}>
            <Typography>{props.typo}</Typography>
            <EditButton {...props}
                        buttonLabel={t('jcontent:label.contentManager.editAction')}
                        buttonIcon={<Edit/>}
            />
        </div>
    );
}

export const DateTime = ({rules, refresh}) => {
    const {t} = useTranslation('jcontent');
    const {sections} = useContentEditorSectionContext();
    const section = sections.filter(s => s.name === 'visibility');
    const fieldSets = filterRegularFieldSets(section[0].fieldSets);
    const [activatedSection, setActivatedSection] = useState(rules > 0);

    if (fieldSets.length === 0) {
        return null;
    }

    const handleChange = () => {
        setActivatedSection(!activatedSection);
    };

    const handleClick = () => {
        refresh();
    };

    let typo;
    switch (rules) {
        case 0:
            typo = t('jcontent:label.contentEditor.visibilityTab.conditions.norules');
            break;
        case 1:
            typo = t('jcontent:label.contentEditor.visibilityTab.conditions.rule');
            break;
        default:
            typo = t('jcontent:label.contentEditor.visibilityTab.conditions.rules', {rulesNumber: rules});
            break;
    }

    return (
        <div className={styles.container}>
            <section>
                <article>
                    <div className={stylesFieldset.fieldSetTitleContainer}>
                        <div className="flexRow_nowrap">
                            <Toggle
                                classes={{
                                    root: stylesFieldset.toggle
                                }}
                                data-sel-role-dynamic-fieldset="jmix:conditionalVisibility"
                                id="jmix:conditionalVisibility"
                                checked={activatedSection}
                                onChange={handleChange}
                            />
                            <div className={styles.rowSwitch}>
                                <Typography component="label"
                                            htmlFor="jmix:conditionalVisibility"
                                            className={stylesFieldset.fieldSetTitle}
                                            variant="subheading"
                                            weight="bold"
                                >
                                    {t('jcontent:label.contentEditor.visibilityTab.conditions.title')}
                                </Typography>
                                <RefreshButton buttonIcon={<Reload/>} onClick={handleClick}/>
                            </div>
                        </div>
                    </div>
                    <div className={stylesFieldset.fields}>
                        {activatedSection &&
                            <DisplayAction actionKey="contentEditorGWTTabAction_visibility"
                                           typo={typo}
                                           render={props => {
                                               return render(props, t);
                                           }}
                            />}
                    </div>
                </article>
            </section>
        </div>
    );
};

DateTime.propTypes = {
    rules: PropTypes.number.isRequired,
    refresh: PropTypes.func.isRequired
};
