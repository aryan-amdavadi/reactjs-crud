import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Navbar from "./Navbar";

export default function EditableProfilePage() {
  const userId = localStorage.getItem("user_id");
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    axios
      .post("http://localhost:8081/postowner", { user_id: userId })
      .then((res) => {
        const data = res.data;
        if (typeof data.Hobbies === "string") {
          try {
            data.Hobbies = JSON.parse(data.Hobbies);
          } catch {
            data.Hobbies = [data.Hobbies];
          }
        }
        setProfile(data);
        setPreviewImage(data.Image);
      });
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Map input name to profile field
    const keyMap = {
      first_name: "First_Name",
      last_name: "Last_Name",
      email: "Email",
      phone_number: "Phone_No",
      gender: "Gender",
      password: "password",
    };

    const field = keyMap[name] || name;

    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setProfile((prev) => ({ ...prev, Image: file }));
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    const plainObject = {
      emp_id: userId,
      first_name: profile.First_Name || "",
      last_name: profile.Last_Name || "",
      email: profile.Email || "",
      phone_number: profile.Phone_No || "",
      gender: profile.Gender || "",
      hobbies: JSON.stringify(profile.Hobbies || []),
      password: profile.password || "",
    };
    for (const [key, value] of Object.entries(plainObject)) {
      formData.append(key, value);
    }

    if (profile.Image instanceof File) {
      formData.append("image", profile.Image); // for uploaded image
    }

    try {
      await axios.post("http://localhost:8081/api/editemployee", formData);
      setEditing(false);
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  if (!profile) return <div className="loading">Loading...</div>;

  return (
    <>
      <Navbar />
      <motion.div
        className="profile-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="profile-card">
          <h2>My Profile</h2>
          <div className="image-section">
            <img
              src={
                previewImage instanceof File
                  ? URL.createObjectURL(previewImage)
                  : previewImage?.startsWith("blob:")
                  ? previewImage
                  : `http://localhost:8081/images/${previewImage}` 
              }
              alt="Profile"
              className="profile-img"
            />

            {editing && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            )}
          </div>

          <div className="form-group">
            <label>First Name</label>
            <input
              name="first_name"
              value={profile.First_Name}
              onChange={handleChange}
              disabled={!editing}
            />

            <label>Last Name</label>
            <input
              name="last_name"
              value={profile.Last_Name}
              onChange={handleChange}
              disabled={!editing}
            />

            <label>Email</label>
            <input
              name="email"
              value={profile.Email}
              onChange={handleChange}
              disabled={!editing}
            />

            <label>Phone No</label>
            <input
              name="phone_number"
              value={profile.Phone_No}
              onChange={handleChange}
              disabled={!editing}
            />

            <label>Gender</label>
            <select
              name="gender"
              value={profile.Gender}
              onChange={handleChange}
              disabled={!editing}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <label>Hobbies</label>
            <select
              id="Hobbies"
              name="hobbies"
              multiple
              className="form-select"
              style={{ width: "100%", height: "120px" }}
              value={profile.Hobbies || []}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions,
                  (opt) => opt.value
                );
                setProfile((prev) => ({ ...prev, Hobbies: selected }));
              }}
              disabled={!editing}
            >
              <option value="Swimming">Swimming</option>
              <option value="Coding">Coding</option>
              <option value="Jogging">Jogging</option>
              <option value="Gaming">Gaming</option>
              <option value="Surfing">Surfing</option>
              <option value="Running">Running</option>
            </select>

            {editing && (
              <>
                <label>Change Password</label>
                <input
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  value={profile.password}
                  onChange={handleChange}
                />
                <button
                  className="toggle-password"
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? "Hide" : "Show"}
                </button>
              </>
            )}
          </div>

          <div className="button-group">
            {editing ? (
              <>
                <button className="save-btn" onClick={handleSubmit}>
                  Save
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button className="edit-btn" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
