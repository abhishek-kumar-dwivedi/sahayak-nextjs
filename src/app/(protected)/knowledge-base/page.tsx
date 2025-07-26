
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, File, Video, Trash2, Library } from 'lucide-react';
import { useTranslations } from '@/context/locale-context';
import Image from 'next/image';
import initialFiles from '@/data/knowledge-base.json';

type KnowledgeFile = {
  id: number;
  name: string;
  type: 'pdf' | 'video';
  size: string;
};

export default function KnowledgeBasePage() {
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const t = useTranslations();
  
  useEffect(() => {
    // In a real app, this would be an API call.
    // For now, we load from the JSON file.
    setFiles(initialFiles);
  }, []);


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      const fileType = uploadedFile.type.includes('pdf') ? 'pdf' : 'video';
      const newFile: KnowledgeFile = {
        id: Date.now(),
        name: uploadedFile.name,
        type: fileType,
        size: `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`,
      };
      setFiles((prevFiles) => [...prevFiles, newFile]);
      setIsUploading(false);
      toast({
        title: t('fileUploaded'),
        description: t('fileUploadedDesc').replace('{fileName}', uploadedFile.name),
      });
    }, 1500);
  };

  const handleDeleteFile = (fileId: number) => {
    const fileToDelete = files.find(file => file.id === fileId);
    if (!fileToDelete) return;

    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    toast({
      variant: 'destructive',
      title: t('fileDeleted'),
      description: t('fileDeletedDesc').replace('{fileName}', fileToDelete.name),
    });
  };
  
  return (
    <main className="container mx-auto p-4 animate-fade-in-slow">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-6">
           <div className="inline-block bg-primary/10 text-primary p-3 rounded-full mb-4">
            <Library className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold font-headline">{t('knowledgeBase')}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            {t('knowledgeBaseDesc')}
          </p>
        </header>

        <div className="grid gap-4">
          <Card className="shadow-sm animate-slide-in-from-left">
            <CardHeader>
              <CardTitle>{t('uploadNewMaterial')}</CardTitle>
              <CardDescription>{t('uploadNewMaterialDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="file-upload" className="group cursor-pointer">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-lg p-6 text-center hover:border-primary transition-colors duration-300 bg-background hover:bg-primary/5">
                   <div className="bg-primary/10 text-primary p-3 rounded-full mb-4 group-hover:scale-105 transition-transform duration-300">
                    <Upload className="h-8 w-8" />
                  </div>
                  <p className="text-md font-semibold text-primary">{t('chooseFiles')}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t('dragAndDrop')}</p>
                  <Input 
                    id="file-upload" 
                    type="file" 
                    className="sr-only" 
                    onChange={handleFileUpload} 
                    accept=".pdf,video/*" 
                    disabled={isUploading}
                  />
                   {isUploading && <p className="mt-4 text-sm text-primary animate-pulse">{t('uploading')}</p>}
                </div>
              </Label>
            </CardContent>
          </Card>

          <Card className="shadow-sm animate-slide-in-from-right">
            <CardHeader>
              <CardTitle>{t('uploadedMaterials')}</CardTitle>
              <CardDescription>{t('uploadedMaterialsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.length > 0 ? (
                  files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 rounded-lg bg-card border hover:bg-accent transition-colors duration-200 hover:shadow-md animate-fade-in">
                      <div className="flex items-center gap-3">
                        {file.type === 'pdf' ? <File className="h-5 w-5 text-primary" /> : <Video className="h-5 w-5 text-primary" />}
                        <div>
                          <p className="font-semibold text-foreground text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.size}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteFile(file.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                      </Button>
                    </div>
                  ))
                ) : (
                   <div className="text-center py-12">
                    <Image src="https://placehold.co/400x300.png" alt="Empty state" width={300} height={225} className="mx-auto rounded-lg mb-6 opacity-60" data-ai-hint="empty folder illustration" />
                    <p className="font-semibold text-muted-foreground">{t('emptyKnowledgeBase')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
