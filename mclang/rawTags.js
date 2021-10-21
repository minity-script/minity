exports.rawTags = {
  d: {
    props: {},
    block: true,
  },
  p: {
    props: {},
    paragraph: true,
    block: true,
  },
  h: {
    props: {
      bold: true
    },
    paragraph: true,
    block: true,
  },
  span: {
    props: {}
  },
  t: {
    props: {}
  },
  reset: {
    props: {
      bold: false,
      italic: false,
      underlined: false,
      obfuscated: false,
      strikethrough: false,
      font: "minecraft:default"
    }
  },
  b: {
    props: {
      bold: true
    }
  },
  i: {
    props: {
      italic: true
    }
  },
  s: {
    props: {
      underlined: true
    }
  },
  s: {
    props: {
      strikethrough: true
    }
  },
  o: {
    props: {
      strikethrough: true
    }
  },
  a: {
    props: ({ href, ...rest }) => ({
      clickEvent: {
        action: "open_url",
        value: href
      },
      color: "blue",
      strikethrough: true
    })
  },
  black: {
    props: { color: "black" }
  },
  dark_blue: {
    props: { color: "dark_blue" }
  },
  dark_green: {
    props: { color: "dark_green" }
  },
  dark_aqua: {
    props: { color: "dark_aqua" }
  },
  dark_red: {
    props: { color: "dark_red" }
  },
  dark_purple: {
    props: { color: "dark_purple" }
  },
  gold: {
    props: { color: "gold" }
  },
  gray: {
    props: { color: "gray" }
  },
  dark_gray: {
    props: { color: "dark_gray" }
  },
  blue: {
    props: { color: "blue" }
  },
  green: {
    props: { color: "green" }
  },
  aqua: {
    props: { color: "aqua" }
  },
  red: {
    props: { color: "red" }
  },
  light_purple: {
    props: { color: "light_purple" }
  },
  yellow: {
    props: { color: "yellow" }
  },
  white: {
    props: { color: "white" }
  },
}