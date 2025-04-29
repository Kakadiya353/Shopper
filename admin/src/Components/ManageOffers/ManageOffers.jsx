import DataTable from "react-data-table-component";
import { useEffect, useState, useCallback } from 'react';
import "../../assets/mainCSS.css";
import "../../assets/details.css";
import './ManageOffers.css';
import axios from 'axios';
import ViewDetails from "../ViewDetails/ViewDetails";
import ReusableDataTable from "../ReusableDataTable ";

const ManageOffers = () => {
    const initialOfferState = {
        Title: "",
        Discount: "",
        MinDiscount: "",
        MaxDiscount: "",
        Status: "",
        Offer_Discription: "",
        ImageURI: "",
    };
    const [statusMessage, setStatusMessage] = useState("");
    const [statusType, setStatusType] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [offers, setOffers] = useState([]);
    const [editingOfferId, setEditingOfferId] = useState(null);
    const [offerDetails, setOfferDetails] = useState(initialOfferState);
    const [selectedRow, setSelectedRow] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")

    const fetchOffer = useCallback(() => {
        axios.get("http://localhost:5000/admin/api/offer/all-offer")
            .then((response) => {
                setOffers(response.data.offer || [])
            })
            .catch((error) => {
                setStatusMessage("Failed to fetch offers.");
                setStatusType("error");
                console.log(error)
            })
    }, [])

    useEffect(() => {
        if (statusMessage && statusType) {
            const timer = setTimeout(() => {
                setStatusMessage("")
                setStatusType("")
            }, 3000);
            return () => clearTimeout(timer)
        }

    }, [statusMessage, statusType])

    useEffect(() => {
        fetchOffer()
    }, [fetchOffer])

    const validateForm = () => {
        let newErrors = {};

        // Basic validation for all fields
        if (!offerDetails.Title || !offerDetails.Discount || !offerDetails.MinDiscount || !offerDetails.MaxDiscount || !offerDetails.Status) {
            newErrors = {
                title: !offerDetails.Title ? "Title is Required" : "",
                discount: !offerDetails.Discount ? "Discount is required" : "",
                mindiscount: !offerDetails.MinDiscount ? "Min Discount is required" : "",
                maxdiscount: !offerDetails.MaxDiscount ? "Max Discount is required" : "",
                status: !offerDetails.Status ? "Status is required" : "",
                offer_discription: !offerDetails.Offer_Discription ? "Offer description is required" : "",
            };

            // Only require image for new offers, not for updates
            if (!editingOfferId && !offerDetails.ImageURI) {
                newErrors.image = "Please upload an image.";
            }

            setErrors(newErrors);
            return false;
        }
        return true;
    };

    const changeHandler = (e) => {
        const { name, type, value, files } = e.target;
        if (type === "file") {
            const file = files[0];
            if (file && file.size <= 2000000) {
                console.log("File selected:", file.name, "Size:", file.size);
                setOfferDetails((prev) => ({
                    ...prev,
                    ImageURI: file,
                }));
                setImagePreview(URL.createObjectURL(file));
            } else {
                console.log("File rejected:", file ? `Size: ${file.size}` : "No file selected");
                setOfferDetails((prev) => ({ ...prev, ImageURI: "" }));
                setImagePreview(null);
                setStatusMessage("Image upload error: file size should not exceed 2MB.")
                setStatusType("error")
            }
        } else {
            console.log(`Updating ${name} to:`, value);
            setOfferDetails({ ...offerDetails, [name]: value });
        }
    };

    useEffect(() => {
        console.log("Status message updated:", statusMessage)

    }, [statusMessage]);

    const handleOfferSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const setFormDataToSend = new FormData();
        setFormDataToSend.append("Title", offerDetails.Title);
        setFormDataToSend.append("Discount", offerDetails.Discount);
        setFormDataToSend.append("MinDiscount", offerDetails.MinDiscount);
        setFormDataToSend.append("MaxDiscount", offerDetails.MaxDiscount);
        setFormDataToSend.append("Status", offerDetails.Status);
        setFormDataToSend.append("Offer_Discription", offerDetails.Offer_Discription);

        // Handle image upload for both new and existing offers
        if (offerDetails.ImageURI) {
            if (offerDetails.ImageURI instanceof File) {
                // For new image uploads
                setFormDataToSend.append("ImageURI", offerDetails.ImageURI);
                console.log("Appending new image file:", offerDetails.ImageURI.name);
            } else if (typeof offerDetails.ImageURI === 'string' && offerDetails.ImageURI !== "") {
                // For existing images, we need to explicitly tell the backend to keep the existing image
                // by setting a flag in the form data
                setFormDataToSend.append("keepExistingImage", "true");
                console.log("Using existing image:", offerDetails.ImageURI);
            }
        }

        try {
            if (editingOfferId) {
                console.log("Updating offer with ID:", editingOfferId);

                // Log form data contents for debugging
                const formDataObj = {};
                for (const [key, value] of setFormDataToSend.entries()) {
                    if (key === "ImageURI" && value instanceof File) {
                        formDataObj[key] = `File: ${value.name}, Size: ${value.size}, Type: ${value.type}`;
                    } else {
                        formDataObj[key] = value;
                    }
                }
                console.log("Form data being sent:", formDataObj);

                const response = await axios.put(
                    `http://localhost:5000/admin/api/offer/update-offer/${editingOfferId}`,
                    setFormDataToSend,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                console.log("Update response:", response.data);

                // Update the offers list with the updated offer
                if (response.data.offer) {
                    setOffers(prevOffers =>
                        prevOffers.map(offer =>
                            offer._id === editingOfferId ? response.data.offer : offer
                        )
                    );
                } else {
                    // If the response doesn't include the updated offer, fetch all offers
                    fetchOffer();
                }

                setStatusMessage(response.data.message || "The information has been updated");
                setStatusType(response.data.status || "success");
            } else {
                console.log("Adding new offer");
                const response = await axios.post(
                    'http://localhost:5000/admin/api/offer/add-offer',
                    setFormDataToSend,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                // Add the new offer to the offers list
                if (response.data.offer) {
                    setOffers(prevOffers => [...prevOffers, response.data.offer]);
                } else {
                    // If the response doesn't include the new offer, fetch all offers
                    fetchOffer();
                }

                setStatusMessage(response.data.message || "The information has been registered");
                setStatusType(response.data.status || "success");
            }

            setOfferDetails(initialOfferState);
            setEditingOfferId(null);
            setErrors({});
            setImagePreview(null);
            setSearchTerm("");
        } catch (e) {
            console.error("Error submitting offer:", e);
            console.error("Error details:", e.response?.data || "No response data");

            let errorMessage = "An error occurred while updating the offer.";
            if (e.response?.data?.message) {
                errorMessage = e.response.data.message;
            } else if (e.response?.data?.error) {
                errorMessage = e.response.data.error;
            } else if (e.message) {
                errorMessage = e.message;
            }

            setStatusMessage(errorMessage);
            setStatusType("error");
        }
    };

    const viewOffer = (row) => {
        setSelectedRow(row)
    }

    const handleClose = (e) => {
        setSelectedRow(null)
    }

    const columns = [
        {
            name: "Actions",
            cell: (row) => (
                <div className="action-buttons">
                    <button className="edit-btn" onClick={() => handleEdit(row._id, row)}>
                        <i className="fas fa-edit"></i> {/* Edit icon */}
                    </button>
                    <button className="delete-btn" onClick={() => deleteOffer(row._id)}>
                        <i className="fas fa-trash-alt"></i> {/* Delete icon */}
                    </button>
                    <button className="view-btn" onClick={() => viewOffer(row)}>
                        <i className="fas fa-eye"></i>
                    </button>
                    <button
                        className={`active-btn ${row.Status === 'active' ? 'active' : 'inactive'}`}
                        onClick={() => toggleActive(row._id)}
                    >
                        <i className="fas fa-check-circle"></i>
                        {row.Status === 'active' ? 'Active' : 'Inactive'}
                    </button>

                </div>
            ),
        },
        {
            name: "Image",
            selector: (row) => (
                <div className="offer-image-container">
                    {row.ImageURI ? (
                        <img
                            src={`http://localhost:5000/public${row.ImageURI}`}
                            alt={row.Title}
                            className="smaller-image"
                            onError={(e) => {
                                console.log(`Image load error for: ${row.ImageURI}`);
                                e.target.style.display = 'none';
                                e.target.parentNode.innerHTML = '<div class="image-placeholder">No Image</div>';
                            }}
                        />
                    ) : (
                        <div className="image-placeholder">No Image</div>
                    )}
                </div>
            ),
        },
        {
            name: "Title",
            selector: (row) => row.Title,
            sortable: true,
        },
        {
            name: "Discount",
            selector: (row) => row.Discount,
            sortable: true,
        },
        {
            name: "Min Discount",
            selector: (row) => row.MinDiscount,
            sortable: true,
        },
        {
            name: "Max Discount",
            selector: (row) => row.MaxDiscount,
            sortable: true,
        },
        {
            name: "Status",
            selector: (row) => row.Status,
            sortable: true,
        },
        {
            name: "Description",
            selector: (row) => row.Offer_Discription,
            sortable: true,
        },

    ];

    const handleEdit = (id, row) => {
        console.log("Editing offer with ID:", id);
        console.log("Offer data:", row);

        const offerToEdit = offers.find((offer) => offer._id === id);
        if (!offerToEdit) {
            console.error("Offer not found with ID:", id);
            setStatusMessage("Error: Offer not found");
            setStatusType("error");
            return;
        }

        console.log("Found offer to edit:", offerToEdit);

        setEditingOfferId(id);
        setOfferDetails(offerToEdit);

        if (row.ImageURI && row.ImageURI !== "") {
            setImagePreview(`http://localhost:5000/public${row.ImageURI}`);
            console.log("Setting image preview:", `http://localhost:5000/public${row.ImageURI}`);
        } else {
            setImagePreview(null);
            console.log("No image to preview");
        }

        // Don't fetch offers here as it might reset the form
        // fetchOffer();
    };

    const deleteOffer = (id) => {
        if (window.confirm('Are you sure you want to delete this offer?')) {
            axios.delete(`http://localhost:5000/admin/api/offer/delete-offer/${id}`)
                .then(() => {
                    setOffers(offers.filter((offer) => offer._id !== id))
                })
                .catch((error) => {
                    setStatusMessage("Error deleting offer.");
                    setStatusType("error");
                    console.log(error)
                })
        }
    };

    //toggling
    const toggleActive = async (id) => {
        const offerToToggle = offers.find((p) => p._id === id)
        if (!offerToToggle) return;

        const newStatus = offerToToggle.Status === "active" ? "inactive" : "active";

        try {
            const response = await axios.put(`http://localhost:5000/admin/api/offer/update-status/${id}`, {
                Status: newStatus,
            })
            console.log("✅ API Response:", response);  // 👈 ADD THIS

            setStatusMessage(response.data.message || "Status updated successfully.");
            setStatusType("success");
            fetchOffer(); // Refresh list
        } catch (error) {
            console.error("❌ Error:", error);  // 👈 ADD THIS TOO
            setStatusMessage("Failed to update status.");
            setStatusType("error");
        }
    };

    return (
        <div className="manage-offers-container">
            {/* <div className="detail">
                Total Offers &nbsp;: &nbsp; {offers.length}
                {offers.length > 0 ? (
                    <>
                        <span className="separator">||</span> Active Offers : {offers.filter(offer => offer.Status === "active").length}
                        <span className="separator">||</span> Inactive Offers: {offers.filter(offer => offer.Status === "inactive").length}
                    </>
                ) : (
                    <p>No offers found</p>
                )}
            </div> */}
            <div className="detail">
                Total Offers &nbsp; : &nbsp; {offers.length} &nbsp;&nbsp;&nbsp; || &nbsp;&nbsp;&nbsp;
                Active Offers &nbsp;: &nbsp; {offers.filter(offer => offer.Status === "active").length} &nbsp;&nbsp;&nbsp; ||&nbsp;&nbsp;&nbsp;
                Inactive Offers &nbsp; : &nbsp; {offers.filter(offer => offer.Status === "inactive").length}
            </div>

            {statusMessage && (
                <div className={`status-message ${statusType === "success" ? "success" : "error"}`}>
                    {statusMessage}
                </div>
            )}

            <h1>{editingOfferId ? "Edit Offer" : "Add New Offer"}</h1>
            <ViewDetails data={selectedRow} onClose={handleClose} />

            <form onSubmit={handleOfferSubmit} className="offer-form">
                <div className="form-group">
                    <input
                        value={offerDetails.Title}
                        onChange={changeHandler}
                        type="text"
                        name="Title"
                        placeholder="Enter title"
                    />
                    {errors.title && <span className="error">{errors.title}</span>}
                </div>

                <div className="form-group">
                    <input
                        value={offerDetails.MaxDiscount}
                        onChange={changeHandler}
                        type="number"
                        name="MaxDiscount"
                        placeholder="Enter max discount"
                    />
                    {errors.maxdiscount && <span className="error">{errors.maxdiscount}</span>}
                </div>

                <div className="form-group">
                    <input
                        value={offerDetails.MinDiscount}
                        onChange={changeHandler}
                        type="number"
                        name="MinDiscount"
                        placeholder="Enter min discount"
                    />
                    {errors.mindiscount && <span className="error">{errors.mindiscount}</span>}
                </div>

                <div className="form-group">
                    <input
                        value={offerDetails.Discount}
                        onChange={changeHandler}
                        type="number"
                        name="Discount"
                        placeholder="Enter total discount"
                    />
                    {errors.discount && <span className="error">{errors.discount}</span>}
                </div>

                <div className="form-group">
                    <select name="Status" value={offerDetails.Status} onChange={changeHandler}>
                        <option value="">Select Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    {errors.status && <span className="error">{errors.status}</span>}
                </div>

                <div className="form-group">
                    <textarea
                        value={offerDetails.Offer_Discription}
                        onChange={changeHandler}
                        name="Offer_Discription"
                        placeholder="Enter offer description"
                        rows="3"
                    />
                    {errors.offer_discription && <span className="error">{errors.offer_discription}</span>}
                </div>

                <div className="form-group">
                    <p>Offer Image</p>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={changeHandler}
                        name="ImageURI"
                    />
                </div>

                {imagePreview && (
                    <div className="image-preview">
                        <p>Image Preview:</p>
                        <img src={imagePreview} alt="Offer Preview" />
                    </div>
                )}

                <button type="submit" className="submit-btn">
                    {editingOfferId ? 'Update Offer' : 'Add Offer'}
                </button>
            </form>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search offers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="offers-table">
                <h3>Offers List</h3>
                <ReusableDataTable
                    title="Offer List"
                    columns={columns}
                    data={offers.filter((offer) => {
                        const title = offer?.Title?.toLowerCase() || '';
                        const description = offer?.Offer_Discription?.toLowerCase() || '';
                        const discount = offer?.Discount?.toString() || '';
                        const minDiscount = offer?.MinDiscount?.toString() || '';
                        const maxDiscount = offer?.MaxDiscount?.toString() || '';

                        return (
                            title.includes(searchTerm.toLowerCase()) ||
                            description.includes(searchTerm.toLowerCase()) ||
                            discount.includes(searchTerm) ||
                            minDiscount.includes(searchTerm) ||
                            maxDiscount.includes(searchTerm)
                        );
                    })}
                    searchble={true}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />
            </div>
        </div>
    );
};

export default ManageOffers;