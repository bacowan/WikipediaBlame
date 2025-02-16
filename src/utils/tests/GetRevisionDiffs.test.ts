import { timeStamp } from 'console';
import { getRevisionDiffs, RevisionDiffProgress } from '../GetRevisionDiffs';
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

describe('getRevisionDiffs', () => {
    it('should have an initial progress return value no compared revisions', async () => {
        const newRevision = FakeRevision("some text");
        const generator = getRevisionDiffs(
            null,
            [newRevision, FakeRevision("")],
            [],
            false);
        
        const initialResult = await generator.next();
        const progress = initialResult.value as RevisionDiffProgress;
        expect(progress.revisionDiffs).toEqual([{
            text: "some text",
            type: "unchanged",
            revision: newRevision    
        }]);
    });

    it('should give a single addition diff when going from blank to something', async () => {
        const newRevision = FakeRevision("some text");
        const generator = getRevisionDiffs(
            null,
            [newRevision, FakeRevision("")],
            [],
            false);

        await generator.next(); // first result will be blank to show that the process is starting
        const firstResult = await generator.next();
        const progress = firstResult.value as RevisionDiffProgress;
        expect(progress.revisionDiffs).toEqual([{
            text: "some text",
            type: "add",
            revision: newRevision
        }]);
    });

    it('should give a single removal diff when going from something to nothing', async () => {
        const newRevision = FakeRevision("");
        const generator = getRevisionDiffs(
            null,
            [newRevision, FakeRevision("some text")],
            [],
            false);

        await generator.next(); // first result will be blank to show that the process is starting
        const firstResult = await generator.next();
        const progress = firstResult.value as RevisionDiffProgress;
        expect(progress.revisionDiffs).toEqual([{
            text: "some text",
            type: "remove",
            revision: newRevision
        }]);
    });

    it('should give a single unchanged diff when going from text to the same text, and there should be no associated revision', async () => {
        const newRevision = FakeRevision("some text");
        const generator = getRevisionDiffs(
            null,
            [newRevision, FakeRevision("some text")],
            [],
            false);

        await generator.next(); // first result will be blank to show that the process is starting
        const firstResult = await generator.next();
        const progress = firstResult.value as RevisionDiffProgress;
        expect(progress.revisionDiffs).toEqual([{
            text: "some text",
            type: "unchanged",
            revision: null
        }]);
    });

    it('should handle a combination of additions, removals, and unchanged text', async () => {
        const newRevision = FakeRevision("added text");
        const generator = getRevisionDiffs(
            null,
            [newRevision, FakeRevision("text removed")],
            [],
            false);
        
            await generator.next(); // first result will be blank to show that the process is starting
            const firstResult = await generator.next();
            const progress = firstResult.value as RevisionDiffProgress;
            expect(progress.revisionDiffs).toEqual([
                {
                    text: "added ",
                    type: "add",
                    revision: newRevision
                },
                {
                    text: "text",
                    type: "unchanged",
                    revision: null
                },
                {
                    text: " removed",
                    type: "remove",
                    revision: newRevision
                }
            ]);
    });
});