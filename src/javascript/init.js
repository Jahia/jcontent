import {registry} from '@jahia/ui-extender';
import register from './JContent.register';

export default function () {
    registry.add('callback', 'jContent', {
        targets: ['jahiaApp-init:1'],
        callback: register
    });
}
