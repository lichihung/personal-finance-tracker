// src/theme.js
import { extendTheme } from "@chakra-ui/react"

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "cream.50",
        color: "ink.900",
        letterSpacing: "1px",
      },
      "*": {
      letterSpacing: "1px",
    },
    },
  },
  colors: {
    brand: {
      900: "#003d20",
      800: "#0F4A38",
      700: "#89a899",
      600: "#bdd2c8",
    },
    cream: {
      50: "#faf7ef",
      100: "#EFE7DA",
    },
    ink: {
      900: "#36403b",
      700: "#003d20",
    },
    line: {
      200: "#e1d3cb67",
      400: "#e1d3cb",
    },
    accent: {
      500: "#c9a24d",
    },
  },
  radii: {
    xl: "8px",
    "2xl": "24px",
    full: "9999px",
  },
  shadows: {
    soft: "0 8px 24px rgba(15, 23, 42, 0.06)",
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "full",
        fontWeight: 600,
        _focus: {outline: "none"},
      },
      variants: {
        solid: {
          bg: "brand.900",
          color: "white",
          px: "20px",
          py: "16px",
          _hover: { bg: "brand.800" , borderColor: "brand.900",},
          _active: { bg: "brand.700" ,   borderColor: "brand.900",},
        },
        light: {
          bg: "brand.700",
          color: "white",
          fontWeight: 400,
          px: "16px",
          py: "10px",
          _hover: { bg: "brand.800" , borderColor: "brand.900",},
          _active: { bg: "brand.700" ,   borderColor: "brand.900",},
        },
        outline: {
          fontWeight: 400,
          color: "brand.800",
          borderColor: "cream.50",
          _hover: { color: "brand.900", borderColor: "cream.50", bg: "transparent" },
          _focus: {outline: "none", bg: "brand.700"},
        },
        ghost: {
          color: "brand.900",
          _hover: { bg: "transparent", borderColor: "brand.900" },
        },
        simple: {
          color: "brand.900",
          _hover: { bg: "transparent", borderColor: "transparent" },
        },
        brandOutline: {
          borderColor: "brand.900",
          color: "brand.900",
          bg: "transparent",
          fontWeight: 300,
          px: "16px",
          py: "16px",
          h: "34px",
          _hover: { bg: "brand.900", color: "white", borderColor: "brand.900",},
          _active: { bg: "brand.800", color: "white", borderColor: "brand.900",},
          _focus: {bg: "transparent", color: "brand.900", borderColor: "brand.900", outline: "none"},
        },
      },
    },
    Select: {
        variants: {
            outline: {
            field: {
                borderRadius: "full",
                borderColor: "brand.900",
                bg: "transparent",
                color: "brand.900",
                px: "20px",
                fontWeight: 300,
                h: "34px",
                _hover: { borderColor: "brand.700" },
                _focus: {borderColor: "brand.900", bg: "transparent", color: "brand.900"},
                option: {
                color: "black",
                },
            },
            icon: {
                color: "brand.900",
            },
            },

        pillDark: {
            field: {
                borderRadius: "full",
                bg: "brand.900",
                color: "white",
                fontWeight: 300,
                px: "18px",
                h: "34px",
                borderColor: "brand.900",
                borderWidth: "1px",
                _hover: { bg: "brand.800" },
                _focus: {bg: "brand.900", boxShadow: "0 0 0 2px rgba(255,255,255,0.22)"},
                option: { color: "black" },
            },
            icon: {
                color: "white",
            },
            },
        },
        defaultProps: {
            variant: "outline",
        },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderRadius: "full",
            borderColor: "brand.900",
            color: "brand.900",
            bg: "transparent",
            fontWeight: 300,
            px: "16px",
            h: "34px",
            _hover: { borderColor: "brand.700",},
            _active: { borderColor: "brand.700",},
            _focus: { bg: "transparent", borderColor: "brand.700", boxShadow: "0 0 0 1px var(--chakra-colors-brand-700)",},
          },
        },
        pillDark: {
          field: {
            borderRadius: "full",
            bg: "brand.700",
            color: "white",
            px: "16px",
            px: "16px",
            borderColor: "rgba(255,255,255,0.22)",
            _placeholder: { color: "white" },
            _hover: { bg: "brand.800" },
            _focus: { bg: "brand.900", boxShadow: "0 0 0 2px rgba(255,255,255,0.22)" },
          },
        },
      },
      defaultProps: {
        variant: "outline",
      },
    },
    NumberInput: {
      variants: {
        outline: {
          field: {
            borderRadius: "full",
            borderColor: "brand.900",
            color: "brand.900",
            bg: "transparent",
            fontWeight: 300,
            px: "16px",
            h: "34px",
            _hover: { borderColor: "brand.700",},
            _active: { borderColor: "brand.700",},
            _focus: { bg: "transparent", borderColor: "brand.700", boxShadow: "0 0 0 1px var(--chakra-colors-brand-700)",},
          },
        },
      },
      defaultProps: {
        variant: "outline",
      },
    },
    Table: {
      variants: {
        simple: {
            th: {
                color: "brand.900",
                borderColor: "line.400",
                letterSpacing: "0.04em",
                fontSize: "14px",
            },
            td: {
                borderColor: "line.200",
            },
        }

      },
    },
    Badge: {
      baseStyle: {
        borderRadius: "full",
        px: 3,
        py: 1,
        fontWeight: 700,
        letterSpacing: "0.04em",
        borderWidth: "1px",
      },
      variants: {
        light: {
            borderColor: "accent.500",
            color: "accent.500",
            background: "transparent",
        },
        dark: {
            borderColor: "brand.900",
            color: "brand.900",
            background: "transparent",
        }
      }
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: "2xl",
          boxShadow: "soft",
          bg: "white",
        },
      },
    },
  },
})

export default theme
