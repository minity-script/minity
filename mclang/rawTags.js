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
      bold:true
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
      bold:false,
      italic:false,
      underlined:false,
      obfuscated:false,
      strikethrough:false,
      font:"minecraft:default"
    }
  },
  b: {
    props: {
      bold:true 
    }
  },
  i: {
    props: {
      italic:true 
    }
  },
  s: {
    props: {
      underlined:true 
    }
  },
  s: {
    props: {
      strikethrough:true 
    }
  },
  o: {
    props: {
      strikethrough:true 
    }
  },
  a: {
    props: ({href,...rest}) => ({
      clickEvent: {
        action: "open_url",
        value: href
      },
      color:"blue",
      strikethrough:true 
    })
  },
  a: {
    props: ({href,...rest}) => ({
      clickEvent: {
        action: "open_url",
        value: href
      },
      color:"blue",
      strikethrough:true 
    })
  },
}