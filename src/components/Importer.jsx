
import React, { useRef, useState } from 'react';

function Importer({ onImport }) {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = (file) => {
        if (!file) return;

        // Check if file has .snbt extension
        if (!file.name.endsWith('.snbt')) {
            alert('Please select a .snbt file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            onImport(event.target.result, file.name);
        };
        reader.readAsText(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        handleFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    return (
        <div className="importer">
            <div
                className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                onClick={() => fileInputRef.current.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <p>
                    {isDragging ? (
                        <>📂 Drop your .snbt file here</>
                    ) : (
                        <>Click or drag & drop .snbt file</>
                    )}
                </p>
                <input
                    type="file"
                    accept=".snbt"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
            </div>
        </div>
    );
}

export default Importer;
