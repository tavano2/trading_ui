import React from "react";
import StockChart from "./views/StockChart";
// import TradingChart from "./views/TradingChart";
import { Container, Typography } from "@mui/material";

function App() {
  return (
      <Container>
        <Typography variant="h3" align="center" gutterBottom>
          Stock Price Tracker
        </Typography>
        <StockChart />
      </Container>
  );
}

export default App;