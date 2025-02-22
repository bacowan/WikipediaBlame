import { getRevisionAttributions, RevisionAttributionProgress } from '../GetRevisionAttributions';
import { describe, expect, it } from 'vitest';
import Revision from '../../structures/Revision';

function FakeRevision(text: string): Revision {
    return {
        id: 1,
        content: text,
        timestamp: new Date(0),
        user: "user",
        comment: "test"
    }
}

describe('getRevisionAttributions', () => {
    it('should have an initial progress return value no compared revisions', async () => {
        const newRevision = FakeRevision("some text");
        const generator = getRevisionAttributions(
            [newRevision, FakeRevision("")],
            undefined,
            undefined,
            false);
        
        const initialResult = await generator.next();
        const progress = initialResult.value as RevisionAttributionProgress;
        expect(progress.attributions.attributions).toEqual(
            Array.from("some text", t => ({ revision: null, char: t })));
    });

    it('should give a single addition diff when going from blank to something', async () => {
        const newRevision = FakeRevision("some text");
        const oldRevision = FakeRevision("");
        const generator = getRevisionAttributions(
            [newRevision, oldRevision],
            undefined,
            undefined,
            false);

        await generator.next(); // first result will be blank to show that the process is starting
        const firstResult = await generator.next();
        const progress = firstResult.value as RevisionAttributionProgress;
        expect(progress.attributions.attributions).toEqual(
            Array.from("some text", t => ({ revision: newRevision, char: t })));
    });

    it('should give all unchanged diffs when going from text to the same text, and there should be no associated revision', async () => {
        const newRevision = FakeRevision("some text");
        const oldRevision = FakeRevision("some text");
        const generator = getRevisionAttributions(
            [newRevision, oldRevision],
            undefined,
            undefined,
            false);

        await generator.next(); // first result will be blank to show that the process is starting
        const firstResult = await generator.next();
        const progress = firstResult.value as RevisionAttributionProgress;
        expect(progress.attributions.attributions).toEqual(
            Array.from("some text", t => ({ revision: null, char: t })));
    });

    it('should handle a combination of additions, removals, and unchanged text', async () => {
        const newRevision = FakeRevision("added text");
        const oldRevision = FakeRevision("text removed");
        const generator = getRevisionAttributions(
            [newRevision, oldRevision],
            undefined,
            undefined,
            false);
        
        await generator.next(); // first result will be blank to show that the process is starting
        const firstResult = await generator.next();
        const progress = firstResult.value as RevisionAttributionProgress;
        expect(progress.attributions.attributions).toEqual(
            Array.from("added ", t => ({ revision: newRevision as Revision | null, char: t }))
            .concat(Array.from("text", t => ({ revision: null as Revision | null, char: t }))));
    });
});