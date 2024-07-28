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
  IconButton,
  InputAdornment,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ClearIcon from "@mui/icons-material/Clear";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import axios from "axios";

const BASE_URL = "https://gz2qfy74t0.execute-api.us-east-1.amazonaws.com/dev";

const Home = () => {
  const [quotes, setQuotes] = useState([]);

  // States for new quote creation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuote, setNewQuote] = useState({
    quote: "",
    quoter: "",
    source: "",
  });

  // States for editing a quote
  const [editQuoteId, setEditQuoteId] = useState(null);
  const [editQuoteData, setEditQuoteData] = useState({
    quote: "",
    quoter: "",
    source: "",
  });

  // States for filtering the quotes
  const [filterSource, setFilterSource] = useState("");
  const [filterQuoter, setFilterQuoter] = useState("");

  // States for rendering snackbar
  const vertical = "bottom";
  const horizontal = "center";
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Method to get all of the quotes entries from the backend
  const handelGetAllQuotes = async () => {
    // Reseting the filters states
    setFilterSource("");
    setFilterQuoter("");

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

  // Method to get quotes that matches the filter values
  const handelGetFilteredQuotes = async () => {
    try {
      let url = `${BASE_URL}/quotes?`;
      if (filterQuoter && filterQuoter !== "") {
        url += `quoter=${filterQuoter}&`;
      }
      if (filterSource && filterSource !== "") {
        url += `source=${filterSource}`;
      }

      const response = await axios.get(url);
      if (!response.data || !response.data.quotes) {
        throw new Error("'data' or 'quotes' not present in the response");
      }

      const quotesList = response.data.quotes;
      console.log("Filtered quotes fetched successfully!");
      setQuotes(quotesList);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage("An unknown error occurred. Please refresh.");
      setSnackbarOpen(true);
    }
  };

  // Method to send a quote creation request to the backend
  const handleCreateQuotes = async () => {
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
      setNewQuote({ quote: "", quoter: "", source: "" }); // Reset the state values to empty string
      handleClose();
    }
  };

  // Method to handle the click event on 'Edit' button of a quote card
  const handleEdit = (quote) => {
    console.log("handleEdit is called for", quote.id);
    setEditQuoteId(quote.id);
    setEditQuoteData({
      quote: quote.quote,
      quoter: quote.quoter,
      source: quote.source,
      likes: quote.likes,
    });
  };

  // Method handle the click event on 'Like' button on the quote card
  const handleLike = async (id, quote) => {
    try {
      quote.likes += 1;
      const response = await axios.put(`${BASE_URL}/quotes/${id}`, quote);
      if (!response.data || !response.data.quote) {
        throw new Error("'data' or 'quote' missing from quote update response");
      }

      const updatedQuoteData = response.data.quote;
      setQuotes((prevQuotes) =>
        prevQuotes.map((quote) => (quote.id === id ? updatedQuoteData : quote))
      );
    } catch (error) {
      console.error("Error updating quote:", error);
    } finally {
      setEditQuoteId(null); // Reset edit quote id to 'null'
      setEditQuoteData({ quote: "", quoter: "", source: "", likes: 0 });
    }
  };

  // Method to handle the click event on 'Save' button on the quote card, and send an update request to the backend
  const handleUpdate = async (id, updatedQuote) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/quotes/${id}`,
        updatedQuote
      );
      if (!response.data || !response.data.quote) {
        throw new Error("'data' or 'quote' missing from quote update response");
      }

      const updatedQuoteData = response.data.quote;
      setQuotes((prevQuotes) =>
        prevQuotes.map((quote) => (quote.id === id ? updatedQuoteData : quote))
      );
      setSnackbarSeverity("success");
      setSnackbarMessage("Quote updated successfully!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error updating quote:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage("An unknown error occurred. Please try again.");
      setSnackbarOpen(true);
    } finally {
      setEditQuoteId(null); // Reset edit quote id to 'null'
      setEditQuoteData({ quote: "", quoter: "", source: "" });
    }
  };

  // Method to send a 'delete' request to the backend for the entry with the given 'id'
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/quotes/${id}`);
      console.log("Quote deleted successfully!");
      setQuotes((prevQuotes) => prevQuotes.filter((quote) => quote.id !== id));
      setSnackbarSeverity("success");
      setSnackbarMessage("Quote deleted successfully!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting quote:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage("An unknown error occurred. Please try again.");
      setSnackbarOpen(true);
    }
  };

  // Fetch all quotes from the backend when page is loaded/reloaded
  useEffect(() => {
    handelGetAllQuotes();
  }, []);

  // Modal open/close handlers
  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  // Snackbar close handler
  const handleSnackbarClose = () => setSnackbarOpen(false);

  // Handler to track new quote form values
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewQuote((prevQuote) => ({
      ...prevQuote,
      [name]: value,
    }));
  };

  // Handler to track updated quote form values
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditQuoteData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div>
      <Container style={{ marginTop: 15 }}>
        <Typography variant="h3" sx={{ textAlign: "center" }} gutterBottom>
          Kwot
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ textAlign: "center" }}
          gutterBottom
        >
          Home of the Funniest Quotes from Your Favorite Movies and TV Shows.
        </Typography>
        <Box
          sx={{
            padding: 1,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Filter by Source"
              variant="outlined"
              size="small"
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              placeholder="Movie"
              // Clear button inside the input field
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {filterSource && (
                      <IconButton
                        onClick={() => {
                          setFilterSource("");
                        }}
                        edge="end"
                      >
                        <ClearIcon />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Filter by Quoter"
              variant="outlined"
              size="small"
              value={filterQuoter}
              onChange={(e) => setFilterQuoter(e.target.value)}
              placeholder="Sherlock Homes"
              // Clear button inside the input field
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {filterQuoter && (
                      <IconButton
                        onClick={() => {
                          setFilterQuoter("");
                        }}
                        edge="end"
                      >
                        <ClearIcon />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />
            {/* Filter button */}
            <IconButton>
              <FilterAltIcon onClick={handelGetFilteredQuotes}></FilterAltIcon>
            </IconButton>
          </Box>
          <Box
            style={{
              display: "flex",
            }}
          >
            {/* Refresh button */}
            <IconButton sx={{ marginRight: 0 }} onClick={handelGetAllQuotes}>
              <RefreshIcon></RefreshIcon>
            </IconButton>
            {/* Add new quote button */}
            <IconButton>
              <AddBoxIcon
                variant="contained"
                color="primary"
                onClick={handleOpen}
              ></AddBoxIcon>
            </IconButton>
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{
            textAlign: "center",
            width: "100%",
            padding: 1,
          }}
        >
          {quotes.length === 0
            ? "No quotes found!"
            : quotes.length + " quotes found!"}
        </Typography>

        <Grid container spacing={0}>
          {quotes.map((quote) => (
            <Grid item xs={12} sm={12} md={12} key={quote.id}>
              <Card
                variant="outlined"
                style={{
                  minWidth: "275px",
                  margin: "16px",
                  backgroundColor: "#fbfbfb",
                  borderRadius: "10px",
                }}
              >
                <CardContent>
                  <Typography variant="h6" component="div">
                    "{quote.quote}"
                  </Typography>
                  <Typography
                    style={{ marginBottom: "12px", color: "textSecondary" }}
                  >
                    ~ <i>{quote.quoter}</i>
                  </Typography>

                  <Typography variant="body2" component="p">
                    <strong>Movie/TV</strong>:{" "}
                    {quote.source ? quote.source : "N/A"}
                  </Typography>
                  <Typography variant="caption" component="p">
                    <strong>ID</strong>: {quote.id}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      {/* Like button and counter */}
                      <IconButton
                        onClick={() => handleLike(quote.id, quote)}
                        sx={{ marginRight: 1 }}
                      >
                        <FavoriteIcon style={{ color: "black" }} />{" "}
                      </IconButton>
                      <Typography variant="body1">{quote.likes}</Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        gap: 1,
                      }}
                    >
                      {/* Edit button */}
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleEdit(quote)}
                      >
                        Edit
                      </Button>
                      {/* Delete button */}
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(quote.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </CardActions>

                {editQuoteId === quote.id && (
                  <Box sx={{ padding: 2 }}>
                    <Box
                      component="form"
                      noValidate
                      autoComplete="off"
                      sx={{ bgcolor: "#fff", padding: 2, borderRadius: "10px" }}
                    >
                      {/* Edit quote form */}
                      <TextField
                        label="Quote"
                        variant="outlined"
                        name="quote"
                        value={editQuoteData.quote}
                        onChange={handleEditInputChange}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        label="Quoter"
                        variant="outlined"
                        name="quoter"
                        value={editQuoteData.quoter}
                        onChange={handleEditInputChange}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        label="Movie/TV"
                        variant="outlined"
                        name="source"
                        value={editQuoteData.source}
                        onChange={handleEditInputChange}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleUpdate(quote.id, editQuoteData)}
                      >
                        Save
                      </Button>
                    </Box>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
        <Modal
          open={isModalOpen}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "50%",
              height: "50%",
              bgcolor: "background.paper",
              borderRadius: "10px",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography
              variant="h6"
              component="h2"
              sx={{ textAlign: "center" }}
              gutterBottom
            >
              New quote
            </Typography>
            <Box component="form" noValidate autoComplete="off">
              {/* New quote form */}
              <TextField
                label="Quote"
                variant="outlined"
                name="quote"
                value={newQuote.quote}
                onChange={handleChange}
                fullWidth
                multiline
                maxRows={4}
                required={true}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Quoter"
                variant="outlined"
                name="quoter"
                value={newQuote.quoter}
                onChange={handleChange}
                fullWidth
                required={true}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Movie/TV"
                variant="outlined"
                name="source"
                value={newQuote.source}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateQuotes}
                disabled={newQuote.quote === "" || newQuote.quoter === ""}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Modal>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical, horizontal }}
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
    </div>
  );
};

export default Home;
