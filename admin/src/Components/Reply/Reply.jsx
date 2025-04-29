import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReusableDataTable from '../ReusableDataTable ';
import ViewDetails from '../ViewDetails/ViewDetails';
import ReplyForm from './ReplyForm';
import "../../assets/details.css";
import './Reply.css';

const Reply = () => {
    const [replies, setReplies] = useState([]);
    const [statusMessage, setStatusMessage] = useState("");
    const [statusType, setStatusType] = useState("");
    const [selectedRow, setSelectedRow] = useState(null);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (statusMessage && statusType) {
            const timer = setTimeout(() => {
                setStatusMessage("");
                setStatusType("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [statusMessage, statusType]);

    useEffect(() => {
        fetchReplies();
    }, []);

    const fetchReplies = async () => {
        try {
            const response = await axios.get('http://localhost:5000/admin/api/reply/all-replies');
            setReplies(response.data);
        } catch (error) {
            setStatusMessage("Failed to fetch replies.");
            setStatusType("error");
            console.error('Error fetching replies:', error);
        }
    };

    const viewReply = (row) => {
        setSelectedRow(row);
    };

    const handleReply = (row) => {
        setSelectedRow(row);
        setShowReplyForm(true);
    };

    const handleClose = () => {
        setSelectedRow(null);
        setShowReplyForm(false);
    };

    const handleReplySuccess = () => {
        setStatusMessage("Reply sent successfully");
        setStatusType("success");
        fetchReplies();
    };

    const columns = [
        {
            name: "Actions",
            cell: (row) => (
                <div className="action-buttons">
                    <button
                        onClick={() => viewReply(row)}
                        className="view-btn"
                    >
                        <i className="fas fa-eye"></i>
                    </button>
                    <button
                        onClick={() => handleReply(row)}
                        className="reply-btn"
                        disabled={row.Replied !== ''}
                    >
                        <i className="fas fa-reply"></i>
                    </button>
                </div>
            ),
        },
        {
            name: "User Name",
            selector: (row) => row.UserName,
            sortable: true,
        },
        {
            name: "Email",
            selector: (row) => row.Email,
            sortable: true,
        },
        {
            name: "Subject",
            selector: (row) => row.Subject,
            sortable: true,
        },
        {
            name: "Message",
            selector: (row) => row.Message,
            cell: (row) => (
                <div className="message-cell">
                    {row.Message.length > 50
                        ? `${row.Message.substring(0, 50)}...`
                        : row.Message}
                </div>
            ),
        },
        {
            name: "Admin Reply",
            selector: (row) => row.Replied || 'Not replied yet',
            cell: (row) => (
                <div className="reply-cell">
                    {row.Replied ? (
                        <div className="replied">
                            <div className="reply-subject">
                                <strong>Subject:</strong> {row.RepliedSubject}
                            </div>
                            <div className="reply-message">
                                {row.Replied.length > 50
                                    ? `${row.Replied.substring(0, 50)}...`
                                    : row.Replied}
                            </div>
                        </div>
                    ) : (
                        <div className="not-replied">Not replied yet</div>
                    )}
                </div>
            ),
        },
        {
            name: "Created At",
            selector: (row) => new Date(row.createdAt).toLocaleDateString(),
            sortable: true,
        },
    ];

    return (
        <div className="reply-container">
            {statusMessage && (
                <div className={`status-message ${statusType === "success" ? "success" : "error"}`}>
                    {statusMessage}
                </div>
            )}

            <ViewDetails data={selectedRow} onClose={handleClose} />

            {showReplyForm && selectedRow && (
                <ReplyForm
                    userData={selectedRow}
                    onClose={handleClose}
                    onSuccess={handleReplySuccess}
                />
            )}

            <ReusableDataTable
                columns={columns}
                data={replies}
                title="Replies"
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />
        </div>
    );
};

export default Reply; 