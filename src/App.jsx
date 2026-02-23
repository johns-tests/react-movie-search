import { useEffect, useState } from 'react';
import MovieCard from './MovieCard';
import './App.css';
import SearchIcon from './search.svg';

const API_URL = import.meta.env.VITE_MOVIES_API_URL;

const App = () => {

  const [movies, setMovies] = useState([]);          // State to hold the list of movies fetched from the API
  const [searchTerm, setSearchTerm] = useState('');  // State to hold the current search term entered by the user
  const [loading, setLoading] = useState(false);     // State to indicate whether the app is currently loading data from the API

  const searchMovies = async (title) => {  // Function to fetch movies based on the search term

    setLoading(true);  // Set loading state to true while fetching data

    try {
      const response = await fetch(`${API_URL}&s=${title}`);  // Make a GET request to the API with the search term
      const data = await response.json();                     // Parse the response as JSON

      // console.log("API_DATA", data);

      if (data.Response === "True") {  // If the API response indicates success, process the movie data
        // Defensively clean API data - deduplicate before setting state
        const uniqueMovies = Array.from(  // Create a new array of unique movies by using a Map to filter out duplicates based on the imdbID
          new Map(data.Search.map(movie => [movie.imdbID, movie])).values()
                                          // Map each movie to a key-value pair where the key is the imdbID and the value is the movie object,
                                          // then convert the Map values back to an array
        );
        setMovies(uniqueMovies);
      } else {
        setMovies([]);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);  // Log any errors that occur during the fetch operation
      setMovies([]);                                   // If an error occurs, set movies to an empty array
    }

    setLoading(false);

  };

  const handleKeyDown = (e) => {                          // Function to handle key down events in the search input
    if (e.key === 'Enter') { searchMovies(searchTerm); }  // If the Enter key is pressed, call the searchMovies function with the current search term
  };

  useEffect(() => {  // When the component mounts, fetch movies with the default search term "Batman"
    searchMovies('Batman');  
  }, []);

  return (

    <div className="app">

      <h1>John's Movie Search</h1>

      <div className="search">

        <input
          placeholder="Search for movies"
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

      {loading ? (  // If the app is currently loading data, display a loading message
        <h2>Loading...</h2>
      ) : movies?.length > 0 ? (  // If there are movies in the state, display them using the MovieCard component

        <div className="container">
          {movies.map((movie) => (  // Map over the movies array and render a MovieCard for each movie
            <MovieCard key={movie.imdbID} movie={movie} />
                                    // Pass the movie object as a prop to the MovieCard component
                                    // and use the imdbID as a unique key - note that React strips key
                                    // before props reach the component
          ))}
        </div>
      ) : (
        <div className="empty">
          <h2>No Movies Found!</h2>
        </div>
      )}

    </div>
  );
};

export default App;
