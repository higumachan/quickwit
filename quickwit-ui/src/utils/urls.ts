import { SearchRequest, SortByField, SortOrder } from "./models";

export function hasSearchParams(historySearch: string): boolean {
  const searchParams = new URLSearchParams(historySearch);

  return searchParams.has('index_id') || searchParams.has('query')
    || searchParams.has('start_timestamp') || searchParams.has('end_timestamp');
}

export function parseSearchUrl(historySearch: string): SearchRequest {
  const searchParams = new URLSearchParams(historySearch);
  const startTimestampString = searchParams.get("start_timestamp");
  let startTimestamp = null;
  const startTimeStampParsedInt = parseInt(startTimestampString || "");
  if (!isNaN(startTimeStampParsedInt)) {
    startTimestamp = startTimeStampParsedInt
  }
  let endTimestamp = null;
  const endTimestampString = searchParams.get("end_timestamp");
  const endTimestampParsedInt = parseInt(endTimestampString || "");
  if (!isNaN(endTimestampParsedInt)) {
    endTimestamp = endTimestampParsedInt
  }
  let indexId = null;
  const indexIdParam = searchParams.get("index_id");
  if (indexIdParam !== null && indexIdParam.length > 0) {
    indexId = searchParams.get("index_id");
  }
  let sortByField = null;
  const sortByFieldParam = searchParams.get("sort_by_field");
  if (sortByFieldParam !== null) {
    if (sortByFieldParam.startsWith('+')) {
      const order: SortOrder = 'Asc';
      sortByField = {field_name: sortByFieldParam.substring(1), order: order};
    } else if (sortByFieldParam.startsWith('-')) {
      const order: SortOrder = 'Desc';
      sortByField = {field_name: sortByFieldParam.substring(1), order: order};
    } else {
      const order: SortOrder = 'Asc';
      sortByField = {field_name: sortByFieldParam, order: order};
    }
  }
  return {
    indexId: indexId,
    query: searchParams.get("query") || "",
    maxHits: 10,
    startTimestamp: startTimestamp,
    endTimestamp: endTimestamp,
    sortByField: sortByField,
  };
}

export function toUrlSearchRequestParams(request: SearchRequest): URLSearchParams {
  const params = new URLSearchParams();
  params.append("query", request.query || '*');
  // We have to set the index ID in url params as it's not present in the UI path params.
  // This enables the react app to be able to get index ID from url params 
  // if the user enter directly the UI url.
  params.append("index_id", request.indexId || "");
  if (request.maxHits) {
    params.append("max_hits", request.maxHits.toString());
  }
  if (request.startTimestamp) {
    params.append(
      "start_timestamp",
      request.startTimestamp.toString()
    );
  }
  if (request.endTimestamp) {
    params.append("end_timestamp", request.endTimestamp.toString());
  }
  if (request.sortByField) {
    params.append("sort_by_field", serializeSortByField(request.sortByField));
  }
  return params;
}

export function serializeSortByField(sortByField: SortByField): string {
  const order = sortByField.order === 'Asc' ? '+' : '-'; 
  return `${order}${sortByField.field_name}`;
}