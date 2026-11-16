import gql from 'graphql-tag';
import {REFERENCE_TYPES} from '~/JContent/actions/bulkActions/bulkFields';

export const EXPORT_QUERY_BATCH_SIZE = 100;

export const RECORD_FORMATS = {
    csv: {key: 'csv', extension: 'csv', mimeType: 'text/csv;charset=utf-8'},
    json: {key: 'json', extension: 'json', mimeType: 'application/json'}
};

/** The columns every item has, read from standard properties. `read` takes the node of one language. */
export const STANDARD_COLUMNS = [
    {key: 'path', read: node => node.path},
    {key: 'uuid', read: node => node.uuid},
    {key: 'type', read: (node, {isJson}) => (isJson ? node.primaryNodeType?.name : node.primaryNodeType?.displayName || node.primaryNodeType?.name)},
    {key: 'createdBy', read: node => node.createdBy?.value},
    {key: 'created', read: node => node.created?.value},
    {key: 'lastModifiedBy', read: node => node.lastModifiedBy?.value},
    {key: 'lastModified', read: node => node.lastModified?.value},
    {key: 'publicationStatus', read: node => node.aggregatedPublicationInfo?.publicationStatus},
    {key: 'tags', isList: true, read: node => node.tags?.values || []},
    {key: 'categories', isList: true, read: node => (node.categories?.refNodes || []).map(category => category.displayName)}
].map(column => ({...column, id: `std:${column.key}`, isStandard: true}));

export const DEFAULT_STANDARD_COLUMNS = ['std:type', 'std:lastModified'];

/** One column per field, `id` is `prop:<name>`. */
export const fieldColumns = fields => fields.map(field => ({...field, id: `prop:${field.name}`, isStandard: false}));

export const ExportRecordsQuery = gql`
    query exportRecords($paths: [String!]!, $language: String!, $names: [String], $refNames: [String], $hasRefs: Boolean!) {
        jcr(workspace: EDIT) {
            nodesByPath(paths: $paths) {
                uuid
                workspace
                path
                name
                displayName(language: $language)
                primaryNodeType {
                    name
                    displayName(language: $language)
                }
                createdBy: property(name: "jcr:createdBy") { value }
                created: property(name: "jcr:created") { value }
                lastModifiedBy: property(name: "jcr:lastModifiedBy") { value }
                lastModified: property(name: "jcr:lastModified") { value }
                aggregatedPublicationInfo(language: $language) { publicationStatus }
                tags: property(name: "j:tagList") { values }
                categories: property(name: "j:defaultCategory") {
                    refNodes { uuid workspace path displayName(language: $language) }
                }
                values: properties(names: $names, language: $language) { name value values }
                references: properties(names: $refNames, language: $language) @include(if: $hasRefs) {
                    name
                    refNode { uuid workspace path displayName(language: $language) }
                    refNodes { uuid workspace path displayName(language: $language) }
                }
            }
        }
    }
`;

const chunks = (items, size) => Array.from({length: Math.ceil(items.length / size)}, (_, index) => items.slice(index * size, (index + 1) * size));

/**
 * Reads the selected items once per language, in batches.
 * `refNode` is only asked of reference properties: on another property the server logs an error.
 *
 * @returns {Promise<Map<string, Map<string, object>>>} language => path => node
 */
export const fetchRecords = async ({client, paths, languages, fields, batchSize = EXPORT_QUERY_BATCH_SIZE}) => {
    const refNames = fields.filter(field => REFERENCE_TYPES.includes(field.requiredType)).map(field => field.name);
    const names = fields.filter(field => !REFERENCE_TYPES.includes(field.requiredType)).map(field => field.name);
    const byLanguage = new Map();

    for (const language of languages) {
        const byPath = new Map();
        for (const batch of chunks(paths, batchSize)) {
            // eslint-disable-next-line no-await-in-loop
            const {data} = await client.query({
                query: ExportRecordsQuery,
                variables: {paths: batch, language, names, refNames, hasRefs: refNames.length > 0},
                fetchPolicy: 'network-only'
            });
            (data?.jcr?.nodesByPath || []).forEach(node => byPath.set(node.path, node));
        }

        byLanguage.set(language, byPath);
    }

    return byLanguage;
};

const NUMBER_TYPES = ['LONG', 'DOUBLE', 'DECIMAL'];

const typedValue = (field, value) => {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    if (field.requiredType === 'BOOLEAN') {
        return value === 'true';
    }

    if (NUMBER_TYPES.includes(field.requiredType)) {
        const number = Number(value);
        return Number.isNaN(number) ? value : number;
    }

    return value;
};

/** The value of a field on one node: a value, a list of values, or display names for references. */
export const fieldValue = (field, node) => {
    if (REFERENCE_TYPES.includes(field.requiredType)) {
        const property = (node?.references || []).find(candidate => candidate.name === field.name);
        if (field.multiple) {
            return (property?.refNodes || []).map(reference => reference.displayName);
        }

        return property?.refNode?.displayName ?? null;
    }

    const property = (node?.values || []).find(candidate => candidate.name === field.name);
    if (field.multiple) {
        return (property?.values || []).map(value => typedValue(field, value));
    }

    return typedValue(field, property?.value);
};

/**
 * The header cells and the cells of each row.
 * A translated field gets one column per language when several languages are exported.
 *
 * @param columns the chosen columns, in order
 * @param records the result of fetchRecords
 * @param paths the selected items, in the order of the rows
 * @param languages the exported languages; the first one gives the name and the standard columns
 * @param labelOf (column) => header label
 * @param isJson whether the values are for JSON (typed) or for CSV
 */
export const buildTable = ({columns, records, paths, languages, labelOf, nameLabel, isJson = false}) => {
    const [mainLanguage] = languages;
    const isMultiLanguage = languages.length > 1;
    const expanded = columns.flatMap(column => (!column.isStandard && column.internationalized && isMultiLanguage ?
        languages.map(language => ({column, language, header: `${labelOf(column)} (${language})`})) :
        [{column, language: mainLanguage, header: labelOf(column)}]));

    const header = [nameLabel, ...expanded.map(cell => cell.header)];
    const rows = paths
        .filter(path => records.get(mainLanguage)?.has(path))
        .map(path => {
            const main = records.get(mainLanguage).get(path);
            return [
                main.displayName || main.name,
                ...expanded.map(({column, language}) => {
                    const node = records.get(language)?.get(path);
                    return column.isStandard ? column.read(main, {isJson}) ?? null : fieldValue(column, node);
                })
            ];
        });

    return {header, rows};
};

export const UTF8_BOM = '﻿';

// A cell starting with one of these is a formula for a spreadsheet: it is prefixed so that it stays text.
const escapeCell = value => {
    const text = Array.isArray(value) ? value.filter(entry => entry !== null && entry !== undefined && entry !== '').join(', ') : String(value ?? '');
    const guarded = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return /[",\r\n]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded;
};

export const toCsv = ({header, rows}) => `${UTF8_BOM}${[header, ...rows].map(cells => cells.map(escapeCell).join(',')).join('\r\n')}\r\n`;

export const toJson = ({header, rows}) => `${JSON.stringify(rows.map(cells => Object.fromEntries(header.map((label, index) => [label, cells[index] ?? null]))), null, 2)}\n`;

/** `<base>-YYYY-MM-DD.<extension>`, with the local day and only file-safe characters. */
export const exportFileName = (base, extension, now = new Date()) => {
    const pad = number => String(number).padStart(2, '0');
    const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    return `${String(base || 'export').replace(/[^a-zA-Z0-9-]/g, '_')}-${day}.${extension}`;
};

export const downloadFile = (text, fileName, mimeType) => {
    const url = URL.createObjectURL(new Blob([text], {type: mimeType}));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
};
