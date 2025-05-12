import React from 'react'
import DataTable from "react-data-table-component";
import "../assets/mainCSS.css";
export default function ReusableDataTable ({ columns, data, title = "", searchable = true, searchTerm = "", onSearchChange }) {
    return (
        <div>
            <div className='datatable-header'>
                {title || 'DataTable'}
            </div>

            {/* {searchable && (
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            )} */}
            

            <DataTable
                columns={columns}
                data={data}
                pagination
                className="custom-datatable"
                highlightOnHover
                pointerOnHover
                striped
                responsive
                customStyles={{
                    table: {
                        style: {
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                        },
                    },
                    head: {
                        style: {
                            fontSize: '16px',
                            fontWeight: 'bold',
                        },
                    },
                    headRow: {
                        style: {
                            backgroundColor: '#007bff',
                            color: '#fff',
                            borderBottom: 'none',
                            minHeight: '56px',
                        },
                    },
                    headCells: {
                        style: {
                            padding: '12px 16px',
                            color: '#fff',
                            fontSize: '14px',
                            textAlign: 'center',
                        },
                    },
                    rows: {
                        style: {
                            minHeight: '48px',
                            fontSize: '14px',
                            color: '#333',
                            backgroundColor: '#fff',
                            '&:hover': {
                                backgroundColor: '#f1f9ff',
                            },
                        },
                    },
                    cells: {
                        style: {
                            padding: '12px 16px',
                            textAlign: 'center',
                            borderBottom: '1px solid #eee',
                        },
                    },
                    pagination: {
                        style: {
                            borderTop: '1px solid #ddd',
                            padding: '8px',
                            justifyContent: 'center',
                        },
                    },
                }}
            />
        </div>
    )
}
