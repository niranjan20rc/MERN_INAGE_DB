import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await axios.get("http://localhost:5000/images");
      setImages(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch images");
    }
  };

  const handleUpload = async () => {
    if (!file || !name) return alert("Select file and enter name!");
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("name", name);
      await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      setName("");
      fetchImages();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Upload failed");
    }
  };

  const handleUpdate = async (id) => {
    if (!editName) return alert("Name required");
    try {
      await axios.put(`http://localhost:5000/images/${id}`, { name: editName });
      setEditId(null);
      setEditName("");
      fetchImages();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await axios.delete(`http://localhost:5000/images/${id}`);
      fetchImages();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  const handleDownload = (id, name) => {
    const link = document.createElement("a");
    link.href = `http://localhost:5000/images/${id}/view`;
    link.download = name || "image";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = (id) => {
    const link = `http://localhost:5000/images/${id}/view`;
    navigator.clipboard.writeText(link);
    alert("Link copied: " + link);
  };

  // ---------- Styles ----------
  const containerStyle = {
    padding: 20,
    fontFamily: "Arial, sans-serif",
    maxWidth: 900,
    margin: "0 auto",
    minHeight: "100vh",
    background: "#ffffff",
    color: "#0d47a1"
  };

  const headerStyle = {
    textAlign: "center",
    color: "#0d47a1",
    marginBottom: 30
  };

  const uploadSection = {
    display: "flex",
    gap: 10,
    marginBottom: 20,
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center"
  };

  const inputStyle = {
    padding: 8,
    fontSize: 14,
    borderRadius: 8,
    border: "1px solid #0d47a1",
    outline: "none",
    minWidth: 150
  };

  const buttonStyle = {
    padding: "8px 14px",
    cursor: "pointer",
    borderRadius: 8,
    border: "none",
    background: "#0d47a1",
    color: "#fff",
    fontWeight: "bold",
    transition: "0.3s"
  };

  const imageCard = {
    display: "flex",
    alignItems: "center",
    gap: 15,
    padding: 10,
    borderRadius: 12,
    flexWrap: "wrap",
    background: "#e3f2fd",
    boxShadow: "2px 4px 12px rgba(0,0,0,0.1)",
    marginBottom: 12
  };

  const imgStyle = {
    width: 100,
    height: 100,
    objectFit: "cover",
    borderRadius: 8,
    border: "2px solid #0d47a1"
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>🖼️ Image Dashboard</h1>

      {/* Upload Section */}
      <div style={uploadSection}>
        <input
          type="text"
          placeholder="Image Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={inputStyle}
        />
        <button
          onClick={handleUpload}
          style={buttonStyle}
          onMouseOver={(e) => e.currentTarget.style.filter = "brightness(1.2)"}
          onMouseOut={(e) => e.currentTarget.style.filter = "brightness(1)"}
        >
          Upload
        </button>
      </div>

      {/* Images List */}
      <div>
        {images.map((img) => (
          <div key={img._id} style={imageCard}>
            <img
              src={`http://localhost:5000/images/${img._id}/view`}
              alt={img.name}
              style={imgStyle}
            />

            {editId === img._id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={inputStyle}
                />
                <button onClick={() => handleUpdate(img._id)} style={buttonStyle}>Save</button>
                <button onClick={() => setEditId(null)} style={buttonStyle}>Cancel</button>
              </>
            ) : (
              <>
                <p style={{ margin: 0, minWidth: 120, fontWeight: "bold" }}>{img.name}</p>
                <button onClick={() => { setEditId(img._id); setEditName(img.name); }} style={buttonStyle}>Edit</button>
                <button onClick={() => handleDelete(img._id)} style={buttonStyle}>Delete</button>
                <button onClick={() => handleDownload(img._id, img.name)} style={buttonStyle}>Download</button>
                <button onClick={() => handleShare(img._id)} style={buttonStyle}>Share</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
