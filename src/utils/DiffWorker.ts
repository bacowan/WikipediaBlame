import * as Diff from 'diff';

onmessage = (e) => {
    if (typeof e.data === 'object') {
        const oldStr = e.data.oldStr;
        const newStr = e.data.newStr;
        const options = e.data.options;
        if (typeof oldStr === 'string' && typeof newStr === 'string' && (options === undefined || typeof options === 'object')) {
            const result = Diff.diffChars(oldStr, newStr, options);
            postMessage({
                ok: true,
                value: result
            });
        }
        else {
            postMessage({
                ok: false,
                value: 'incorrect data type'
            });
        }
    }
    else {
        postMessage({
            ok: false,
            value: 'incorrect data type'
        });
    }
}