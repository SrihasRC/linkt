"use client";

import { useState } from "react";
import { Upload, Link2, Clipboard, Timer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [dragActive, setDragActive] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // TODO: Handle file upload
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Hero Section */}
      <div className="text-center mb-8 space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Link2 className="h-8 w-8 text-primary glow-primary" />
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Linkt
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Ultra-simple file & clipboard sharing between your devices
        </p>
        <p className="text-sm text-muted-foreground">
          No signup required • Auto-expires in 24 hours • Works everywhere
        </p>
      </div>

      {/* Main Interface */}
      <div className="w-full max-w-4xl">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass-strong rounded-2xl p-2 mb-8">
            <TabsTrigger 
              value="upload" 
              className="rounded-xl data-[state=active]:glass-strong data-[state=active]:glow-soft transition-all duration-300"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </TabsTrigger>
            <TabsTrigger 
              value="clipboard" 
              className="rounded-xl data-[state=active]:glass-strong data-[state=active]:glow-soft transition-all duration-300"
            >
              <Clipboard className="h-4 w-4 mr-2" />
              Clipboard
            </TabsTrigger>
            <TabsTrigger 
              value="access" 
              className="rounded-xl data-[state=active]:glass-strong data-[state=active]:glow-soft transition-all duration-300"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Access Files
            </TabsTrigger>
          </TabsList>

          {/* File Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card className="glass-strong rounded-3xl border-0 hover-glow">
              <CardContent className="p-8">
                <div
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                    dragActive 
                      ? "border-primary bg-primary/5 glow-primary" 
                      : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Drop files here</h3>
                  <p className="text-muted-foreground mb-4">
                    Or click to select files (up to 100MB each)
                  </p>
                  <Button size="lg" className="rounded-xl glass hover-glow">
                    Select Files
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upload Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="glass rounded-2xl border-0 hover-glow">
                <CardContent className="p-6">
                  <Timer className="h-8 w-8 text-accent mb-3" />
                  <h4 className="font-semibold mb-2">Auto Expiry</h4>
                  <p className="text-sm text-muted-foreground">
                    Files automatically delete after 24 hours
                  </p>
                </CardContent>
              </Card>

              <Card className="glass rounded-2xl border-0 hover-glow">
                <CardContent className="p-6">
                  <Link2 className="h-8 w-8 text-accent mb-3" />
                  <h4 className="font-semibold mb-2">Instant Sharing</h4>
                  <p className="text-sm text-muted-foreground">
                    Get a 6-digit code or shareable link instantly
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clipboard Tab */}
          <TabsContent value="clipboard" className="space-y-6">
            <Card className="glass-strong rounded-3xl border-0 hover-glow">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Share Text or Code</h3>
                  <textarea
                    placeholder="Paste your text, code snippets, notes, or anything here..."
                    className="w-full h-64 p-4 bg-card/50 border border-border/30 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Supports syntax highlighting for code
                    </p>
                    <Button className="rounded-xl glass hover-glow">
                      Share Text
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Access Files Tab */}
          <TabsContent value="access" className="space-y-6">
            <Card className="glass-strong rounded-3xl border-0 hover-glow">
              <CardContent className="p-8 text-center">
                <Share2 className="h-16 w-16 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-4">Access Your Files</h3>
                <div className="space-y-4 max-w-md mx-auto">
                  <input
                    type="text"
                    placeholder="Enter 6-digit code (e.g., ABC123)"
                    className="w-full p-4 text-center text-2xl font-mono bg-card/50 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm uppercase tracking-wider"
                    maxLength={6}
                  />
                  <Button size="lg" className="w-full rounded-xl glass hover-glow">
                    Access Files
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Enter the code you received when uploading files
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-sm text-muted-foreground">
        <p>Made with ❤️ for seamless file sharing • No tracking • Privacy-first</p>
      </div>
    </div>
  );
}
