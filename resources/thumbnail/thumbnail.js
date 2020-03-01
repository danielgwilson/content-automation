class Thumbnail {
  constructor() {}
  setTitle(title) {
    const el = document.querySelector(".title");
    el.innerHTML = title;
    $(".title-container").textfill({
      maxFontPixels: 200,
      changeLineHeight: true
    });
  }
  setSubreddit(subreddit) {
    const el = document.querySelector(".subreddit");
    el.innerHTML = subreddit;
    $(".subreddit-container").textfill({
      maxFontPixels: 200,
      changeLineHeight: true
    });
  }
}
const thumbnail = new Thumbnail();
