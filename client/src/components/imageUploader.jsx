import React, { useEffect, useState } from "react";

const ImageUploader = ({ onUpload, previewImage  }) => {
  const [preview, setPreview] = useState(null);
  useEffect(() => {
    if (previewImage) setPreview(previewImage);
  }, [previewImage]);
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      if (onUpload) onUpload(file);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleChange({ target: { files: [file] } });
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border border-dashed border-gray-300 p-3 rounded-lg text-sm text-gray-600 cursor-pointer hover:border-blue-400 transition duration-200 max-w-xs mx-auto"
      style={{display:"flex", justifyContent:"center"}}
    >
      <label className="w-full text-center block">
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          style={{ display: "none" }}
        />
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="w-24 h-24 object-cover rounded-md mx-auto" style={{height:"auto", width:"17vw"}}
          />
        ) : (
          <div>
            <p
              style={{
                height: "9em",
                cursor: "pointer",
                border: "1px dashed #9ea3a5",
                borderRadius: "0.3em",
                padding: "3em",
                width: "7em",
                cursor: "pointer",
              }}
            >
              Перетащи или нажми
            </p>
          </div>
        )}
      </label>
    </div>
  );
};

export default ImageUploader;
