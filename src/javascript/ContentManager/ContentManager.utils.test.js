import {removeFileExtension, getNewCounter} from './ContentManager.utils';

describe('zip utils', () => {
    it('should remove file extension', () => {
        expect(removeFileExtension('file.jpg')).toEqual('file');
        expect(removeFileExtension('file')).toEqual('file');
        expect(removeFileExtension('file.txt')).toEqual('file');
    });

    it('should get new counter', () => {
        expect(getNewCounter([
            {name: 'file01.jpg'},
            {name: 'file2.jpg'},
            {name: 'file5.jpg'},
            {name: 'file4.jpg'}
        ])).toEqual(6);

        expect(getNewCounter([{name: 'file.jpg'}])).toEqual(1);

        expect(getNewCounter([
            {name: 'file1.jpg'},
            {name: 'file5.jpg'},
            {name: 'file8.jpg'},
            {name: 'file2.jpg'}
        ])).toEqual(9);
    });
});
