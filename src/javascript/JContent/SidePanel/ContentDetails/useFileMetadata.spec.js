import {adaptFileMetadata} from './useFileMetadata';

describe('adaptFileMetadata', () => {
    const exifDefinition = {
        name: 'jmix:exif',
        displayName: 'Picture file (EXIF)',
        properties: [
            {name: 'j:make', displayName: 'Make', multiple: false, hidden: false},
            {name: 'j:model', displayName: 'Camera model', multiple: false, hidden: false},
            {name: 'j:internal', displayName: 'Internal', multiple: false, hidden: true}
        ]
    };

    const iptcDefinition = {
        name: 'jmix:iptc',
        displayName: 'Available XMP/IPTC data',
        properties: [
            {name: 'j:iptcCredit', displayName: 'Credit', multiple: false, hidden: false},
            {name: 'j:iptcKeywords', displayName: 'Keywords', multiple: true, hidden: false}
        ]
    };

    const build = (properties, nodeTypesByNames = [exifDefinition, iptcDefinition]) => ({
        jcr: {
            nodeById: {uuid: 'uuid1', properties},
            nodeTypesByNames
        }
    });

    it('returns nothing while the query has no data yet', () => {
        expect(adaptFileMetadata(undefined)).toEqual([]);
        expect(adaptFileMetadata({jcr: {nodeById: null, nodeTypesByNames: null}})).toEqual([]);
    });

    it('keeps EXIF and XMP/IPTC in separate groups, listing only the filled properties', () => {
        const data = build([
            {name: 'j:model', value: 'Canon EOS R6'},
            {name: 'j:iptcCredit', value: 'Some agency'},
            {name: 'jcr:title', value: 'unrelated'}
        ]);

        expect(adaptFileMetadata(data)).toEqual([
            {
                name: 'jmix:exif',
                displayName: 'Picture file (EXIF)',
                entries: [{label: 'Camera model', value: 'Canon EOS R6'}]
            },
            {
                name: 'jmix:iptc',
                displayName: 'Available XMP/IPTC data',
                entries: [{label: 'Credit', value: 'Some agency'}]
            }
        ]);
    });

    it('follows the declaration order of the node type, not the order of the values', () => {
        const data = build([
            {name: 'j:model', value: 'Canon EOS R6'},
            {name: 'j:make', value: 'Canon'}
        ]);

        expect(adaptFileMetadata(data)[0].entries.map(entry => entry.label)).toEqual(['Make', 'Camera model']);
    });

    it('orders the groups as requested, whatever order the server answered in', () => {
        const data = build([{name: 'j:make', value: 'Canon'}, {name: 'j:iptcCredit', value: 'Some agency'}],
            [iptcDefinition, exifDefinition]);

        expect(adaptFileMetadata(data).map(group => group.name)).toEqual(['jmix:exif', 'jmix:iptc']);
    });

    it('drops a group whose properties are all empty, which covers a node without the mixin', () => {
        const data = build([{name: 'j:make', value: 'Canon'}]);

        expect(adaptFileMetadata(data).map(group => group.name)).toEqual(['jmix:exif']);
    });

    it('skips hidden property definitions even when they hold a value', () => {
        const data = build([{name: 'j:internal', value: 'should not show'}]);

        expect(adaptFileMetadata(data)).toEqual([]);
    });

    it('joins the entries of a multiple property and ignores empty ones', () => {
        const data = build([{name: 'j:iptcKeywords', values: ['one', '', 'two']}]);

        expect(adaptFileMetadata(data)[0].entries).toEqual([{label: 'Keywords', value: 'one; two'}]);
    });

    it('falls back to the system name when a label does not resolve', () => {
        const data = build([{name: 'j:iptcCredit', value: 'Some agency'}], [
            {name: 'jmix:iptc', displayName: null, properties: [{name: 'j:iptcCredit', displayName: null}]}
        ]);

        expect(adaptFileMetadata(data)).toEqual([
            {
                name: 'jmix:iptc',
                displayName: 'jmix:iptc',
                entries: [{label: 'j:iptcCredit', value: 'Some agency'}]
            }
        ]);
    });

    it('ignores a node type the server did not return', () => {
        const data = build([{name: 'j:iptcCredit', value: 'Some agency'}], [iptcDefinition]);

        expect(adaptFileMetadata(data).map(group => group.name)).toEqual(['jmix:iptc']);
    });
});
