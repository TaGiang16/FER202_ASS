import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Badge,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import { fetchData, postData, updateData, deleteData } from "../API/ApiService";

function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [movieType, setMovieType] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [editMovie, setEditMovie] = useState(null);
  const [cinemas, setCinemas] = useState([]);
  const [newMovie, setNewMovie] = useState({
    title: "",
    genre_ids: [],
    description: "",
    director: "",
    actor: "",
    duration: "",
    language_id: "",
    movie_type: "",
    release_date: "",
    video_url: "",
    banner: "",
    poster: "",
    status: "active",
  });

  useEffect(() => {
    fetchData("movies")
      .then((data) => setMovies(data))
      .catch((error) => console.error("Error fetching movies:", error));

    fetchData("cinema")
      .then((data) => setCinemas(data))
      .catch((error) => console.error("Error fetching cinemas:", error));

    fetchData("genres")
      .then((data) => setGenres(data))
      .catch((error) => console.error("Error fetching genres:", error));

    fetchData("languages")
      .then((data) => setLanguages(data))
      .catch((error) => console.error("Error fetching languages:", error));

    fetchData("movietypes")
      .then((data) => setMovieType(data))
      .catch((error) => console.error("Error fetching movie types:", error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMovie({ ...newMovie, [name]: value });
  };

  const handleGenreChange = (e) => {
    setNewMovie({
      ...newMovie,
      genre_ids: Array.from(e.target.selectedOptions, (option) => option.value),
    });
  };

  const handleSubmit = () => {
    const movieToSubmit = {
      ...newMovie,
      genre_ids: Array.isArray(newMovie.genre_ids)
        ? newMovie.genre_ids
        : newMovie.genre_ids.split(",").map(Number),
      poster: Array.isArray(newMovie.poster)
        ? newMovie.poster
        : newMovie.poster.split(","),
    };

    if (editMovie) {
      updateData("movies", editMovie.id, movieToSubmit)
        .then(() => {
          setMovies((prevMovies) =>
            prevMovies.map((movie) =>
              movie.id === editMovie.id
                ? { ...movieToSubmit, id: editMovie.id }
                : movie
            )
          );
          resetForm();
        })
        .catch((error) => console.error("Error updating movie:", error));
    } else {
      postData("movies", { ...movieToSubmit, id: movies.length + 1 })
        .then((data) => {
          setMovies([...movies, data]);
          resetForm();
        })
        .catch((error) => console.error("Error adding movie:", error));
    }
  };

  const handleDelete = (id) => {
    deleteData("movies", id)
      .then(() =>
        setMovies((prevMovies) => prevMovies.filter((movie) => movie.id !== id))
      )
      .catch((error) => console.error("Error deleting movie:", error));
  };

  const handleEdit = (movie) => {
    setEditMovie(movie);
    setNewMovie({
      ...movie,
      genre_ids: Array.isArray(movie.genre_ids)
        ? movie.genre_ids
        : movie.genre_ids.split(","),
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditMovie(null);
    setNewMovie({
      title: "",
      genre_ids: [],
      description: "",
      director: "",
      actor: "",
      duration: "",
      language_id: "",
      movie_type: "",
      release_date: "",
      video_url: "",
      banner: "",
      poster: "",
      status: "active",
    });
    setShowModal(true);
  };

  const handleTitleClick = (movie) => {
    setSelectedMovie(movie);
    setShowDetailModal(true);
  };

  const resetForm = () => {
    setEditMovie(null);
    setNewMovie({
      title: "",
      director: "",
      actor: "",
      description: "",
      genre_ids: [],
      duration: "",
      language_id: "",
      poster: "",
      movie_type: "",
      release_date: "",
      video_url: "",
      banner: "",
      status: "active",
    });
    setShowModal(false);
  };

  const getGenreNames = (genreIds) =>
    genreIds && Array.isArray(genreIds)
      ? genreIds
          .map((id) => genres.find((genre) => genre.id == id)?.name)
          .join(", ")
      : "N/A";

  const getLanguageName = (languageId) =>
    languages.find((language) => language.id == languageId)?.name;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4" style={{ color: "#3a3a3a" }}>
        Quản Lý Phim
      </h1>
      <Row className="mb-3">
        <Col md={12} className="text-end">
          <Button variant="primary" onClick={handleCreate}>
            <FaPlus /> Thêm Phim Mới
          </Button>
        </Col>
      </Row>
      <Table striped bordered hover responsive className="text-center">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Poster</th>
            <th>Tiêu Đề</th>
            <th>Thể Loại</th>
            <th>Ngôn Ngữ</th>
            <th>Thời Lượng</th>
            <th>Trạng Thái</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr key={movie.id}>
              <td>{movie.id}</td>
              <td>
                <img
                  src={movie.poster}
                  alt={movie.title}
                  style={{ width: "100px", height: "auto" }}
                />
              </td>
              <td
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => handleTitleClick(movie)}
              >
                {movie.title}
              </td>
              <td>
                <Badge bg="info">{getGenreNames(movie.genre_ids)}</Badge>
              </td>
              <td>{getLanguageName(movie.language_id)}</td>
              <td>{movie.duration} phút</td>
              <td>
                <Badge bg={movie.status === "active" ? "success" : "secondary"}>
                  {movie.status === "active" ? "Đang Chiếu" : "Ngừng Chiếu"}
                </Badge>
              </td>
              <td>
                <Button
                  variant="warning"
                  className="me-2"
                  onClick={() => handleEdit(movie)}
                  style={{ backgroundColor: "#ffc107", border: "none" }}
                >
                  <FaEdit /> Sửa
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(movie.id)}
                  style={{ backgroundColor: "#dc3545", border: "none" }}
                >
                  <FaTrashAlt /> Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for Add/Edit Movie */}
      <Modal show={showModal} onHide={resetForm}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editMovie ? "Chỉnh Sửa Phim" : "Thêm Phim Mới"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tiêu Đề</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={newMovie.title}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Đạo Diễn</Form.Label>
              <Form.Control
                type="text"
                name="director"
                value={newMovie.director}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Diễn Viên</Form.Label>
              <Form.Control
                type="text"
                name="actor"
                value={newMovie.actor}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô Tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={newMovie.description}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Thời lương</Form.Label>
              <Form.Control
                type="number"
                name="duration"
                value={newMovie.duration}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Thể Loại</Form.Label>
              <Form.Control
                as="select"
                multiple
                name="genre_ids"
                value={newMovie.genre_ids}
                onChange={handleGenreChange}
              >
                {genres && genres.length > 0 ? (
                  genres.map((genre) => (
                    <option key={genre.id} value={genre.id}>
                      {genre.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading genres...</option>
                )}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ngôn Ngữ</Form.Label>
              <Form.Control
                as="select"
                name="language_id"
                value={newMovie.language_id}
                onChange={handleInputChange}
              >
                {languages && languages.length > 0 ? (
                  languages.map((language) => (
                    <option key={language.id} value={language.id}>
                      {language.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading languages...</option>
                )}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Poster URL</Form.Label>
              <Form.Control
                type="text"
                name="poster"
                value={newMovie.poster}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Loại Phim</Form.Label>
              <Form.Control
                as="select"
                name="movie_type"
                value={newMovie.movie_type}
                onChange={handleInputChange}
              >
                {movieType && movieType.length > 0 ? (
                  movieType.map((movie_type) => (
                    <option key={movie_type.id} value={movie_type.id}>
                      {movie_type.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading Movie Type...</option>
                )}
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ngày Phát Hành</Form.Label>
              <Form.Control
                type="date"
                name="release_date"
                value={newMovie.release_date}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Video URL</Form.Label>
              <Form.Control
                type="text"
                name="video_url"
                value={newMovie.video_url}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Banner</Form.Label>
              <Form.Control
                type="text"
                name="banner"
                value={newMovie.banner}
                onChange={handleInputChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Trạng Thái</Form.Label>
              <Form.Control
                as="select"
                name="status"
                value={newMovie.status}
                onChange={handleInputChange}
              >
                <option value="active">Đang Chiếu</option>
                <option value="inactive">Ngưng Chiếu</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={resetForm}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editMovie ? "Cập Nhật" : "Thêm Phim"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Movie Detail */}
      <Modal
        size="lg"
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedMovie && selectedMovie.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMovie && (
            <>
              <h5>Trạng Thái:</h5>
              <p>
                <Badge bg={selectedMovie.status === "active" ? "success" : "secondary"}>
                  {selectedMovie.status === "active" ? "Đang Chiếu" : "Ngừng Chiếu"}
                </Badge>
              </p>
              
              <h5>Đạo Diễn:</h5>
              <p>{selectedMovie.director}</p>

              <h5>Diễn Viên:</h5>
              <p>{selectedMovie.actor}</p>

              <h5>Mô Tả:</h5>
              <p>{selectedMovie.description}</p>

              <h5>Thể Loại:</h5>
              <p>{getGenreNames(selectedMovie.genre_ids)}</p>

              <h5>Ngôn Ngữ:</h5>
              <p>{getLanguageName(selectedMovie.language_id)}</p>
              
              <h5>Loại Phim:</h5>
              <p>{movieType.find(mt => mt.id == selectedMovie.movie_type)?.name || "N/A"}</p>
              
              <h5>Thời Lượng:</h5>
              <p>{selectedMovie.duration} phút</p>

              <h5>Ngày Phát Hành:</h5>
              <p>{formatDate(selectedMovie.release_date)}</p>

              <h5>Video Trailer:</h5>
              <iframe
                width="100%"
                height="315"
                src={selectedMovie.video_url}
                title="YouTube video"
                allowFullScreen
              ></iframe>

              <h5 className="mt-3">Banner:</h5>
              <img
                src={selectedMovie.banner}
                alt="Banner"
                className="img-fluid mb-3"
              />

              <h5>Poster:</h5>
              <div className="text-center">
                <img
                  src={selectedMovie.poster}
                  alt="Poster"
                  className="img-fluid"
                />
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AdminMovies;
