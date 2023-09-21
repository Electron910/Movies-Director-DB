const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let db = null;

const dbAndServerInitializer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server running at https://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB err: ${e.message}`);
    process.exit(1);
  }
};

dbAndServerInitializer();

const jsonToObj = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesList = `
    SELECT 
    movie_name
    FROM 
    movie;
    `;
  const moviesArr = await db.all(getMoviesList);
  response.send(
    moviesArr.map((item) => {
      return {
        movieName: item.movie_name,
      };
    })
  );
});

//Adding a movie
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.params;
  const addMovieQuery = `
    INSERT INTO movie (director_id, movie_name, lead_actor)
    VALUES
    ('${directorId}','${movieName}','${leadActor}');
    `;
  const added = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//Get the movie based on id
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieOnId = `
    SELECT 
    *
    FROM 
    movie
    WHERE 
    movie_id = ${movieId};
    `;
  const gettingMovie = await db.get(getMovieOnId);
  response.send(jsonToObj(gettingMovie));
});

//Update the existing ones
app.put("/movies/:movieId", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieDet = `
    UPDATE
    movie
    SET 
    director_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE 
    movie_id = '${movieId}';
    `;
  const updatedMov = await db.run(updateMovieDet);
  response.send("Movie Details Updated");
});

//Delete the movie details
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteAMovie = `
    DELETE FROM 
    movie
    WHERE
    movie_id = '${movieId}';
    `;
  const deletedMovie = await db.run(deleteAMovie);
  response.send("Movie Removed");
});

//Get list of directors
app.get("/directors/", async (request, response) => {
  const getDirectorsList = `
    SELECT 
    *
    FROM 
    director;
    `;
  const directorsArr = await db.all(getDirectorsList);
  response.send(
    directorsArr.map((item) => {
      return {
        directorId: item.director_id,
        directorName: item.director_name,
      };
    })
  );
});

//Getting unique director details

module.exports = app;
