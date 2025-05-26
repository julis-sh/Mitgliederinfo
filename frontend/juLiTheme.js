import { createTheme } from '@mui/material/styles';

// JuLi CD Farben (aus dem offiziellen Styleguide)
const juLiYellow = '#FFD600';
const juLiBlue = '#0033A0';
const juLiBlack = '#231F20';
const juLiWhite = '#FFFFFF';
const juLiGrey = '#F5F5F5';

const theme = createTheme({
  palette: {
    primary: {
      main: juLiYellow,
      contrastText: juLiBlack,
    },
    secondary: {
      main: juLiBlue,
      contrastText: juLiWhite,
    },
    background: {
      default: juLiGrey,
      paper: juLiWhite,
    },
    text: {
      primary: juLiBlack,
      secondary: juLiBlue,
    },
  },
  typography: {
    fontFamily: 'Montserrat, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme; 