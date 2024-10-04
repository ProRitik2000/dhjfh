import { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Container, Card, CardContent, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

interface Book {
  id: number;
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
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, []);

  const handleDetailsClick = (book: Book) => {
    setSelectedBook(book); // Set the selected book for details
    setOpen(true); // Open the dialog
  };

  const handleClose = () => {
    setOpen(false); // Close the dialog
    setSelectedBook(null); // Clear the selected book
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Patron Dashboard
      </Typography>
      <Box mt={5}>
        <Typography variant="h6">Available Books</Typography>
        <Grid container spacing={3}>
          {books.map((book) => (
            <Grid item xs={12} sm={6} md={4} key={book.id}>
              <Card>
                <CardContent>
                  <Typography variant="h5">{book.title}</Typography>
                  <Typography variant="subtitle1">by {book.author}</Typography>
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                  <Box mt={2} sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button variant="outlined" color="primary">Borrow</Button>
                    <Button variant="outlined" color="warning" onClick={() => handleDetailsClick(book)}>
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
              <Typography variant="body1">ISBN: {selectedBook.isbn}</Typography>
              <Typography variant="body1">Genre: {selectedBook.genre}</Typography>
              <Typography variant="body1">Total Copies: {selectedBook.total_copies}</Typography>
              <Typography variant="body1">Available Copies: {selectedBook.available_copies}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PatronDashboard;
