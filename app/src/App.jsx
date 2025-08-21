import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const API_URL = "http://localhost:5000";

  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false); // 👈 loading state

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true); // 👈 show spinner
      const res = await axios.get(`${API_URL}/images`);
      setImages(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch images");
    } finally {
      setLoading(false); // 👈 hide spinner
    }
  };

  const handleUpload = async () => {
    if (!file || !name) return alert("Select file and enter name!");
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("name", name);

      await axios.post(`${API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFile(null);
      setName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchImages();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Upload failed");
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editName) return alert("Name required");
    try {
      setLoading(true);
      await axios.put(`${API_URL}/images/${id}`, { name: editName });
      setEditId(null);
      setEditName("");
      fetchImages();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Update failed");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/images/${id}`);
      fetchImages();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Delete failed");
      setLoading(false);
    }
  };

  const handleDownload = async (id, name) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/images/${id}/view`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = name || "image";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Download failed");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (id) => {
    const link = `${API_URL}/images/${id}/view`;
    navigator.clipboard.writeText(link);
    alert("Link copied: " + link);
  };

  return (
    <div className="container">
      <h1 className="header"> Image Dashboard</h1>

      {/* Upload Section */}
      <div className="upload-section">
        <input
          type="text"
          placeholder="Image Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files[0])}
          className="input"
        />
        <button className="button" onClick={handleUpload}>
          Upload
        </button>
      </div>

      {/* Spinner */}
      {loading && <div className="spinner"></div>}

      {/* Images List */}
      <div>
        {images.map((img) => (
          <div key={img._id} className="image-card">
            <img
              src={`${API_URL}/images/${img._id}/view`}
              alt={img.name}
              className="thumbnail"
            />

            {editId === img._id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input"
                />
                <button className="button" onClick={() => handleUpdate(img._id)}>
                  Save
                </button>
                <button className="button" onClick={() => setEditId(null)}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <p className="image-name">{img.name}</p>
                <button
                  className="button"
                  onClick={() => {
                    setEditId(img._id);
                    setEditName(img.name);
                  }}
                >
                  Edit
                </button>
                <button
                  className="button danger"
                  onClick={() => handleDelete(img._id)}
                >
                  Delete
                </button>
                <button
                  className="button"
                  onClick={() => handleDownload(img._id, img.name)}
                >
                  Download
                </button>
                <button className="button" onClick={() => handleShare(img._id)}>
                  Share
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
