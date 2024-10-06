import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import Navbar from '../components/Navbar';
interface Book {
  book_id: number;
  title: string;
  author: string;
  cover_image_url: string;
  isbn?: string;
  genre?: string;
  total_copies?: number;
  available_copies?: number;
}

const PatronDashboard: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null); // State to hold selected book for details
  const [open, setOpen] = useState(false); // State to manage dialog open/close
  const [borrowedBooks, setBorrowedBooks] = useState<number[]>([]); // State to track borrowed books by their IDs
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/books/');
        console.log('Response:', response.data);

        if (Array.isArray(response.data)) {
          setBooks(response.data);
        } else if (Array.isArray(response.data.books)) {
          setBooks(response.data.books);
        } else {
          console.error('Unexpected response structure:', response.data);
        }
      
       // Log each book's ID
       response.data.forEach((book: Book) => {
        console.log(`Book ID: ${book.book_id}, Title: ${book.title}`);
    });
}
      catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, []);

  const handleDetailsClick = (book: Book) => {
    setSelectedBook(book); // Set the selected book for details
    setOpen(true); // Open the dialog
  };


  const handleBorrowClick = async (bookId: number) => {
    const book = books.find((b) => b.book_id === bookId);    
    if (!book) {
      console.error("Book not found!");
      return; // If the book is not found, we return early
    }
    if ((book.available_copies ?? 0) > 0) {

    try {
      // Send POST request to borrow the book
      const response = await axios.post('http://localhost:5000/api/loans/borrow', {  book_id: bookId, // Replace with the actual book ID you want to borrow
        user_id: 2,// Replace with the actual user ID
        borrow_date: new Date().toISOString(), // Current date
        due_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString()  });
      console.log("Attempting to borrow book with ID:", bookId);

      if (response.status === 201) {
        // Update the borrowed books list
        setBorrowedBooks((prev) => [...prev, bookId]);

        // Update the available copies of the book
        setBooks((prevBooks) =>
          prevBooks.map((book) =>
            book.book_id === bookId
              ? { ...book, available_copies: (book.available_copies || 1) - 1 }
              : book
          )
        );

        // Show success message
        setSnackbar({ open: true, message: 'Book borrowed successfully!', severity: 'success' });
      } else {
        console.error('Failed to borrow the book:', response);
        setSnackbar({ open: true, message: 'Failed to borrow the book.', severity: 'error' });
      }
    } catch (error) {
      console.error('Error during borrowing:', error);
      // const errorMessage = error.response?.data?.message || 'An error occurred while borrowing the book.';
      // setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  }
  else {
    // If no copies are left, show an error
    setSnackbar({ open: true, message: 'No copies available.', severity: 'error' });
  }
};

  const handleClose = () => {
    setOpen(false); // Close the dialog
    setSelectedBook(null); // Clear the selected book
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
    <Navbar/>
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Patron Dashboard
      </Typography>
      <Box mt={5}>
        <Typography variant="h6">Available Books</Typography>
        <Grid container spacing={3}>
          {books.map((book) => (
            <Grid item xs={12} sm={6} md={4} key={book.book_id}>
              <Card>
                <CardContent>
                  <Typography variant="h5">{book.title}</Typography>
                  <Typography variant="subtitle1">by {book.author}</Typography>
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    Available Copies: {book.available_copies}
                  </Typography>
                  <Box mt={2} sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={
                        borrowedBooks.includes(book.book_id) ||
                        (book.available_copies ?? 0) < 1
                      }
                      onClick={() => handleBorrowClick(book.book_id)}
                    >
                      {borrowedBooks.includes(book.book_id) ? 'Already Borrowed' : 'Borrow'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={() => handleDetailsClick(book)}
                    >
                      Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Dialog for displaying book details */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{selectedBook?.title}</DialogTitle>
        <DialogContent>
          {selectedBook && (
            <Box>
              <Typography variant="h6">Author: {selectedBook.author}</Typography>
              <Typography variant="body1">ISBN: {selectedBook.isbn || 'N/A'}</Typography>
              <Typography variant="body1">Genre: {selectedBook.genre || 'N/A'}</Typography>
              <Typography variant="body1">Total Copies: {selectedBook.total_copies || 'N/A'}</Typography>
              <Typography variant="body1">Available Copies: {selectedBook.available_copies || 'N/A'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
    </>
  );
};

export default PatronDashboard;
