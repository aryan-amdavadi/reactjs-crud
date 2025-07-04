import React, { useEffect, useState } from "react";

import axios from "axios";

function Comments(props) {
  const [data, setData] = useState([]);
  const [commentClose, setCommentClose] = useState(true);
  const [commentValue, setCommentValue] = useState("");
  const [editCommentId, setEditCommentId] = useState(null); // id of the comment being edited
  const [editCommentText, setEditCommentText] = useState(""); // text being edited
  const [empData, setEmpData] = useState();

  useEffect(() => {
    axios
      .get("http://localhost:8081/comments")
      .then((res) => {
        const filteredComments = res.data.filter(
          (comment) => comment.post_id === props.postID
        );
        setData(filteredComments);
      })
      .catch((err) => console.log(err));
  }, [props.postID]);

  useEffect(() => {
    axios
      .get("http://localhost:8081/users")
      .then((res) => {
        setEmpData(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleComment = () => {
    const dataObject = {
      comment: commentValue,
      post_id: props.postID,
      user_id: localStorage.getItem("user_id"),
    };
    axios
      .post("http://localhost:8081/api/addcomment", dataObject)
      .then(() => {
        setCommentValue("");
        fetchComments();
      })
      .catch((error) => console.log(error));
  };

  const fetchComments = () => {
    axios.get("http://localhost:8081/comments").then((res) => {
      const filteredComments = res.data.filter(
        (comment) => comment.post_id === props.postID
      );
      setData(filteredComments);
    });
  };

  const handleEditButtonClick = (comment) => {
    setEditCommentId(comment.comment_id);
    setEditCommentText(comment.comment);
  };

  const handleEditCommentTextChange = (e) => {
    setEditCommentText(e.target.value);
  };

  const handleSaveEdit = (commentId) => {
    const dataObject = {
      comment_id: commentId,
      comment: editCommentText,
    };
    axios
      .post("http://localhost:8081/api/editcomment", dataObject)
      .then((responce) => {
        console.log("Responce :", responce.data);
        setEditCommentId(null);
        setEditCommentText("");
        fetchComments();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleDelete = (comment_id) => {
    const DataObject = {
      comment_id: comment_id,
    };
    axios
      .delete("http://localhost:8081/api/deletecomment", {
        data: DataObject,
      })
      .then((responce) => {
        console.log("Responce :", responce.data);
        fetchComments();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <div className="comment-section" style={{width:"717px", background:"transparent"}}>
      <div className="card details-card" style={{width:"669PX"}}>
        <div className="tags-box d-flex">
          <input
            type="text"
            placeholder="Comment...."
            value={commentValue}
            onChange={(e) => {
              setCommentValue(e.target.value);
              setCommentClose(e.target.value === "");
            }}
          />
          <button
            className="btn btn-primary mx-3"
            disabled={commentClose}
            onClick={handleComment}
          >
            Add
          </button>
        </div>
        <div className="history">
          <h2>Comments:</h2>
          {data.map((comment) => {
            const isEditing = editCommentId === comment.comment_id;
            const user =
              empData &&
              empData.find((user) => user.Emp_Id === comment.user_id);
            const isCommentAdmin = user && user.role === "admin";
            return (
              <div
                key={comment.comment_id}
                className="d-flex"
                style={{ justifyContent: "space-between" }}
              >
                <div className="note" style={{backgroundColor:"#3f503c"}}>
                  <span>{comment.date}</span>
                  <p>
                    <p style={{backgroundColor:isCommentAdmin?"#f0f9f4":"",borderLeft:isCommentAdmin?"4px solid #2e5939":""}}>
                      {isCommentAdmin ? "Admin " : ""}
                    </p>
                    <strong>{user ? user.First_Name : "Unknown "}</strong>
                    {" : "}
                    {isEditing ? (
                      <input
                        type="text"
                        value={editCommentText}
                        onChange={handleEditCommentTextChange}
                        style={{ border: "1px solid #ccc" }}
                      />
                    ) : (
                      comment.comment
                    )}
                  </p>
                </div>
                <div
                  id="actions"
                  style={{
                    display:
                      Number(localStorage.getItem("user_id")) ===
                        Number(comment.user_id) ||
                      localStorage.getItem("role") === "admin"
                        ? "block"
                        : "none",
                  }}
                >
                  {isEditing ? (
                    <button
                      className="btn btn-sm mx-1"
                      onClick={() => handleSaveEdit(comment.comment_id)}
                    >
                      <i className="fa-solid fa-check"></i>
                    </button>
                  ) : (
                    <button
                      className="edit mx-1 btn btn-link"
                      onClick={() => handleEditButtonClick(comment)}
                    >
                      <i className="material-icons" title="Edit">
                        &#xE254;
                      </i>
                    </button>
                  )}
                  <button
                    className="delete mx-1 btn btn-link"
                    onClick={() => {
                      handleDelete(comment.comment_id);
                    }}
                  >
                    <i className="material-icons" title="Delete">
                      &#xE872;
                    </i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Comments;
