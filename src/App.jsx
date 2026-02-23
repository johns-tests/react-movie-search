import { useEffect, useState } from 'react';
import MovieCard from './MovieCard';
import './App.css';
import SearchIcon from './search.svg';

const API_URL = import.meta.env.VITE_MOVIES_API_URL;

const defaultSearchTerm = "Movie";

const App = () => {

  const [movies, setMovies] = useState([]);          // State to hold the list of movies fetched from the API
  const [searchTerm, setSearchTerm] = useState('');  // State to hold the current search term entered by the user
  const [loading, setLoading] = useState(false);     // State to indicate whether the app is currently loading data from the API
  const [error, setError] = useState(null);          // State to hold any error messages that may occur during the fetch operation

  const searchMovies = async (title) => {

    setLoading(true);  // Set loading state to true while fetching data
    setError(null);    // Clear any previous error messages before making a new API request
    setMovies([]);     // Clear the movies state before fetching new data, to avoid displaying old results while loading new ones

    try {
      const response = await fetch(`${API_URL}&s=${title}`);  // Make a GET request to the API with the search term
      if (!response.ok) {  // Check if the response status is not OK (status code outside the range 200-299)
        throw new Error(`HTTP error! status: ${response.status}`);
                           // If the response is not OK, throw an error with the status code
      }

      const data = await response.json();  // Parse the response as JSON
      // console.log("API_DATA", data);

      // If the API response indicates success, process the movie data
      if (data.Response === "True") {

        // Defensively clean API data - deduplicate before setting state
        const uniqueMovies = Array.from(  // Create a new array of unique movies by using a Map to filter out duplicates based on the imdbID
          new Map(data.Search.map(movie => [movie.imdbID, movie])).values()
            // Map each movie to a key-value pair where the key is the imdbID and the
            // value is the movie object, then convert the Map values back to an array
        );

        setMovies(uniqueMovies);
 
      } else {
        // Handle API-level errors (OMDb returns Response: "False")
        setError(data.Error || "No movies found.");
          // Set an error message based on the API's error message
          // or a default message if no specific error is provided by the API
        setMovies([]);  // Clear the movies state if the API response indicates failure, to avoid displaying old results
      }

    } catch (error) {
    console.error("Fetch error:", err);
    // This handles:
    // - Network failure
    // - HTTPS issues
    // - Server down
    // - Thrown errors above
    setError("Something went wrong. Please try again.");
    setMovies([]);  // Clear the movies state if an error occurs during the fetch operation, to avoid displaying old results
    }

    setLoading(false);

  };

  const handleKeyDown = (e) => {                          // Function to handle key down events in the search input
    if (e.key === 'Enter') { searchMovies(searchTerm); }  // If the Enter key is pressed, call the searchMovies function with the current search term
  };

  useEffect(() => {  // When the component mounts, fetch movies with the default search term
    searchMovies(defaultSearchTerm);
  }, []);

  return (

    <div className="app">

      <h1>Superduper Movie Search</h1>

      <div className="search">

        <input
          placeholder={defaultSearchTerm}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <img
          src={SearchIcon}
          alt="search"
          onClick={() => searchMovies(searchTerm)}
        />

      </div>

      {/* The Correct Render Order:
          Show error first
          Then loading
          Then results
          Then empty state */}

      {error && (
        <div className="error">
          <h2>{error}</h2>
        </div>
      )}

      {loading && <h2>Loading...</h2>}

      {!loading && !error && movies.length > 0 && (
        <div className="container">
          {movies.map((movie) => (
            <MovieCard key={movie.imdbID} movie={movie} />  /* note that React strips key before props reach the component} */
          ))}
        </div>
      )}

      {!loading && !error && movies.length === 0 && (
        <div className="empty">
          <h2>No Movies Found!</h2>
        </div>
      )}

    </div>

  );

};

export default App;
