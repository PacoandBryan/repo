import React, { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';

// File validation constants
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
const ALLOWED_DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
const DEFAULT_CHUNK_SIZE = 1 * 1024 * 1024; // 1MB
const MAX_RETRIES = 3;

interface FileUploadProps {
  onUploadComplete: (fileData: FileData) => void;
  onError?: (error: any) => void;
  entityType?: string;
  entityId?: string;
  allowMultiple?: boolean;
  allowedTypes?: 'image' | 'document' | 'all';
  maxFiles?: number;
  maxSize?: number;
  useChunkedUpload?: boolean;
  chunkSize?: number;
  showPreview?: boolean;
  className?: string;
  dropzoneText?: string;
  buttonText?: string;
}

export interface FileData {
  id: string;
  originalFilename: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

interface FileUploadState {
  files: File[];
  uploading: boolean;
  progress: { [key: string]: number };
  errors: { [key: string]: string };
  previews: { [key: string]: string };
  uploadedFiles: FileData[];
}

interface ValidationResult {
  valid: boolean;
  errors: { [key: string]: string };
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onError,
  entityType = '',
  entityId = '',
  allowMultiple = false,
  allowedTypes = 'all',
  maxFiles = 10,
  maxSize,
  useChunkedUpload = true,
  chunkSize = DEFAULT_CHUNK_SIZE,
  showPreview = true,
  className = '',
  dropzoneText = 'Drag & drop files here or click to browse',
  buttonText = 'Upload Files'
}) => {
  const [state, setState] = useState<FileUploadState>({
    files: [],
    uploading: false,
    progress: {},
    errors: {},
    previews: {},
    uploadedFiles: []
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  
  // Set allowed file extensions based on allowedTypes
  const getAllowedExtensions = useCallback(() => {
    if (allowedTypes === 'image') {
      return ALLOWED_IMAGE_EXTENSIONS;
    } else if (allowedTypes === 'document') {
      return ALLOWED_DOCUMENT_EXTENSIONS;
    } else {
      return [...ALLOWED_IMAGE_EXTENSIONS, ...ALLOWED_DOCUMENT_EXTENSIONS];
    }
  }, [allowedTypes]);
  
  // Get max file size based on type
  const getMaxSize = useCallback((file: File) => {
    if (maxSize) {
      return maxSize;
    }
    
    return file.type.startsWith('image/') ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE;
  }, [maxSize]);
  
  // Validate file
  const validateFile = useCallback((file: File): ValidationResult => {
    const errors: { [key: string]: string } = {};
    const allowedExtensions = getAllowedExtensions();
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    // Check file extension
    if (!allowedExtensions.includes(extension)) {
      errors.extension = `File type .${extension} is not allowed`;
    }
    
    // Check file size
    const maxFileSize = getMaxSize(file);
    if (file.size > maxFileSize) {
      const sizeInMB = maxFileSize / (1024 * 1024);
      errors.size = `File exceeds maximum size of ${sizeInMB}MB`;
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }, [getAllowedExtensions, getMaxSize]);
  
  // Create file preview
  const createPreview = useCallback((file: File): string => {
    return URL.createObjectURL(file);
  }, []);
  
  // Handle file select
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }
    
    setState(prev => {
      const newFiles: File[] = [];
      const newPreviews: { [key: string]: string } = { ...prev.previews };
      const newErrors: { [key: string]: string } = { ...prev.errors };
      
      // Convert FileList to array and validate each file
      Array.from(selectedFiles).forEach(file => {
        const { valid, errors } = validateFile(file);
        
        if (valid) {
          newFiles.push(file);
          
          if (showPreview) {
            newPreviews[file.name] = createPreview(file);
          }
        } else {
          newErrors[file.name] = Object.values(errors).join(', ');
        }
      });
      
      // Check max files limit
      const totalFiles = prev.files.length + newFiles.length;
      if (totalFiles > maxFiles) {
        newErrors.maxFiles = `Maximum of ${maxFiles} files allowed`;
        return { ...prev, errors: newErrors };
      }
      
      return {
        ...prev,
        files: allowMultiple ? [...prev.files, ...newFiles] : newFiles,
        previews: newPreviews,
        errors: newErrors
      };
    });
  }, [validateFile, createPreview, allowMultiple, maxFiles, showPreview]);
  
  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    handleFileSelect(e.dataTransfer.files);
    
    if (dropzoneRef.current) {
      dropzoneRef.current.classList.remove('dragover');
    }
  }, [handleFileSelect]);
  
  // Handle dragover
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dropzoneRef.current) {
      dropzoneRef.current.classList.add('dragover');
    }
  }, []);
  
  // Handle dragleave
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dropzoneRef.current) {
      dropzoneRef.current.classList.remove('dragover');
    }
  }, []);
  
  // Handle click on dropzone
  const handleDropzoneClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  
  // Remove file
  const removeFile = useCallback((filename: string) => {
    setState(prev => {
      const newFiles = prev.files.filter(file => file.name !== filename);
      const newPreviews = { ...prev.previews };
      const newErrors = { ...prev.errors };
      
      // Remove preview and error for this file
      delete newPreviews[filename];
      delete newErrors[filename];
      
      return {
        ...prev,
        files: newFiles,
        previews: newPreviews,
        errors: newErrors
      };
    });
  }, []);
  
  // Upload a single file using standard method
  const uploadFile = useCallback(async (file: File): Promise<FileData> => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (entityType) {
      formData.append('entityType', entityType);
    }
    
    if (entityId) {
      formData.append('entityId', entityId);
    }
    
    try {
      const response = await axios.post('/api/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            
            setState(prev => ({
              ...prev,
              progress: {
                ...prev.progress,
                [file.name]: percentCompleted
              }
            }));
          }
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }, [entityType, entityId]);
  
  // Upload a file using chunked method
  const uploadFileChunked = useCallback(async (file: File): Promise<FileData> => {
    // Initialize upload
    const initResponse = await axios.post('/api/uploads/init', {
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      chunkSize: chunkSize,
      totalChunks: Math.ceil(file.size / chunkSize),
      entityType,
      entityId
    });
    
    const { uploadId } = initResponse.data;
    const totalChunks = Math.ceil(file.size / chunkSize);
    let uploadedChunks = 0;
    
    // Upload each chunk
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      
      const formData = new FormData();
      formData.append('file', chunk, file.name);
      formData.append('chunkIndex', chunkIndex.toString());
      
      let retries = 0;
      let success = false;
      
      while (!success && retries < MAX_RETRIES) {
        try {
          const response = await axios.post(`/api/uploads/${uploadId}/chunk`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          if (response.data.status === 'completed') {
            return response.data.file;
          }
          
          uploadedChunks++;
          success = true;
        } catch (error) {
          retries++;
          if (retries >= MAX_RETRIES) {
            throw error;
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Update progress
      const percentCompleted = Math.round((uploadedChunks * 100) / totalChunks);
      setState(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          [file.name]: percentCompleted
        }
      }));
    }
    
    throw new Error('Upload failed to complete');
  }, [chunkSize, entityType, entityId]);
  
  // Upload all files
  const uploadFiles = useCallback(async () => {
    if (state.files.length === 0) {
      return;
    }
    
    setState(prev => ({ ...prev, uploading: true }));
    
    for (const file of state.files) {
      try {
        // Choose upload method based on file size and useChunkedUpload flag
        const fileData = file.size > 5 * 1024 * 1024 && useChunkedUpload
          ? await uploadFileChunked(file)
          : await uploadFile(file);
        
        setState(prev => ({
          ...prev,
          uploadedFiles: [...prev.uploadedFiles, fileData]
        }));
        
        // Call onUploadComplete for each file
        onUploadComplete(fileData);
      } catch (error) {
        console.error('Error uploading file:', error);
        
        setState(prev => ({
          ...prev,
          errors: {
            ...prev.errors,
            [file.name]: 'Failed to upload file'
          }
        }));
        
        if (onError) {
          onError(error);
        }
      }
    }
    
    setState(prev => ({ 
      ...prev, 
      uploading: false,
      files: [],
      progress: {},
      previews: {}
    }));
  }, [state.files, uploadFile, uploadFileChunked, useChunkedUpload, onUploadComplete, onError]);
  
  // Clean up previews on unmount
  useEffect(() => {
    return () => {
      Object.values(state.previews).forEach(preview => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [state.previews]);
  
  return (
    <div className={`file-upload ${className}`}>
      <div
        ref={dropzoneRef}
        className={`dropzone ${state.uploading ? 'uploading' : ''}`}
        onClick={handleDropzoneClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          multiple={allowMultiple}
          accept={getAllowedExtensions().map(ext => `.${ext}`).join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <div className="dropzone-content">
          <div className="dropzone-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 15V16C3 18.2091 4.79086 20 7 20H17C19.2091 20 21 18.2091 21 16V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="dropzone-text">{dropzoneText}</p>
          <p className="dropzone-hint">
            {allowedTypes === 'image' 
              ? `Allowed image types: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`
              : allowedTypes === 'document'
                ? `Allowed document types: ${ALLOWED_DOCUMENT_EXTENSIONS.join(', ')}`
                : `Allowed types: ${getAllowedExtensions().join(', ')}`
            }
          </p>
        </div>
      </div>
      
      {Object.keys(state.errors).length > 0 && (
        <div className="upload-errors">
          {Object.entries(state.errors).map(([filename, error]) => (
            <div key={filename} className="error-item">
              <span className="error-filename">{filename}:</span> {error}
            </div>
          ))}
        </div>
      )}
      
      {state.files.length > 0 && (
        <div className="selected-files">
          <h4>Selected Files</h4>
          <div className="file-list">
            {state.files.map((file) => (
              <div key={file.name} className="file-item">
                <div className="file-item-preview">
                  {showPreview && state.previews[file.name] && file.type.startsWith('image/') ? (
                    <img src={state.previews[file.name]} alt={file.name} />
                  ) : (
                    <div className="file-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13 2V9H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="file-item-info">
                  <div className="file-item-name">{file.name}</div>
                  <div className="file-item-size">{(file.size / 1024).toFixed(2)} KB</div>
                  {state.progress[file.name] !== undefined && (
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${state.progress[file.name]}%` }}
                      />
                      <span className="progress-text">{state.progress[file.name]}%</span>
                    </div>
                  )}
                </div>
                <button 
                  type="button" 
                  className="remove-file" 
                  onClick={() => removeFile(file.name)}
                  disabled={state.uploading}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div className="upload-actions">
            <button 
              type="button"
              className="upload-button"
              onClick={uploadFiles}
              disabled={state.uploading || state.files.length === 0}
            >
              {state.uploading ? 'Uploading...' : buttonText}
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .file-upload {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          width: 100%;
          margin-bottom: 20px;
        }
        
        .dropzone {
          border: 2px dashed #ccc;
          border-radius: 4px;
          padding: 30px;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
          margin-bottom: 15px;
          background-color: #f9f9f9;
        }
        
        .dropzone:hover, .dropzone.dragover {
          border-color: #2d9cdb;
          background-color: rgba(45, 156, 219, 0.05);
        }
        
        .dropzone.uploading {
          opacity: 0.7;
          pointer-events: none;
        }
        
        .dropzone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .dropzone-icon {
          color: #666;
          margin-bottom: 10px;
        }
        
        .dropzone-text {
          margin: 0 0 5px;
          font-size: 16px;
          color: #333;
        }
        
        .dropzone-hint {
          margin: 0;
          font-size: 12px;
          color: #666;
        }
        
        .upload-errors {
          margin-top: 10px;
          color: #d32f2f;
          font-size: 14px;
        }
        
        .error-item {
          margin-bottom: 5px;
        }
        
        .error-filename {
          font-weight: bold;
        }
        
        .selected-files {
          margin-top: 20px;
        }
        
        .selected-files h4 {
          margin-top: 0;
          margin-bottom: 10px;
          color: #333;
        }
        
        .file-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .file-item {
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        
        .file-item-preview {
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          background-color: #f5f5f5;
          border-radius: 2px;
          overflow: hidden;
        }
        
        .file-item-preview img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .file-icon {
          color: #888;
        }
        
        .file-item-info {
          display: flex;
          flex-direction: column;
        }
        
        .file-item-name {
          font-size: 14px;
          margin-bottom: 5px;
          word-break: break-all;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .file-item-size {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }
        
        .progress-bar {
          height: 4px;
          background-color: #e0e0e0;
          border-radius: 2px;
          overflow: hidden;
          position: relative;
        }
        
        .progress-fill {
          height: 100%;
          background-color: #2d9cdb;
          transition: width 0.3s ease;
        }
        
        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 10px;
          color: #333;
        }
        
        .remove-file {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1;
        }
        
        .remove-file:hover {
          background-color: rgba(0, 0, 0, 0.7);
        }
        
        .upload-actions {
          margin-top: 15px;
          display: flex;
          justify-content: flex-end;
        }
        
        .upload-button {
          background-color: #2d9cdb;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .upload-button:hover {
          background-color: #2086c3;
        }
        
        .upload-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default FileUpload; 