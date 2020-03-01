type Language =
  | "danish"
  | "dutch"
  | "english"
  | "french"
  | "galician"
  | "german"
  | "italian"
  | "polish"
  | "portuguese"
  | "romanian"
  | "russian"
  | "spanish"
  | "swedish";

declare module "keyword-extractor" {
  function extract(
    str: string,
    options?: {
      remove_digits: boolean;
      return_changed_case: boolean;
      return_chained_words: boolean;
      language: Language;
      remove_duplicates: boolean;
      return_max_ngrams: boolean;
    }
  ): string[];
  function getStopwords(options: { language?: Language }): string[];
}
