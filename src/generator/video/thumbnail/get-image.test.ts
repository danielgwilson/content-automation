import { getImage } from "./get-image";

it("Gets an image from Bing / Azure Cognitive Services", async () => {
  const query = "bank teller bees tube";
  const image = await getImage(query);
  console.log(image);
  expect(image).toBeDefined();
});
