"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    typography: {
      fontFamily: "'Helvetica for Target', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
    },
    palette: {
      primary: {
        main: '#e50914', // red
      },
      secondary: {
        main: '#6e6e6e', // grey
      },
    },
})
  
export default theme