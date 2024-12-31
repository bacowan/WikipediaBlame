
import Constants from "../constants";
import { Err, Ok, Result } from "../structures/Result";
import Revision from "../structures/Revision";

export interface Options {
  isAsync: boolean,
  revsAtATime: number
}

export async function getRevisionsForArticle(
      articleName: string,
      fromRevId: number | null,
      options: Options,
      abortSignal: AbortSignal) : Promise<Result<Revision[], string>> {

    articleName = articleName.trim();
  
    let url = `${Constants.apiEndpoint}?action=query&titles=${encodeURI(articleName)}&prop=revisions&rvprop=ids|content|timestamp|user|comment&rvlimit=${options.revsAtATime}&format=json&origin=*`;
    if (fromRevId !== null) {
        url += "&rvstartid=" + fromRevId;
    }
    try {
      const response = await fetch(url, { signal: abortSignal });
      if (!response.ok) {
        return Err<string>("failed to fetch");
        // TODO: Error handling
      }
      else {
        const json = await response.json();
        const revisions = getRevisionsFromFetch(json);
        // TODO: Error handling
        return(Ok<Revision[]>(revisions));
      }
    }
    catch (err) {
      return Err<string>("failed to fetch");
    }
  }
  
  function getRevisionsFromFetch(jsonObj: any) : Revision[] {
    const pages = jsonObj?.query?.pages;
    const pageId = Object.keys(pages)[0];
    return (pages[pageId].revisions as any[]).map(r => ({
      id: r["revid"] as number,
      content: r["*"] as string,
      timestamp: new Date(r["timestamp"]),
      user: r["user"] as string,
      comment: r["comment"] as string
    }));
  }