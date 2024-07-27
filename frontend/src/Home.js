import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Modal,
  TextField,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import axios from "axios";

const BASE_URL = "https://gz2qfy74t0.execute-api.us-east-1.amazonaws.com/dev";

const Home = () => {
  const [quotes, setQuotes] = useState([]);
  const [open, setOpen] = useState(false);
  const [newQuote, setNewQuote] = useState({
    quote: "",
    quoter: "",
    source: "",
  });
  const vertical = "bottom";
  const horizontal = "center";
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const getAllQuotes = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/quotes`);
      if (!response.data || !response.data.quotes) {
        throw new Error("'data' or 'quotes' not present in the response");
      }

      const quotesList = response.data.quotes;
      console.log("Quote fetched successfully!");
      setQuotes(quotesList);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage("An unknown error occurred. Please refresh.");
      setSnackbarOpen(true);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/quotes`, newQuote);
      if (!response.data || !response.data.quote) {
        throw new Error(
          "'data' or 'quote' missing from quote creation api response"
        );
      }
      const createdQuote = response.data.quote;
      console.log("Quote created successfully!");
      setQuotes((prevQuotes) => [...prevQuotes, createdQuote]);
      setSnackbarSeverity("success");
      setSnackbarMessage("Quote created successfully!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error creating quote:", error);
      if (error.response && error.response.status === 409) {
        console.error("Duplicate quote! This quote already exists.");
        setSnackbarSeverity("error");
        setSnackbarMessage("Duplicate quote! This quote already exists.");
      } else {
        console.error("An unknown error occurred.");
        setSnackbarSeverity("error");
        setSnackbarMessage("An unknown error occurred. Please try again.");
      }
      setSnackbarOpen(true);
    } finally {
      setNewQuote({ quote: "", quoter: "", source: "" });
      handleClose();
    }
  };

  useEffect(() => {
    getAllQuotes();
  }, []);

  const handleEdit = async (id) => {
    // Handle edit functionality
    console.log(`Edit quote with id: ${id}`);
  };

  // Method to handle delete functionality
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/quotes/${id}`);
      console.log("Quote delted successfully!");
      setQuotes((prevQuotes) => prevQuotes.filter((quote) => quote.id !== id));
      setSnackbarSeverity("success");
      setSnackbarMessage("Quote deleted successfully!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting quote:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage("An unknown error occurred. Please try again.");
      setSnackbarOpen(true);
    } finally {
      handleClose();
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewQuote((prevQuote) => ({
      ...prevQuote,
      [name]: value,
    }));
  };

  return (
    <Container style={{ marginTop: "32px" }}>
      <Typography variant="h1" sx={{ textAlign: "center" }} gutterBottom>
        Quotes
      </Typography>
      <Box sx={{ padding: 1 }}>
        <Box style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            style={{ marginBottom: "16px" }}
          >
            New
          </Button>
        </Box>
      </Box>

      <Grid container>
        {quotes.map((quote) => (
          <Grid item key={quote.id} xs={12} sm={12} md={12}>
            <Card
              variant="outlined"
              style={{
                minWidth: "275px",
                margin: "16px",
                backgroundColor: "#fcfcfc",
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
                  <FavoriteIcon sx={{ marginRight: 1 }}></FavoriteIcon>
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
                  variant="outlined"
                  color="primary"
                  onClick={() => handleEdit(quote.id)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  variant="contained"
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

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: "10px",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2">
            New Quote
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Quote"
            name="quote"
            value={newQuote.quote}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Quoter"
            name="quoter"
            value={newQuote.quoter}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Source"
            name="source"
            value={newQuote.source}
            onChange={handleChange}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreate}
            style={{ marginTop: "16px" }}
            disabled={newQuote.quote === "" || newQuote.quoter === ""}
          >
            Submit
          </Button>
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical, horizontal }}
        key={vertical + horizontal}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Home;
