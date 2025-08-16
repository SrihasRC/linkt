'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import { Upload, Link2, Copy, Download, FileText, ImageIcon, Code, Clock, Zap, Shield, QrCode } from "lucide-react";

export default function Home() {
  const searchParams = useSearchParams();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [shareCode, setShareCode] = useState<string>("");
  const [clipboardText, setClipboardText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [textShareCode, setTextShareCode] = useState("");
  const [textUploading, setTextUploading] = useState(false);

  // Handle URL parameters for direct access
  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setAccessCode(codeParam.toUpperCase());
    }
  }, [searchParams]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await uploadFile(files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadedFile(file);
    
    // Show upload started toast
    toast.loading("Uploading file...", { id: "upload" });
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShareCode(result.shareCode);
        setDownloadUrl(result.downloadUrl);
        toast.success("File uploaded successfully!", { 
          id: "upload",
          description: `Share code: ${result.shareCode}`
        });
      } else {
        console.error('Upload failed:', result.error);
        toast.error("Upload failed", { 
          id: "upload",
          description: result.error || "Please try again"
        });
        // Reset states on error
        setUploadedFile(null);
        setShareCode("");
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Upload failed", { 
        id: "upload",
        description: "Network error. Please check your connection."
      });
      setUploadedFile(null);
      setShareCode("");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      uploadFile(files[0]);
    }
  };

  const handleAccessFile = async () => {
    if (!accessCode.trim()) return;
    
    toast.loading("Accessing file...", { id: "download" });
    
    try {
      const response = await fetch(`/api/download/${accessCode.toUpperCase()}`);
      
      if (response.ok) {
        // Create download link
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = ''; // Browser will use filename from Content-Disposition header
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success("File downloaded!", { 
          id: "download",
          description: "Check your downloads folder"
        });
      } else {
        const error = await response.json();
        const errorMessage = error.error === "File not found or expired" 
          ? "File not found or expired" 
          : error.error === "File has expired"
          ? "File has expired"
          : "Invalid share code";
          
        toast.error("Download failed", { 
          id: "download",
          description: errorMessage
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Download failed", { 
        id: "download",
        description: "Network error. Please try again."
      });
    }
  };

  const handleShareText = async () => {
    if (!clipboardText.trim()) return;
    
    setTextUploading(true);
    toast.loading("Sharing text...", { id: "text-share" });
    
    try {
      const response = await fetch('/api/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: clipboardText,
          language: 'text' // Could be detected based on content
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTextShareCode(result.shareCode);
        toast.success("Text shared successfully!", { 
          id: "text-share",
          description: `Share code: ${result.shareCode}`
        });
      } else {
        console.error('Text share failed:', result.error);
        toast.error("Text sharing failed", { 
          id: "text-share",
          description: result.error || "Please try again"
        });
      }
    } catch (error) {
      console.error('Text share error:', error);
      toast.error("Text sharing failed", { 
        id: "text-share",
        description: "Network error. Please try again."
      });
    } finally {
      setTextUploading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return <ImageIcon className="w-5 h-5" />;
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'cpp', 'java'].includes(ext || '')) return <Code className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="border-b border-border/20 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Linkt
              </h1>
            </div>
            <Badge variant="secondary" className="glass-subtle">
              <Zap className="w-3 h-3 mr-1" />
              No signup required
            </Badge>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary/80 to-foreground bg-clip-text text-transparent">
              Share files & text instantly
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Upload from your lab computer, access from anywhere. Zero friction, maximum speed.
              <br />Files auto-delete in 24 hours for complete privacy.
            </p>
          </div>

          {/* Main Interface */}
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass mb-8 h-12">
              <TabsTrigger value="upload" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload File</span>
                <span className="sm:hidden">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="access" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Access File</span>
                <span className="sm:hidden">Access</span>
              </TabsTrigger>
              <TabsTrigger value="clipboard" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Clipboard</span>
                <span className="sm:hidden">Text</span>
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload">
              <Card className="glass-strong glow-soft">
                <CardContent className="p-8">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="*/*"
                  />
                  <div
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${
                      dragActive 
                        ? 'border-primary bg-primary/10 glow-primary' 
                        : 'border-border/40 hover:border-primary/50 hover:bg-accent/5'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !uploading && document.getElementById('file-upload')?.click()}
                  >
                    {uploading ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center glow-primary animate-pulse">
                          <Upload className="w-8 h-8 text-primary animate-bounce" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Uploading...</h3>
                          <p className="text-muted-foreground">Please wait while we process your file</p>
                        </div>
                      </div>
                    ) : uploadedFile && shareCode ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center glow-primary">
                          {getFileIcon(uploadedFile.name)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{uploadedFile.name}</h3>
                          <p className="text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <div className="bg-muted/20 rounded-lg p-4 max-w-sm mx-auto">
                          <p className="text-sm text-muted-foreground mb-2">Your share code:</p>
                          <div className="flex items-center gap-2 mb-4">
                            <code className="text-2xl font-mono font-bold tracking-wider text-primary">{shareCode}</code>
                            <Button size="sm" variant="ghost" className="hover-glow">
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-2">QR Code for mobile access:</p>
                            <div className="inline-block p-2 bg-white rounded-lg">
                              <QRCodeGenerator 
                                text={`${window.location.origin}/?code=${shareCode}`}
                                size={120}
                                className="mx-auto"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          Expires in 24 hours
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-20 h-20 mx-auto rounded-full bg-muted/20 flex items-center justify-center">
                          <Upload className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">Drop your file here</h3>
                          <p className="text-muted-foreground mb-4">
                            or click to browse (max 100MB)
                          </p>
                          <Button className="hover-glow">
                            <Upload className="w-4 h-4 mr-2" />
                            Choose File
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Access Tab */}
            <TabsContent value="access">
              <Card className="glass-strong glow-soft">
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4 glow-primary">
                    <Download className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Access Your Files</CardTitle>
                  <CardDescription className="text-base">
                    Enter your 6-digit code or paste the direct link
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-8 pb-8">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      6-Digit Code
                    </label>
                    <Input 
                      placeholder="ABC123" 
                      className="glass text-center text-2xl tracking-[0.3em] uppercase font-mono h-14"
                      maxLength={6}
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-border/30"></div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">or</span>
                    <div className="flex-1 h-px bg-border/30"></div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Direct Link
                    </label>
                    <Input 
                      placeholder="https://linkt.app/f/xyz..." 
                      className="glass h-12"
                    />
                  </div>
                  
                  <Button className="w-full h-12 text-base hover-glow" onClick={handleAccessFile} disabled={!accessCode.trim()}>
                    <Download className="w-5 h-5 mr-3" />
                    Access File
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Clipboard Tab */}
            <TabsContent value="clipboard">
              <Card className="glass-strong glow-soft">
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4 glow-primary">
                    <Copy className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Universal Clipboard</CardTitle>
                  <CardDescription className="text-base">
                    Share text, code snippets, or notes between your devices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-8 pb-8">
                  <Textarea 
                    placeholder="Paste your text, code, or notes here..."
                    className="min-h-40 glass font-mono text-sm resize-none"
                    value={clipboardText}
                    onChange={(e) => setClipboardText(e.target.value)}
                  />
                  
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 h-12 hover-glow" 
                      disabled={!clipboardText.trim() || textUploading}
                      onClick={handleShareText}
                    >
                      <Link2 className="w-5 h-5 mr-3" />
                      {textUploading ? "Sharing..." : "Share Text"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="glass px-4"
                      onClick={() => copyToClipboard(clipboardText)}
                      disabled={!clipboardText.trim()}
                    >
                      <Copy className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  {textShareCode && (
                    <div className="bg-muted/10 rounded-lg p-4 border border-primary/20 glow-soft">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-primary">✨ Text Shared Successfully!</span>
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          24h
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-card/20 rounded p-3">
                          <p className="text-xs text-muted-foreground mb-1">Share Code:</p>
                          <div className="flex items-center gap-2">
                            <code className="text-lg font-mono font-bold tracking-wider text-primary">{textShareCode}</code>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="hover-glow h-6 w-6 p-0"
                              onClick={() => copyToClipboard(textShareCode)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="bg-card/20 rounded p-3">
                          <p className="text-xs text-muted-foreground mb-1">Direct Link:</p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-muted-foreground truncate flex-1">
                              {window.location.origin}/t/{textShareCode}
                            </code>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="hover-glow h-6 w-6 p-0"
                              onClick={() => copyToClipboard(`${window.location.origin}/t/${textShareCode}`)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-card/20 rounded p-3 text-center">
                          <p className="text-xs text-muted-foreground mb-2">QR Code:</p>
                          <div className="inline-block p-2 bg-white rounded">
                            <QRCodeGenerator 
                              text={`${window.location.origin}/t/${textShareCode}`}
                              size={100}
                              className="mx-auto"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {clipboardText.trim() && !textShareCode && (
                    <div className="bg-muted/10 rounded-lg p-4 border border-border/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Preview</span>
                        <Badge variant="secondary" className="text-xs">
                          {clipboardText.length} characters
                        </Badge>
                      </div>
                      <div className="text-sm font-mono bg-card/20 rounded p-3 max-h-24 overflow-y-auto">
                        {clipboardText.slice(0, 200)}
                        {clipboardText.length > 200 && "..."}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="glass-subtle text-center p-6">
              <div className="w-12 h-12 mx-auto rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Instant Access</h3>
              <p className="text-sm text-muted-foreground">No signup, no waiting. Upload and share immediately.</p>
            </Card>
            
            <Card className="glass-subtle text-center p-6">
              <div className="w-12 h-12 mx-auto rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Auto-Delete</h3>
              <p className="text-sm text-muted-foreground">Files disappear after 24 hours for maximum privacy.</p>
            </Card>
            
            <Card className="glass-subtle text-center p-6">
              <div className="w-12 h-12 mx-auto rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Privacy First</h3>
              <p className="text-sm text-muted-foreground">No tracking, no analytics, just secure file sharing.</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
