
import { useEffect, useState } from "react";

import "./App.css";
import MovieCard from "./MovieCard";
import SearchIcon from "./search.svg";


const API_URL = import.meta.env.VITE_MOVIES_API_URL;

const defaultSearchTerm = "Movie";

const App = () => {

  const [searchTerm, setSearchTerm] = useState('');           // State to hold the current search term entered by the user
  const [moviesReturned, setMoviesReturned] = useState([]);   // State to hold the list of movies fetched from the API
  const [error, setError] = useState(null);                   // State to hold any error messages that may occur during the fetch operation
  const [isBusyLoading, setIsBusyLoading] = useState(false);  // State used to indicate that the app is currently loading data from the API

  const searchMovies = async (term) => {

    // If the search term is empty or whitespace, use the default search term
    if (term.trim() === "")  { term = defaultSearchTerm; }

    setMoviesReturned([]);   // Clear the movies list to avoid displaying old results while loading new ones
    setError(null);          // Clear any previous error messages before making a new API request
    setIsBusyLoading(true);  // Have loading state set to true while fetching data

    try {
      // Make a GET request to the API with the search term
      const response = await fetch(`${API_URL}&s=${term}`);

      // if the response is not OK (code outside the range 200-299), throw an error with the status code
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }

      const jsonData = await response.json();  // Parse the response as JSON
      // console.log("API_DATA", jsonData);

      // If the API response indicates success, process the movie data
      if (jsonData.Response === "True") {

        // Defensively clean the API data - deduplicate before setting state
        // Create a new array of unique movies by using a Map to filter out duplicates based on the imdbID
        // Map each movie to a key-value pair, where the key is the imdbID and the value is the movie object
        // then convert the Map values back to an array

        // Start with the data:

        // jsonData.Search = [
        //   { Title: "Batman Begins", imdbID: "tt0372784" },
        //   { Title: "The Batman", imdbID: "tt1877830" },
        //   { Title: "Batman v Superman", imdbID: "tt2975590" },
        //   { Title: "Batman v Superman", imdbID: "tt2975590" } // duplicate
        // ];

        // .map(...)

        // data.Search.map(movie => [movie.imdbID, movie])

        // This transforms each movie into a pair (key-value tuple):

        // [
        //   ["tt0372784", { Title: "Batman Begins", ... }],
        //   ["tt1877830", { Title: "The Batman", ... }],
        //   ["tt2975590", { Title: "Batman v Superman", ... }],
        //   ["tt2975590", { Title: "Batman v Superman", ... }]  // duplicate key
        // ]

        // new Map(...)

        // Now we pass those pairs into a Map:

        // new Map([
        //   ["tt0372784", {...}],
        //   ["tt1877830", {...}],
        //   ["tt2975590", {...}],
        //   ["tt2975590", {...}]
        // ])

        // A Map is like an object, but:
        //   - Keys can be anything
        //   - Keys must be unique
        //   - If a key repeats, the second one overwrites the first

        // .values()

        // This returns:

        // MapIterator [
        //   {...},
        //   {...},
        //   {...}
        // ]

        // So we now have:
        //   - Only unique movies
        //   - But still in iterator form (not a normal array)

        // Array.from(map.values())

        // Final result:

        // [
        //   { Title: "Batman Begins", imdbID: "tt0372784" },
        //   { Title: "The Batman", imdbID: "tt1877830" },
        //   { Title: "Batman v Superman", imdbID: "tt2975590" }
        // ]

        const uniqueMovies = Array.from(new Map(jsonData.Search.map(movie => [movie.imdbID, movie])).values());
        setMoviesReturned(uniqueMovies);
 
      } else {
        // Handle API-level errors (OMDb returns Response: "False")
        setError(jsonData.Error || "No movies found.");
          // Set an error message based on the API's error message
          // or a default message if no specific error is provided by the API
        setMoviesReturned([]);  // Clear the movies list if the API response indicates failure, to avoid displaying old results
      }

    } catch (error) {
      console.error("Fetch error:", err);
      // This handles:
      // - Network failure
      // - HTTPS issues
      // - Server down
      // - Thrown errors above
      setError("Something went wrong. Please try again.");
      setMoviesReturned([]);  // Clear the movies list if an error occurs during the fetch operation, to avoid displaying old results
    }

    setIsBusyLoading(false);

  };

  // If the Enter key is pressed, call the searchMovies function with the current search term
  const handleKeyDown = (event) => { if (event.key === 'Enter') searchMovies(searchTerm); };


  // When the component mounts, call the searchMovies function using the default search term
  useEffect(() => { searchMovies(defaultSearchTerm); }, []);

  // Return HTML
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
          Error, Loading, Results, Empty:

          Show error first
          Then loading
          Then results
          Then empty state */}

      {/* By showing the error message first, users are immediately informed
          of any issues without being confused by a loading indicator or stale results

          If there is no error, the loading state is shown next, indicating that
          the app is fetching data

          Once loading is complete, the movie results, if available, are displayed,
          or, if no movies are found, an empty state message is shown */}

      {/* Internet Off:
            → catch block runs
            → error shown

          Search nonsense term:
            → API returns Response: "False"
            → setError("Movie not found!")
            → error shown

          Valid search:
            → movies displayed}  */}

      {error && (
        <div className="error">
          <h2>{error}</h2>
        </div>
      )}

      {isBusyLoading && <h2>Loading...</h2>}

      {/* Only show movies if there is no error and not loading

          Ensures that:
            - You never see results & loading at the same time
            - You never see error & results together */}

      {!isBusyLoading && !error && moviesReturned.length > 0 && (
        <div className="container">
          {moviesReturned.map((movie) => (
            <MovieCard key={movie.imdbID} movie={movie} />  /* note that React strips key before props reach the component */
          ))}
        </div>
      )}

      {!isBusyLoading && !error && moviesReturned.length === 0 && (
        <div className="empty">
          <h2>No Movies Found!</h2>
        </div>
      )}

    </div>

  );

};


export default App;
