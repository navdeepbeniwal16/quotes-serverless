import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  IconButton,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { deleteQuote, fetchAllQuotes } from "./quotes-service";

const Home = () => {
  const [quotes, setQuotes] = useState([]);

  const getAllQuotes = async () => {
    const quotesList = await fetchAllQuotes();
    setQuotes(quotesList);
  };

  useEffect(() => {
    getAllQuotes();
  }, []);

  const handleEdit = async (id) => {
    // Handle edit functionality
    console.log(`Edit quote with id: ${id}`);
  };

  const handleDelete = async (id) => {
    // Handle delete functionality
    console.log(`Delete quote with id: ${id}`);
    await deleteQuote(id);
    setQuotes((prevQuotes) => prevQuotes.filter((quote) => quote.id !== id));
  };

  return (
    <Container style={{ marginTop: "32px" }}>
      <Typography variant="h1" sx={{ textAlign: "center" }} gutterBottom>
        Quotes
      </Typography>
      <Grid container spacing={3}>
        {quotes.map((quote) => (
          <Grid item key={quote.id} xs={12} sm={12} md={12}>
            <Card
              style={{
                minWidth: "275px",
                margin: "16px",
                backgroundColor: "#f7f7f7",
              }}
            >
              <CardContent>
                <Typography variant="h6" component="div">
                  {quote.quote}
                </Typography>
                <Typography
                  style={{ marginBottom: "12px", color: "textSecondary" }}
                >
                  - {quote.quoter}
                </Typography>
                <Typography
                  variant="body2"
                  component="p"
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    height: "40px",
                    wordSpacing: "2px",
                  }}
                  gutterBottom
                >
                  <IconButton>
                    <FavoriteBorderIcon
                      sx={{ marginLeft: -1 }}
                    ></FavoriteBorderIcon>
                  </IconButton>{" "}
                  {quote.likes}
                </Typography>
                <Typography variant="caption" component="p">
                  <strong>Source</strong>: {quote.source}
                </Typography>
                <Typography variant="caption" component="p">
                  <strong>ID</strong>: {quote.id}
                </Typography>
              </CardContent>
              <CardActions style={{ justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => handleEdit(quote.id)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => handleDelete(quote.id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;
