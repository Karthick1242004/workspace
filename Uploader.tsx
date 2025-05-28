import React, { useEffect, useState, useRef } from "react"
import Uppy from "@uppy/core"
import { Upload, X } from "lucide-react"
import "@uppy/core/dist/style.min.css"
import "@uppy/dashboard/dist/style.min.css"

// Create a function to generate a new Uppy instance
const createUppy = (id: string, allowMultiple: boolean = false) => {
  return new Uppy({
    id: id,
    autoProceed: false,
    restrictions: {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedFileTypes: [".jpg", ".jpeg", ".png", ".svg", ".pdf", ".docx", ".doc", ".txt", ".xlsx", ".xls"],
      maxNumberOfFiles: allowMultiple ? undefined : 1, // Limit to 1 file if not multiple
    },
  });
};

interface CustomUploaderProps {
  id: string;
  accept?: string;
  label?: string;
  multiple?: boolean;
  fieldName?: string;
  onFilesChange?: (files: any[]) => void;
}

export default function CustomUploader({ 
  id, 
  accept = ".jpg,.jpeg,.png,.svg,.pdf", 
  label = "Choose a file or drag & drop it here",
  multiple = false,
  fieldName = "file",
  onFilesChange
}: CustomUploaderProps) {
  const [files, setFiles] = useState<any[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uppyRef = useRef<ReturnType<typeof createUppy>>(createUppy(id, multiple))

  useEffect(() => {
    const uppy = uppyRef.current;
    
    const handleFileAdded = (file: any) => {
      if (!multiple && files.length > 0) {
        files.forEach(existingFile => {
          uppy.removeFile(existingFile.id);
        });
        setFiles([file]); 
        onFilesChange?.([file]);
      } else {
        setFiles(prevFiles => {
          const newFiles = [...prevFiles, file];
          onFilesChange?.(newFiles);
          return newFiles;
        });
      }
    }

    const handleFileRemoved = (file: any) => {
      setFiles(prevFiles => {
        const newFiles = prevFiles.filter(f => f.id !== file.id);
        onFilesChange?.(newFiles);
        return newFiles;
      });
    }

    uppy.on('file-added', handleFileAdded)
    uppy.on('file-removed', handleFileRemoved)
    return () => {
      uppy.off('file-added', handleFileAdded)
      uppy.off('file-removed', handleFileRemoved)
      uppy.getFiles().forEach(file => uppy.removeFile(file.id))
    }
  }, [])

  const removeFile = (fileId: string) => {
    try {
      const uppy = uppyRef.current;
      uppy.removeFile(fileId)
      setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId))
    } catch (error) {
      console.error('Error removing file:', error)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const uppy = uppyRef.current;
      if (!multiple && files.length > 0) {
        files.forEach(file => {
          uppy.removeFile(file.id);
        });
        setFiles([]);
      }
      
      const filesToProcess = !multiple 
        ? [e.dataTransfer.files[0]] 
        : Array.from(e.dataTransfer.files);
      
      filesToProcess.forEach((file) => {
        uppy.addFile({
          name: file.name,
          type: file.type,
          data: file,
        })
      })
    }
  }

  const handleBrowseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uppy = uppyRef.current;
      if (!multiple && files.length > 0) {
        files.forEach(file => {
          uppy.removeFile(file.id);
        });
        setFiles([]);
      }
      
      Array.from(e.target.files).forEach((file) => {
        uppy.addFile({
          name: file.name,
          type: file.type,
          data: file,
        });
      });
    }
  }

  return (
    <div className={`w-full mx-auto bg-white border border-dashed rounded-md ${
        isDragging ? "border-green-500 bg-green-50" : "border-gray-200"
      }`}>
      <div
        className='px-6 py-3 flex max-w-3xl mx-auto flex-col items-center justify-center'
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-6">
            {files.length > 0 ? (
              <div className="w-16 h-16 border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                {files[0].type.includes("image") ? (
                  <img
                    src={URL.createObjectURL(files[0].data) || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400" />
                )}
              </div>
            ) : (
              <div className="w-16 h-16 border-8 border-gray-200 rounded-md flex items-center justify-center">
                <img src="https://img.freepik.com/free-vector/butterfly-colorful-logo-template_361591-1587.jpg?ga=GA1.1.1951523002.1738084030&semt=ais_hybrid&w=740" alt="Nutrition icon" className="w-10 h-10" />
              </div>
            )}

            
          </div>
          <div className="flex flex-col justify-center items-center w-full">
              <p className="text-gray-700 text-xs">{label}</p>
              <p className="text-xs text-gray-400">JPEG, PNG, JPG, and SVG formats, up to 50MB</p>
            </div>
          <button
            onClick={handleBrowseClick}
            className="px-2 py-2 w-1/4 border text-xs font-unilever-medium border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Browse File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={accept}
            multiple={multiple}
            name={fieldName}
            onChange={handleFileChange}
          />
        </div>

        {files.length > 0 && (
          <div className="mt-4 w-full">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 border border-gray-200 rounded-md mt-2"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-2 flex items-center justify-center">
                    {file.type.includes("image") ? (
                      <img
                        src={URL.createObjectURL(file.data) || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Upload className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <span className="text-sm">{file.name}</span>
                </div>
                <button onClick={() => removeFile(file.id)} className="text-gray-500 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
