
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, File, Video, Trash2, Library, Loader2 } from 'lucide-react';
import { useTranslations } from '@/context/locale-context';
import { getKnowledgeFiles, addKnowledgeFile, deleteKnowledgeFile } from '@/services/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { NoFilesIllustration } from '@/components/illustrations/no-files';

type KnowledgeFile = {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'other';
  size: string;
};

export default function KnowledgeBasePage() {
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const t = useTranslations();
  
  const fetchFiles = async () => {
      setIsLoading(true);
      try {
        const fetchedFiles = await getKnowledgeFiles() as KnowledgeFile[];
        setFiles(fetchedFiles);
      } catch (e) {
          toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Failed to load knowledge base files.',
          });
      } finally {
        setIsLoading(false);
      }
  }

  useEffect(() => {
    fetchFiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setIsUploading(true);
    
    let fileType: KnowledgeFile['type'] = 'other';
    if (uploadedFile.type.includes('pdf')) {
        fileType = 'pdf';
    } else if (uploadedFile.type.startsWith('video/')) {
        fileType = 'video';
    }

    const newFile = {
      name: uploadedFile.name,
      type: fileType,
      size: `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`,
    };

    try {
        const newId = await addKnowledgeFile(newFile);
        setFiles((prevFiles) => [...prevFiles, { ...newFile, id: newId }]);
        toast({
            title: t('fileUploaded'),
            description: t('fileUploadedDesc').replace('{fileName}', uploadedFile.name),
        });
    } catch(e) {
        toast({ variant: 'destructive', title: t('error'), description: 'Failed to upload file.' });
    } finally {
        setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    setDeletingId(fileId);
    const fileToDelete = files.find(file => file.id === fileId);
    if (!fileToDelete) return;

    try {
        await deleteKnowledgeFile(fileId);
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
        toast({
          variant: 'destructive',
          title: t('fileDeleted'),
          description: t('fileDeletedDesc').replace('{fileName}', fileToDelete.name),
        });
    } catch (e) {
        toast({ variant: 'destructive', title: t('error'), description: 'Failed to delete file.' });
    } finally {
        setDeletingId(null);
    }
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
                    {isUploading ? <Loader2 className="h-8 w-8 animate-spin"/> : <Upload className="h-8 w-8" />}
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
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ) : files.length > 0 ? (
                  files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 rounded-lg bg-card border hover:bg-accent transition-colors duration-200 hover:shadow-md animate-fade-in">
                      <div className="flex items-center gap-3">
                        {file.type === 'pdf' ? <File className="h-5 w-5 text-primary" /> : <Video className="h-5 w-5 text-primary" />}
                        <div>
                          <p className="font-semibold text-foreground text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.size}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteFile(file.id)} disabled={deletingId === file.id}>
                        {deletingId === file.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />}
                      </Button>
                    </div>
                  ))
                ) : (
                   <div className="text-center py-12">
                    <NoFilesIllustration className="w-56 h-40 mx-auto mb-6" />
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

    