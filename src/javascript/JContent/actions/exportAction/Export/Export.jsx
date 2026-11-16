import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {shallowEqual, useSelector} from 'react-redux';
import {useApolloClient, useQuery} from '@apollo/client';
import {useSiteInfo} from '@jahia/data-helper';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormHelperText} from '@material-ui/core';
import {Button, Checkbox, Dropdown, Loader, RadioGroup, RadioItem, Typography} from '@jahia/moonstone';
import {FormControlLabel} from '@jahia/design-system-kit';
import {CloseOnNavigation} from '~/utils';
import {BulkFieldsQuery, commonFields, isExportable} from '~/JContent/actions/bulkActions/bulkFields';
import {
    buildTable,
    DEFAULT_STANDARD_COLUMNS,
    downloadFile,
    exportFileName,
    fetchRecords,
    fieldColumns,
    RECORD_FORMATS,
    STANDARD_COLUMNS,
    toCsv,
    toJson
} from '../exportRecords/exportRecords';
import {ExportColumnsPicker} from './ExportColumnsPicker';
import styles from './Export.scss';

export const EXPORT_FORMATS = {JAHIA: 'jahia', CSV: 'csv', JSON: 'json'};
const prefix = 'jcontent:label.contentManager.export';

const triggerJahiaExport = ({path, workspace, xml}) => {
    const contextPath = window.contextJsParameters.contextPath;
    const format = xml ? 'xml' : 'zip';
    window.open(`${contextPath}/cms/export/default${path}.${format}?exportformat=${format}&live=${workspace === 'live'}`);
};

const JahiaExportOptions = ({workspace, isXml, onWorkspaceChange, onXmlChange}) => {
    const {t} = useTranslation('jcontent');
    const live = workspace === 'live';

    return (
        <>
            <DialogContentText className={styles.margins}>
                {t(`${prefix}.selectWorkspace`)}
            </DialogContentText>
            <Dropdown
                data={[
                    {label: t(`${prefix}.stagingOnlyOption`), value: 'default', attributes: {'data-cm-role': 'default-workspace'}},
                    {label: t(`${prefix}.stagingAndLiveOption`), value: 'live', attributes: {'data-cm-role': 'live-workspace'}}
                ]}
                label={live ? t(`${prefix}.stagingAndLiveOption`) : t(`${prefix}.stagingOnlyOption`)}
                value={workspace}
                variant="outlined"
                size="medium"
                data-cm-role="select-workspace"
                onChange={(event, item) => onWorkspaceChange(item.value)}
            />
            <FormHelperText>
                {t(`${prefix}.exportDetails`)}
            </FormHelperText>
            <div className={styles.checkboxContainer}>
                <FormControlLabel
                    classes={{root: styles.checkboxLabel}}
                    value="xml"
                    label={<Typography className={styles.checkboxTypo}>{t(`${prefix}.asXml`)}</Typography>}
                    checked={isXml}
                    control={<Checkbox isDisabled={live}/>}
                    data-cm-role="export-as-xml"
                    onChange={event => onXmlChange(event.target.checked)}
                />
            </div>
        </>
    );
};

JahiaExportOptions.propTypes = {
    workspace: PropTypes.string.isRequired,
    isXml: PropTypes.bool.isRequired,
    onWorkspaceChange: PropTypes.func.isRequired,
    onXmlChange: PropTypes.func.isRequired
};

const useRecordOptions = ({paths, isEnabled}) => {
    const {siteKey, language, uilang} = useSelector(state => ({siteKey: state.site, language: state.language, uilang: state.uilang}), shallowEqual);
    const fieldsResult = useQuery(BulkFieldsQuery, {variables: {paths, language: uilang}, skip: !isEnabled});
    const {siteInfo} = useSiteInfo({siteKey, displayLanguage: uilang, uiLanguage: uilang});
    const fields = useMemo(() => commonFields(fieldsResult.data?.jcr?.nodesByPath, isExportable), [fieldsResult.data]);
    const columns = useMemo(() => [...fieldColumns(fields), ...STANDARD_COLUMNS], [fields]);
    const siteLanguages = (siteInfo?.languages || []).filter(entry => entry.activeInEdit !== false);

    return {fields, columns, siteLanguages, language, isLoaded: Boolean(fieldsResult.data), isLoading: fieldsResult.loading, error: fieldsResult.error};
};

export const Export = ({isOpen, onClose, onExited, path, paths, contentType, exportColumns, exportFileName: fileNameBase, defaultFormat}) => {
    const {t} = useTranslation('jcontent');
    const client = useApolloClient();
    const selection = useMemo(() => paths || (path ? [path] : []), [path, paths]);
    const isSingle = selection.length === 1;

    const [format, setFormat] = useState(() => {
        if (defaultFormat && (defaultFormat !== EXPORT_FORMATS.JAHIA || isSingle)) {
            return defaultFormat;
        }

        return isSingle ? EXPORT_FORMATS.JAHIA : EXPORT_FORMATS.CSV;
    });
    const [workspace, setWorkspace] = useState('default');
    const [xml, setXml] = useState(false);
    const [chosen, setChosen] = useState(null);
    const [languages, setLanguages] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState(null);

    const isRecords = format !== EXPORT_FORMATS.JAHIA;
    const options = useRecordOptions({paths: selection, isEnabled: isRecords});
    const exportedLanguages = languages || [options.language];

    useEffect(() => {
        if (chosen === null && options.isLoaded) {
            const available = new Set(options.columns.map(column => column.id));
            const requested = (exportColumns || []).filter(id => available.has(id));
            setChosen(requested.length > 0 ? requested : [...fieldColumns(options.fields).map(column => column.id), ...DEFAULT_STANDARD_COLUMNS]);
        }
    }, [chosen, options.isLoaded, options.fields, options.columns, exportColumns]);

    const labelOf = column => (column.isStandard ? t(`${prefix}.records.column.${column.key}`) : column.label);

    const exportRecords = async () => {
        setIsExporting(true);
        setError(null);
        try {
            const byId = new Map(options.columns.map(column => [column.id, column]));
            const columns = (chosen || []).map(id => byId.get(id)).filter(Boolean);
            const records = await fetchRecords({client, paths: selection, languages: exportedLanguages, fields: columns.filter(column => !column.isStandard)});
            const isJson = format === EXPORT_FORMATS.JSON;
            const table = buildTable({columns, records, paths: selection, languages: exportedLanguages, labelOf, nameLabel: t(`${prefix}.records.column.name`), isJson});
            const base = fileNameBase || contentType || (isSingle ? selection[0].split('/').pop() : 'export');
            const recordFormat = RECORD_FORMATS[format];
            downloadFile(isJson ? toJson(table) : toCsv(table), exportFileName(base, recordFormat.extension), recordFormat.mimeType);
            onClose();
        } catch (e) {
            setError(e?.message || t(`${prefix}.records.failed`));
        } finally {
            setIsExporting(false);
        }
    };

    const onExport = () => {
        if (isRecords) {
            exportRecords();
        } else {
            triggerJahiaExport({path: selection[0], workspace, xml});
            onClose();
        }
    };

    const renderRecordOptions = () => {
        if (options.isLoading || chosen === null) {
            return options.error ? <Typography variant="caption">{t(`${prefix}.records.failed`)}</Typography> : <Loader size="big"/>;
        }

        const languageLabel = exportedLanguages
            .map(code => options.siteLanguages.find(entry => entry.language === code)?.displayName || code)
            .join(', ');

        return (
            <>
                {options.siteLanguages.length > 1 && (
                    <div className={styles.section}>
                        <Typography variant="caption" weight="bold">{t(`${prefix}.records.languages`)}</Typography>
                        <Dropdown variant="outlined"
                                  size="medium"
                                  data={options.siteLanguages.map(entry => ({label: entry.displayName, value: entry.language}))}
                                  values={exportedLanguages}
                                  label={languageLabel}
                                  data-cm-role="export-languages"
                                  onChange={(event, item) => {
                                      const next = exportedLanguages.includes(item.value) ?
                                          exportedLanguages.filter(code => code !== item.value) :
                                          [...exportedLanguages, item.value];
                                      setLanguages(next.length > 0 ? next : exportedLanguages);
                                  }}
                        />
                        <FormHelperText>{t(`${prefix}.records.languagesHint`)}</FormHelperText>
                    </div>
                )}
                <div className={styles.section}>
                    <Typography variant="caption" weight="bold">{t(`${prefix}.records.columns`)}</Typography>
                    <FormHelperText>{t(`${prefix}.records.columnsHint`)}</FormHelperText>
                    <ExportColumnsPicker columns={options.columns} chosen={chosen} labelOf={labelOf} onChange={setChosen}/>
                </div>
            </>
        );
    };

    return (
        <Dialog fullWidth open={isOpen} aria-labelledby="form-dialog-title" data-cm-role="export-options" onExited={onExited} onClose={onClose}>
            <CloseOnNavigation onClose={onClose}/>
            <DialogTitle>
                {t(`${prefix}.dialogTitle`)}
            </DialogTitle>
            <DialogContent>
                <DialogContentText className={styles.margins}>
                    {t(`${prefix}.records.count`, {count: selection.length})}
                </DialogContentText>
                <RadioGroup className={styles.section}
                            name="export-format"
                            value={format}
                            data-cm-role="export-format"
                            onChange={(event, value) => setFormat(value)}
                >
                    <RadioItem id="export-format-jahia"
                               value={EXPORT_FORMATS.JAHIA}
                               isDisabled={!isSingle}
                               label={t(`${prefix}.records.format.jahia`)}
                               description={t(isSingle ? `${prefix}.records.format.jahiaHint` : `${prefix}.records.format.jahiaSingleOnly`)}
                    />
                    <RadioItem id="export-format-csv"
                               value={EXPORT_FORMATS.CSV}
                               label={t(`${prefix}.records.format.csv`)}
                               description={t(`${prefix}.records.format.csvHint`)}
                    />
                    <RadioItem id="export-format-json"
                               value={EXPORT_FORMATS.JSON}
                               label={t(`${prefix}.records.format.json`)}
                               description={t(`${prefix}.records.format.jsonHint`)}
                    />
                </RadioGroup>
                {isRecords ? renderRecordOptions() : (
                    <JahiaExportOptions workspace={workspace}
                                        isXml={xml}
                                        onWorkspaceChange={value => {
                                            setWorkspace(value);
                                            if (value === 'live') {
                                                setXml(false);
                                            }
                                        }}
                                        onXmlChange={setXml}
                    />
                )}
                {error && <Typography variant="caption" className={styles.error} data-cm-role="export-error">{error}</Typography>}
            </DialogContent>
            <DialogActions>
                <Button size="big" label={t('jcontent:label.contentManager.fileUpload.dialogRenameCancel')} onClick={onClose}/>
                <Button
                    size="big"
                    color="accent"
                    data-cm-role="export-button"
                    label={t(`${prefix}.actionLabel`)}
                    isDisabled={isExporting || (isRecords && (chosen === null || chosen.length === 0))}
                    onClick={onExport}
                />
            </DialogActions>
        </Dialog>
    );
};

Export.propTypes = {
    onClose: PropTypes.func.isRequired,
    onExited: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    path: PropTypes.string,
    paths: PropTypes.arrayOf(PropTypes.string),
    /** The type of the exported items, used to name a CSV or JSON file */
    contentType: PropTypes.string,
    /** The columns checked when a CSV or JSON export opens: `prop:<property name>` or `std:<key>`, in export order */
    exportColumns: PropTypes.arrayOf(PropTypes.string),
    /** The start of the CSV or JSON file name, before the date */
    exportFileName: PropTypes.string,
    /** The format selected when the dialog opens: 'jahia', 'csv' or 'json' */
    defaultFormat: PropTypes.oneOf(Object.values(EXPORT_FORMATS))
};

export default Export;
