// SORT FIELD MAPPER
type SortMapping = {
  [key: string]: string;
};

export const mapSortFieldsMapper = (
  sortField: string,
  mappings: SortMapping,
): string => {
  return mappings[sortField] ?? sortField;
};
