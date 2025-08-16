"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FileWithPreview extends File {
  preview?: string;
}

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

export function FileUpload({ onFilesSelected }: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      })
    );
    
    setFiles(prev => [...prev, ...newFiles]);
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md', '.js', '.ts', '.jsx', '.tsx', '.css', '.html', '.json'],
      'application/json': ['.json'],
      'application/javascript': ['.js'],
      'application/typescript': ['.ts'],
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const removeFile = (fileToRemove: FileWithPreview) => {
    setFiles(files => files.filter(file => file !== fileToRemove));
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <Card className="glass-strong rounded-3xl border-0 hover-glow">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
              isDragActive 
                ? "border-primary bg-primary/5 glow-primary" 
                : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className={`h-16 w-16 mx-auto mb-4 transition-colors ${
              isDragActive ? "text-primary" : "text-muted-foreground"
            }`} />
            
            {isDragActive ? (
              <div>
                <h3 className="text-xl font-semibold mb-2 text-primary">Drop files here!</h3>
                <p className="text-muted-foreground">Release to upload your files</p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold mb-2">Drop files here</h3>
                <p className="text-muted-foreground mb-4">
                  Or click to select files (up to 100MB each)
                </p>
                <Button size="lg" className="rounded-xl glass hover-glow">
                  Select Files
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card className="glass rounded-2xl border-0">
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4 flex items-center">
              <File className="h-5 w-5 mr-2" />
              Selected Files ({files.length})
            </h4>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center space-x-4 p-3 glass-subtle rounded-xl">
                  {/* File Preview */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="h-12 w-12 object-cover rounded-lg"
                        onLoad={() => URL.revokeObjectURL(file.preview!)}
                      />
                    ) : (
                      <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                        <File className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0 flex items-center space-x-2">
                    {uploadProgress[file.name] !== undefined ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{uploadProgress[file.name]}%</span>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file)}
                        className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {files.length > 0 && !Object.keys(uploadProgress).length && (
              <Button 
                className="w-full mt-6 rounded-xl glass hover-glow" 
                size="lg"
                onClick={() => {
                  // TODO: Implement actual upload
                  console.log("Uploading files:", files);
                }}
              >
                Upload {files.length} File{files.length !== 1 ? 's' : ''}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
