import {buildTable, exportFileName, fetchRecords, fieldColumns, fieldValue, STANDARD_COLUMNS, toCsv, toJson, UTF8_BOM} from './exportRecords';

const field = (name, extra = {}) => ({name, label: name, requiredType: 'STRING', multiple: false, internationalized: false, ...extra});

const node = (path, extra = {}) => ({
    path,
    uuid: `uuid-${path}`,
    name: path.split('/').pop(),
    displayName: `Display ${path.split('/').pop()}`,
    primaryNodeType: {name: 'jnt:news', displayName: 'News'},
    values: [],
    references: [],
    ...extra
});

describe('fieldValue', () => {
    it('should type numbers and booleans', () => {
        const values = [{name: 'rank', value: '3'}, {name: 'top', value: 'true'}];
        expect(fieldValue(field('rank', {requiredType: 'LONG'}), {values})).toBe(3);
        expect(fieldValue(field('top', {requiredType: 'BOOLEAN'}), {values})).toBe(true);
    });

    it('should give the display names of references', () => {
        const references = [{name: 'image', refNode: {displayName: 'photo.jpg'}}, {name: 'links', refNodes: [{displayName: 'A'}, {displayName: 'B'}]}];
        expect(fieldValue(field('image', {requiredType: 'WEAKREFERENCE'}), {references})).toEqual('photo.jpg');
        expect(fieldValue(field('links', {requiredType: 'REFERENCE', multiple: true}), {references})).toEqual(['A', 'B']);
    });

    it('should give null or an empty list for a missing value', () => {
        expect(fieldValue(field('title'), {values: []})).toBeNull();
        expect(fieldValue(field('keywords', {multiple: true}), {values: []})).toEqual([]);
    });
});

describe('buildTable', () => {
    const paths = ['/a', '/b'];
    const records = new Map([
        ['en', new Map([
            ['/a', node('/a', {values: [{name: 'title', value: 'Hello'}, {name: 'author', value: 'Jane'}]})],
            ['/b', node('/b', {values: [{name: 'title', value: 'World'}]})]
        ])],
        ['fr', new Map([
            ['/a', node('/a', {values: [{name: 'title', value: 'Bonjour'}]})],
            ['/b', node('/b', {values: []})]
        ])]
    ]);
    const columns = [
        ...fieldColumns([field('title', {internationalized: true}), field('author')]),
        STANDARD_COLUMNS.find(column => column.key === 'type')
    ];

    it('should give one column per language to a translated field only', () => {
        const table = buildTable({columns, records, paths, languages: ['en', 'fr'], labelOf: column => column.label || column.key, nameLabel: 'Name'});
        expect(table.header).toEqual(['Name', 'title (en)', 'title (fr)', 'author', 'type']);
        expect(table.rows).toEqual([
            ['Display a', 'Hello', 'Bonjour', 'Jane', 'News'],
            ['Display b', 'World', null, null, 'News']
        ]);
    });

    it('should give the type name in JSON and its label otherwise', () => {
        const table = buildTable({columns: [columns[2]], records, paths: ['/a'], languages: ['en'], labelOf: column => column.key, nameLabel: 'Name', isJson: true});
        expect(table.rows).toEqual([['Display a', 'jnt:news']]);
    });
});

describe('toCsv', () => {
    it('should start with a byte order mark, quote separators and guard formulas', () => {
        const csv = toCsv({header: ['Name', 'Text'], rows: [['a, b', '=SUM(A1)'], ['x', ['one', 'two']]]});
        expect(csv.startsWith(UTF8_BOM)).toBe(true);
        expect(csv).toEqual(`${UTF8_BOM}Name,Text\r\n"a, b",'=SUM(A1)\r\nx,"one, two"\r\n`);
    });
});

describe('toJson', () => {
    it('should give one object per row, keyed by the header', () => {
        expect(JSON.parse(toJson({header: ['Name', 'rank'], rows: [['a', 3]]}))).toEqual([{Name: 'a', rank: 3}]);
    });
});

describe('exportFileName', () => {
    it('should use the local day and only file-safe characters', () => {
        expect(exportFileName('jnt:news', 'csv', new Date(2026, 10, 16, 21, 30))).toEqual('jnt_news-2026-11-16.csv');
    });
});

describe('fetchRecords', () => {
    it('should query each language in batches, and ask references only when there are some', async () => {
        const client = {query: jest.fn(({variables}) => Promise.resolve({data: {jcr: {nodesByPath: variables.paths.map(path => node(path))}}}))};
        const records = await fetchRecords({client, paths: ['/a', '/b', '/c'], languages: ['en', 'fr'], fields: [field('title')], batchSize: 2});
        expect(client.query).toHaveBeenCalledTimes(4);
        expect(client.query.mock.calls[0][0].variables).toEqual({paths: ['/a', '/b'], language: 'en', names: ['title'], refNames: [], hasRefs: false});
        expect([...records.get('fr').keys()]).toEqual(['/a', '/b', '/c']);
    });
});
