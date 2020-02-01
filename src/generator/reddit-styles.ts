interface IStyle {
  backgroundColor: string;
  post: {
    paddingTop?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingBottom?: number;

    width?: number;
    height?: number;

    backgroundColor: string;

    title: {
      paddingTop?: number;
      paddingLeft?: number;
      paddingRight?: number;
      paddingBottom?: number;

      fontFamily: string;
      fontSize: string;
      fontWeight: string;
      lineHeight: string;
      color: string;
    };

    comment: {
      paddingTop?: number;
      paddingLeft?: number;
      paddingRight?: number;
      paddingBottom?: number;

      fontFamily: string;
      fontSize: string;
      fontWeight: string;
      lineHeight: string;
      color: string;
    };
  };
}

const REDDIT_STYLES: { light: IStyle; dark: any } = {
  light: {
    backgroundColor: "rgb(135, 138, 140)",
    post: {
      paddingTop: 40,
      paddingLeft: 48,
      paddingRight: 48,
      paddingBottom: 40,

      width: 1440,

      backgroundColor: "rgb(237, 239, 241)",

      title: {
        paddingTop: 72,
        paddingLeft: 96,
        paddingRight: 16,
        paddingBottom: 16,

        fontFamily: "IBMPlexSans",
        fontSize: "40px",
        fontWeight: "500",
        lineHeight: "48px",
        color: "rgb(26, 26, 27)"
      },

      comment: {
        fontFamily: "NotoSans",
        fontSize: "28px",
        fontWeight: "400",
        lineHeight: "41px",
        color: "rgb(26, 26, 27)"
      }
    }
  },
  dark: {
    backgroundColor: ""
  }
};

export default REDDIT_STYLES;
