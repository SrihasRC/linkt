'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, FileText, Clock, ArrowLeft, CheckCircle } from "lucide-react";

interface TextData {
  content: string;
  language: string;
  createdAt: string;
  expiresAt: string;
}

export default function TextPage() {
  const params = useParams();
  const router = useRouter();
  const [textData, setTextData] = useState<TextData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const code = params.code as string;

  useEffect(() => {
    const fetchText = async () => {
      try {
        const response = await fetch(`/api/text/${code.toUpperCase()}`);
        const result = await response.json();

        if (result.success) {
          setTextData(result);
        } else {
          setError(result.error || "Text not found");
        }
      } catch {
        setError("Failed to fetch text");
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchText();
    }
  }, [code]);

  const copyToClipboard = async () => {
    if (!textData) return;
    
    try {
      await navigator.clipboard.writeText(textData.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4 animate-pulse">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading text...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass-strong max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/20 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Text Not Found</CardTitle>
            <CardDescription>
              {error === "Text not found or expired" || error === "Text has expired" 
                ? "This text snippet may have expired or the code is invalid."
                : error
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/')} className="hover-glow">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/20 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/')}
              className="hover-glow"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Linkt
            </Button>
            <Badge variant="secondary" className="glass-subtle">
              <FileText className="w-3 h-3 mr-1" />
              Text Snippet
            </Badge>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-strong glow-soft">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4 glow-primary">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Shared Text</CardTitle>
              <CardDescription className="text-base">
                Code: <code className="font-mono font-bold text-primary">{code.toUpperCase()}</code>
              </CardDescription>
              
              {textData && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Badge variant="outline" className="glass-subtle">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimeRemaining(textData.expiresAt)}
                  </Badge>
                  <Badge variant="outline" className="glass-subtle">
                    {textData.content.length} characters
                  </Badge>
                </div>
              )}
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              <div className="space-y-4">
                <div className="bg-card/20 rounded-lg border border-border/20">
                  <pre className="p-6 text-sm font-mono whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
                    {textData?.content}
                  </pre>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 h-12 text-base hover-glow" 
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 mr-3" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              This text will automatically be deleted after 24 hours for privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
