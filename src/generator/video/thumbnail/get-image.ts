import config from "config";
import { CognitiveServicesCredentials } from "ms-rest-azure";
import WebSearchAPIClient from "azure-cognitiveservices-websearch";

export async function getImage(query: string) {
  const key: string = config.get("AZURE_COGNITIVE_SERVICES_KEY");
  const credentials = new CognitiveServicesCredentials(key);
  const webSearchApiClient = new WebSearchAPIClient(credentials);

  const results = await webSearchApiClient.web.search(query);

  return results.images;
}
